import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  ChevronDown,
  Table
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart, Line, Bar, Doughnut } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import { TradingCalendar, type Trade as CalendarTrade } from '../../components/TradingCalendar/TradingCalendar';
import type { DateRange } from '../../types';
import { generateTestTrades } from '../../utils/testTrades';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { MetricsGrid } from '../../components/Metrics/MetricsGrid/MetricsGrid';
import styles from './Dashboard.module.css';
import { SkeletonLoader } from '../../components/SkeletonLoader/SkeletonLoader';
import { FilterControls } from '../../components/FilterControls/FilterControls';
import { GoalProgressSection } from './GoalProgressSection';
import RecentTradesSection from './RecentTradesSection';
import TradingCalendarSection from './TradingCalendarSection';
import type { Trade as DBTrade } from '../../types/trade';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const timeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const chartTypes = [
  { id: 'line', icon: LineChart, label: 'Line' },
  { id: 'bar', icon: BarChart2, label: 'Bar' }
];

export interface NormalizedTrade extends Omit<DBTrade, 'pnl' | 'risk_reward'> {
  pnl: number;
  risk_reward: number;
  entry_date: string;
  followed_plan?: boolean;
  had_setup?: boolean;
  respected_stops?: boolean;
  emotion_score?: number;
  checklist_completed?: number;
  strategy?: string;
  market: string;
}

interface Strategy {
  id: string;
  name: string;
  asset: string;
}

interface SupabaseStrategy {
  id: string;
  name: string;
  asset_name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const calculateAverageHoldingTime = (trades: NormalizedTrade[]) => {
    const holdingTimes = trades
      .filter(t => t.exit_date && t.entry_date)
      .map(t => {
        const entry = new Date(t.entry_date);
        const exit = new Date(t.exit_date!);
        return (exit.getTime() - entry.getTime()) / (1000 * 60); // in minutes
      });

    if (!holdingTimes.length) return '0m';
    
    const avgMinutes = holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length;
    
    if (avgMinutes < 60) return `${Math.round(avgMinutes)}m`;
    if (avgMinutes < 1440) return `${Math.round(avgMinutes / 60)}h`;
    return `${Math.round(avgMinutes / 1440)}d`;
  };

  const calculateMaxDrawdown = (trades: NormalizedTrade[]) => {
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;

    trades.forEach(trade => {
      runningPnL += (trade.pnl || 0);
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return peak === 0 ? 0 : (maxDrawdown / peak) * 100;
  };

  const calculateBestTradingDay = (trades: NormalizedTrade[]) => {
    const dayStats = new Map<string, { wins: number; total: number }>();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    trades.forEach(trade => {
      const day = days[new Date(trade.entry_date).getDay()];
      const stats = dayStats.get(day) || { wins: 0, total: 0 };
      stats.total++;
      if ((trade.pnl || 0) > 0) stats.wins++;
      dayStats.set(day, stats);
    });

    let bestDay = days[0];
    let bestWinRate = 0;

    dayStats.forEach((stats, day) => {
      const winRate = (stats.wins / stats.total) * 100;
      if (winRate > bestWinRate) {
        bestWinRate = winRate;
        bestDay = day;
      }
    });

    return { bestDayOfWeek: bestDay, bestDayWinRate: bestWinRate };
  };

  const [showPercentage, setShowPercentage] = useState(false);
  const [initialBalance] = useState(100000); // This should be fetched from user settings
  const [totalPnL, setTotalPnL] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [avgRiskReward, setAvgRiskReward] = useState(0);
  const [avgHoldingTime, setAvgHoldingTime] = useState('0m');
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [bestDayOfWeek, setBestDayOfWeek] = useState('');
  const [bestDayWinRate, setBestDayWinRate] = useState(0);
  const [expectancy, setExpectancy] = useState(0);
  const [trades, setTrades] = useState<NormalizedTrade[]>([]);
  const [recentTrades, setRecentTrades] = useState<NormalizedTrade[]>([]);
  const [calendarTrades, setCalendarTrades] = useState<CalendarTrade[]>([]);
  const [allTrades, setAllTrades] = useState<NormalizedTrade[]>([]); // Add state for all trades
  const [selectedRange, setSelectedRange] = useState<DateRange>('1M');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [showMetricDetails, setShowMetricDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [strategies, setStrategies] = useState<{ id: string; name: string; asset: string }[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [groupedStrategies, setGroupedStrategies] = useState<Record<string, Strategy[]>>({});

  useEffect(() => {
    if (allTrades.length > 0) {
      calculateMetrics(allTrades);
    }
  }, [allTrades]);

  const calculateMetrics = (trades: NormalizedTrade[]) => {
    if (!trades.length) return;

    // Calculate total P&L
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    setTotalPnL(totalPnL);

    // Calculate win rate
    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    setWinRate(winRate);

    // Calculate average risk/reward
    const avgRiskReward = trades.reduce((sum, trade) => sum + (trade.risk_reward || 0), 0) / trades.length;
    setAvgRiskReward(avgRiskReward);

    // Calculate average holding time
    const avgHoldingTime = trades.reduce((sum, trade) => {
      const entry = new Date(trade.entry_date);
      const exit = trade.exit_date ? new Date(trade.exit_date) : new Date();
      return sum + (exit.getTime() - entry.getTime()) / (1000 * 60 * 60); // Convert to hours
    }, 0) / trades.length;
    setAvgHoldingTime(avgHoldingTime.toFixed(1) + 'h');

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let currentDrawdown = 0;
    trades.forEach(trade => {
      const pnl = trade.pnl || 0;
      peak = Math.max(peak, pnl);
      currentDrawdown = (peak - pnl) / peak * 100;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    });
    setMaxDrawdown(maxDrawdown);

    // Calculate best day of week
    const dayStats = trades.reduce((stats, trade) => {
      const day = new Date(trade.entry_date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!stats[day]) {
        stats[day] = { wins: 0, total: 0 };
      }
      if ((trade.pnl || 0) > 0) {
        stats[day].wins++;
      }
      stats[day].total++;
      return stats;
    }, {} as Record<string, { wins: number; total: number }>);

    let bestDay = '';
    let bestWinRate = 0;
    Object.entries(dayStats).forEach(([day, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      if (winRate > bestWinRate) {
        bestDay = day;
        bestWinRate = winRate;
      }
    });
    setBestDayOfWeek(bestDay);
    setBestDayWinRate(bestWinRate);

    // Calculate expectancy
    const expectancy = trades.reduce((sum, trade) => {
      const pnl = trade.pnl || 0;
      const risk = trade.risk || 0;
      return sum + (pnl / (risk || 1));
    }, 0) / trades.length;
    setExpectancy(expectancy);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  const fetchData = async () => {
    setIsLoadingTrades(true);
    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;

      if (trades) {
        const formattedTrades = trades.map(trade => ({
          ...trade,
          pnl: Number(trade.pnl) || 0,
          risk_reward: Number(trade.risk_reward) || 0,
          entry_date: trade.entry_date || new Date().toISOString(),
          market: trade.market || 'Unknown'
        })) as NormalizedTrade[];

        setAllTrades(formattedTrades);
        setRecentTrades(formattedTrades.slice(0, 5));
        setCalendarTrades(transformTradesForCalendar(formattedTrades));
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoadingTrades(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*');

      if (error) throw error;

      if (strategies) {
        const formattedStrategies = strategies.map(strategy => ({
          id: strategy.id,
          name: strategy.name,
          asset: strategy.asset_name
        }));

        setStrategies(formattedStrategies);

        // Group strategies by asset
        const grouped = formattedStrategies.reduce((acc, strategy) => {
          if (!acc[strategy.asset]) {
            acc[strategy.asset] = [];
          }
          acc[strategy.asset].push(strategy);
          return acc;
        }, {} as Record<string, Strategy[]>);

        setGroupedStrategies(grouped);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const renderChart = () => {
    const chartData = {
      labels: allTrades.map(t => new Date(t.entry_date).toLocaleDateString()),
      datasets: [
        {
          label: 'Account Balance',
          data: allTrades.reduce((acc, trade) => {
            const lastValue = acc.length > 0 ? acc[acc.length - 1] : initialBalance;
            acc.push(lastValue + (trade.pnl || 0));
            return acc;
          }, [] as number[]),
          borderColor: 'var(--primary)',
          backgroundColor: 'var(--primary-light)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'var(--border)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };

    return selectedChartType === 'line' ? (
      <Line data={chartData} options={chartOptions} />
    ) : (
      <Bar data={chartData} options={chartOptions} />
    );
  };

  const renderSkeletonChart = () => (
    <div className={styles.skeletonChart}>
      <SkeletonLoader />
    </div>
  );

  const renderSkeletonMetrics = () => (
    <div className={styles.metricsGrid}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <SkeletonLoader />
          </div>
          <div className={styles.metricValue}>
            <SkeletonLoader />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeletonRecentTrades = () => (
    <div className={styles.recentTradesList}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.tradeItem}>
          <div className={styles.tradeInfo}>
            <div className={styles.tradeSymbol}>
              <SkeletonLoader />
            </div>
            <div className={styles.tradeDetails}>
              <SkeletonLoader />
            </div>
          </div>
          <div className={styles.tradeResult}>
            <SkeletonLoader />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeletonStrategyBreakdown = () => (
    <div className={styles.strategyBreakdown}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.strategyCard}>
          <div className={styles.strategyHeader}>
            <SkeletonLoader />
          </div>
          <div className={styles.strategyStats}>
            <SkeletonLoader />
          </div>
        </div>
      ))}
    </div>
  );

  const handleTogglePercentage = () => {
    setShowPercentage(!showPercentage);
  };

  const handleMetricHover = (metric: string | null) => {
    setHoveredMetric(metric);
  };

  const handleRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    // ... rest of the function ...
  };

  const handleStrategyChange = (strategy: string) => {
    setSelectedStrategy(strategy);
    // ... rest of the function ...
  };

  const transformTradesForCalendar = (trades: NormalizedTrade[]): CalendarTrade[] => {
    return trades.map(trade => ({
      id: trade.id,
      date: trade.entry_date.split('T')[0],
      symbol: trade.symbol,
      type: trade.type,
      result: trade.pnl && trade.pnl >= 0 ? 'Win' : 'Loss',
      profit: trade.pnl || 0,
      volume: trade.quantity,
      entry: trade.entry_price,
      exit: trade.exit_price || trade.entry_price
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <PageHeader
          title="Trading Dashboard"
          subtitle={
            <span>
              <Clock />
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          }
          actions={
            <>
              <button
                className={styles.newTradeButton}
                onClick={() => navigate('/trades/new')}
              >
                <Plus />
                New Trade
              </button>
            </>
          }
        />

        {/* Filters Section */}
        <FilterControls
          selectedRange={selectedRange}
          onRangeChange={handleRangeChange}
          selectedStrategy={selectedStrategy}
          onStrategyChange={handleStrategyChange}
          strategies={Object.values(groupedStrategies).flat()}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Key Metrics Row */}
        <div className={styles.metricsSection}>
          {isLoadingTrades ? (
            renderSkeletonMetrics()
          ) : (
            <MetricsGrid
              metrics={{
                totalPnL: totalPnL,
                winRate: winRate,
                avgRiskReward: avgRiskReward,
                avgHoldingTime: avgHoldingTime,
                maxDrawdown: maxDrawdown,
                bestDayOfWeek: bestDayOfWeek,
                bestDayWinRate: bestDayWinRate,
                expectancy: expectancy
              }}
              showPercentage={showPercentage}
              onTogglePercentage={handleTogglePercentage}
              hoveredMetric={hoveredMetric}
              onMetricHover={handleMetricHover}
            />
          )}
        </div>

        {/* Goal Progress Section */}
        <div className={styles.goalProgressSection}>
          <GoalProgressSection
            totalPnL={totalPnL}
            winRate={winRate}
            avgRiskReward={avgRiskReward}
            maxDrawdown={maxDrawdown}
            isLoading={isLoadingTrades}
          />
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column - Chart */}
          <div className={styles.mainColumn}>
            {/* Performance Chart */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Performance Overview</h3>
                  <p className={styles.chartSubtitle}>Account balance over time</p>
                </div>
                <div className={styles.chartControls}>
                  {chartTypes.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      className={`${styles.chartTypeButton} ${selectedChartType === id ? styles.active : ''}`}
                      onClick={() => setSelectedChartType(id)}
                      title={label}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.chartContainer}>
                {renderChart()}
              </div>
            </div>

            {/* Trading Calendar */}
            <div className={styles.calendarSection}>
              <TradingCalendarSection calendarTrades={calendarTrades} />
            </div>
          </div>

          {/* Right Column - Recent Trades & Quick Stats */}
          <div className={styles.mainColumn}>
            <div className={styles.recentTradesSection}>
              <RecentTradesSection recentTrades={recentTrades} />
            </div>
          </div>
        </div>

        {/* Strategy Breakdown */}
        <div className={styles.strategySection}>
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <div>
                <h3 className={styles.chartTitle}>Strategy Breakdown</h3>
                <p className={styles.chartSubtitle}>Performance by strategy</p>
              </div>
            </div>
            {isLoadingTrades ? (
              renderSkeletonStrategyBreakdown()
            ) : (
              <div className={styles.strategyBreakdown}>
                {Object.entries(groupedStrategies).map(([asset, strategies]) => (
                  <div key={asset} className={styles.strategyGroup}>
                    <h4 className={styles.strategyGroupTitle}>{asset}</h4>
                    <div className={styles.strategyList}>
                      {strategies.map(strategy => {
                        const strategyTrades = allTrades.filter(t => t.strategy === strategy.name);
                        const strategyPnL = strategyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                        const strategyWinRate = strategyTrades.length > 0
                          ? (strategyTrades.filter(t => (t.pnl || 0) > 0).length / strategyTrades.length) * 100
                          : 0;

                        return (
                          <div key={strategy.id} className={styles.strategyItem}>
                            <div className={styles.strategyInfo}>
                              <div className={styles.strategyName}>{strategy.name}</div>
                              <div className={styles.strategyStats}>
                                <span className={`${styles.strategyPnl} ${strategyPnL >= 0 ? styles.profit : styles.loss}`}>
                                  {strategyPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  ${Math.abs(strategyPnL).toFixed(2)}
                                </span>
                                <span className={styles.strategyWinRate}>
                                  {strategyWinRate.toFixed(1)}% win rate
                                </span>
                              </div>
                            </div>
                            <div className={styles.strategyProgress}>
                              <div 
                                className={styles.strategyProgressBar}
                                style={{ 
                                  width: `${strategyWinRate}%`,
                                  backgroundColor: strategyWinRate >= 50 ? 'var(--success)' : 'var(--error)'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
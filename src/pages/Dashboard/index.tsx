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
import { generateDashboardTestTrades } from '../../utils/testTrades';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { MetricsGrid } from '../../components/Metrics/MetricsGrid/MetricsGrid';
import styles from './Dashboard.module.css';
import { SkeletonLoader } from '../../components/SkeletonLoader/SkeletonLoader';
import { FilterControls } from '../../components/FilterControls/FilterControls';
import { GoalProgressSection } from './GoalProgressSection';
import RecentTradesSection from './RecentTradesSection';
import TradingCalendarSection from './TradingCalendarSection';
import type { Trade } from '../../types/trade';
import { tradesApi } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

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

interface Strategy {
  id: string;
  name: string;
  asset: string;
}

interface Metrics {
  totalPnL: number;
  winRate: number;
  avgRiskReward: number;
  avgHoldingTime: number;
  maxDrawdown: number;
  bestTradingDay: number;
  expectancy: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const calculateAverageHoldingTime = (trades: Trade[]) => {
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

  const calculateMaxDrawdown = (trades: Trade[]) => {
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

  const calculateBestTradingDay = (trades: Trade[]) => {
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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [calendarTrades, setCalendarTrades] = useState<CalendarTrade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]); // Add state for all trades
  const [selectedRange, setSelectedRange] = useState<DateRange>('1M');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [showMetricDetails, setShowMetricDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [groupedStrategies, setGroupedStrategies] = useState<Record<string, Strategy[]>>({});
  const [metrics, setMetrics] = useState<Metrics>({
    totalPnL: 0,
    winRate: 0,
    avgRiskReward: 0,
    avgHoldingTime: 0,
    maxDrawdown: 0,
    bestTradingDay: 0,
    expectancy: 0
  });

  useEffect(() => {
    if (allTrades.length > 0) {
      calculateMetrics(allTrades);
    }
  }, [allTrades]);

  const calculateMetrics = (trades: Trade[]) => {
    if (!trades.length) return;

    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    const avgRiskReward = trades.reduce((sum, trade) => sum + (trade.risk_reward || 0), 0) / trades.length;
    
    // Calculate average holding time
    const holdingTimes = trades
      .filter(trade => trade.entry_date && trade.exit_date)
      .map(trade => {
        const entry = new Date(trade.entry_date!);
        const exit = new Date(trade.exit_date!);
        return exit.getTime() - entry.getTime();
      });
    const avgHoldingTime = holdingTimes.length 
      ? holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length 
      : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let currentBalance = 0;
    trades.forEach(trade => {
      currentBalance += trade.pnl || 0;
      if (currentBalance > peak) peak = currentBalance;
      const drawdown = peak > 0 ? (peak - currentBalance) / peak * 100 : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Calculate best trading day
    const dailyPnL = trades
      .filter(trade => trade.exit_date)
      .reduce((acc, trade) => {
        const date = new Date(trade.exit_date!).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (trade.pnl || 0);
        return acc;
      }, {} as Record<string, number>);
    const bestTradingDay = Object.values(dailyPnL).length 
      ? Math.max(...Object.values(dailyPnL))
      : 0;

    // Calculate expectancy
    const avgWin = winningTrades.length 
      ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length 
      : 0;
    const losingTrades = trades.filter(trade => (trade.pnl || 0) <= 0);
    const avgLoss = losingTrades.length 
      ? losingTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl || 0), 0) / losingTrades.length 
      : 0;
    const expectancy = (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss);

    setMetrics({
      totalPnL,
      winRate,
      avgRiskReward,
      avgHoldingTime,
      maxDrawdown,
      bestTradingDay,
      expectancy
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  const fetchData = async () => {
    try {
      setIsLoadingTrades(true);
      console.log('Fetching trades...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, skipping data fetch');
        return;
      }

      // Fetch trades from Supabase
      const { data: tradesData, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      // If no trades found, generate test data
      const formattedTrades = tradesData?.length 
        ? tradesData as Trade[]
        : generateDashboardTestTrades(50);

      console.log('Fetched trades:', formattedTrades);
      setAllTrades(formattedTrades);
      setRecentTrades(formattedTrades.slice(0, 5));
      setCalendarTrades(transformTradesForCalendar(formattedTrades));
      
      // Calculate metrics with the formatted trades
      calculateMetrics(formattedTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      alert('Error loading trades. Please try again.');
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

  const getFilteredTrades = () => {
    let filtered = [...allTrades];

    // Filter by strategy
    if (selectedStrategy !== 'all') {
      filtered = filtered.filter(trade => trade.strategy === selectedStrategy);
    }

    // Filter by date range
    const now = new Date();
    const rangeStart = new Date();

    switch (selectedRange) {
      case '1D':
        rangeStart.setDate(now.getDate() - 1);
        break;
      case '1W':
        rangeStart.setDate(now.getDate() - 7);
        break;
      case '1M':
        rangeStart.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        rangeStart.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        rangeStart.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        rangeStart.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        // No date filtering needed
        break;
    }

    if (selectedRange !== 'ALL') {
      filtered = filtered.filter(trade => {
        const tradeDate = new Date(trade.entry_date);
        return tradeDate >= rangeStart && tradeDate <= now;
      });
    }

    // Sort by date ascending for the chart
    return filtered.sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
  };

  const renderChart = () => {
    if (isLoadingTrades) {
      return renderSkeletonChart();
    }

    if (!allTrades.length) {
      return (
        <div className={styles.chartContainer}>
          <div className={styles.noDataMessage}>
            No trade data available. Add some trades to see your performance chart.
          </div>
        </div>
      );
    }

    const filteredTrades = getFilteredTrades();
    console.log('Filtered trades for chart:', filteredTrades);

    if (!filteredTrades.length) {
      return (
        <div className={styles.chartContainer}>
          <div className={styles.noDataMessage}>
            No trades found for the selected filters.
          </div>
        </div>
      );
    }

    const chartData = {
      labels: filteredTrades.map(trade => new Date(trade.entry_date).toLocaleDateString()),
      datasets: [
        {
          label: 'Account Balance',
          data: filteredTrades.reduce((acc, trade) => {
            const lastValue = acc.length > 0 ? acc[acc.length - 1] : initialBalance;
            acc.push(lastValue + (trade.pnl || 0));
            return acc;
          }, [] as number[]),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: 'rgba(255, 255, 255, 0.9)',
          bodyColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context: any) {
              return `Balance: $${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            callback: function(value: any) {
              return '$' + value.toLocaleString();
            }
          }
        }
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      }
    };

    return selectedChartType === 'line' ? (
      <Line data={chartData} options={chartOptions} />
    ) : (
      <Bar 
        data={chartData} 
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            tooltip: {
              ...chartOptions.plugins.tooltip,
              callbacks: {
                label: function(context: any) {
                  return `Balance: $${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          }
        }} 
      />
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
    filterTrades(range, selectedStrategy);
  };

  const handleStrategyChange = (strategy: string) => {
    setSelectedStrategy(strategy);
    filterTrades(selectedRange, strategy);
  };

  const filterTrades = (range: DateRange, strategy: string) => {
    let filtered = [...allTrades];

    // Filter by date range
    const now = new Date();
    const rangeStart = new Date();

    switch (range) {
      case '1D':
        rangeStart.setDate(now.getDate() - 1);
        break;
      case '1W':
        rangeStart.setDate(now.getDate() - 7);
        break;
      case '1M':
        rangeStart.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        rangeStart.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        rangeStart.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        rangeStart.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        // No date filtering needed
        break;
    }

    if (range !== 'ALL') {
      filtered = filtered.filter(trade => {
        const tradeDate = new Date(trade.entry_date);
        return tradeDate >= rangeStart && tradeDate <= now;
      });
    }

    // Filter by strategy
    if (strategy !== 'all') {
      filtered = filtered.filter(trade => trade.strategy === strategy);
    }

    setTrades(filtered);
    setRecentTrades(filtered.slice(0, 5));
    setCalendarTrades(transformTradesForCalendar(filtered));
    calculateMetrics(filtered);
  };

  const transformTradesForCalendar = (trades: Trade[]): CalendarTrade[] => {
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
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  LineChart, 
  Clock,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart, Line, Bar } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import type { DateRange } from '../../types';
import { generateDashboardTestTrades } from '../../utils/testTrades';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { MetricsGrid } from '../../components/Metrics/MetricsGrid/MetricsGrid';
import styles from './Dashboard.module.css';
import { SkeletonLoader } from '../../components/SkeletonLoader/SkeletonLoader';
import { FilterControls } from '../../components/FilterControls/FilterControls';
import type { Trade as DBTrade } from '../../types/trade';
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

interface Trade extends DBTrade {
  risk_reward?: number | null;
  pnl?: number | null;
  entry_date: string;
  followed_plan?: boolean;
  had_setup?: boolean;
  respected_stops?: boolean;
  emotion_score?: number;
  checklist_completed?: number;
  strategy?: string | null;
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
  const { user } = useAuth();

  const [showPercentage, setShowPercentage] = useState(false);
  const [initialBalance] = useState(100000); // This should be fetched from user settings
  const [totalPnL, setTotalPnL] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [avgRiskReward, setAvgRiskReward] = useState(0);
  const [profitFactor, setProfitFactor] = useState(0);
  const [avgPnlPerDay, setAvgPnlPerDay] = useState(0);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>('1M');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');
  const [groupedStrategies, setGroupedStrategies] = useState<Record<string, Strategy[]>>({});

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
    
    // Calculate profit factor
    const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const grossLoss = Math.abs(trades
      .filter(trade => (trade.pnl || 0) < 0)
      .reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    // Calculate average P&L per day
    const tradingDays = new Set(trades.map(trade => 
      new Date(trade.entry_date).toISOString().split('T')[0]
    )).size;
    const avgPnlPerDay = tradingDays > 0 ? totalPnL / tradingDays : 0;

    setTotalPnL(totalPnL);
    setWinRate(winRate);
    setAvgRiskReward(avgRiskReward);
    setProfitFactor(profitFactor);
    setAvgPnlPerDay(avgPnlPerDay);
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
    if (selectedStrategy !== 'ALL') {
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
    if (strategy !== 'ALL') {
      filtered = filtered.filter(trade => trade.strategy === strategy);
    }

    setAllTrades(filtered);
    calculateMetrics(filtered);
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
                onClick={handleRefresh}
                className={styles.refreshButton}
              >
                <Upload className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                className={styles.newTradeButton}
              >
                <Clock />
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
          groupedStrategies={groupedStrategies}
        />

        {/* Key Metrics Row */}
        <div className={styles.metricsSection}>
          {isLoadingTrades ? (
            renderSkeletonMetrics()
          ) : (
            <MetricsGrid
              metrics={{
                totalPnL,
                winRate,
                avgRiskReward,
                profitFactor,
                avgPnlPerDay
              }}
              showPercentage={showPercentage}
              onTogglePercentage={handleTogglePercentage}
              hoveredMetric={hoveredMetric}
              onMetricHover={handleMetricHover}
            />
          )}
        </div>

        {/* Performance Chart */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>
                Performance Overview
              </h3>
              <p className={styles.chartSubtitle}>
                Account growth over time
              </p>
            </div>
            <div className={styles.chartControls}>
              {chartTypes.map((type) => (
                <button
                  key={type.id}
                  className={`${styles.chartTypeButton} ${selectedChartType === type.id ? styles.chartTypeButtonActive : ''}`}
                  onClick={() => setSelectedChartType(type.id)}
                >
                  <type.icon />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartContainer}>
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
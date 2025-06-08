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
import type { Trade as DBTrade } from '../../types/trade';
import { generateTestTrades } from '../../utils/testTrades';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { MetricsGrid } from '../../components/Metrics/MetricsGrid';
import styles from './Dashboard.module.css';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { FilterControls } from '../../components/FilterControls';

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
  risk_reward?: number;
  pnl?: number;
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

  const [showPercentage, setShowPercentage] = useState(false);
  const [initialBalance] = useState(100000); // This should be fetched from user settings
  const [totalPnL, setTotalPnL] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [avgRiskReward, setAvgRiskReward] = useState(0);
  const [profitFactor, setProfitFactor] = useState(0);
  const [avgPnlPerDay, setAvgPnlPerDay] = useState(0);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [selectedRange, setSelectedRange] = useState('1M');
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

    // Calculate Total P&L
    const pnl = trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
    setTotalPnL(pnl);

    // Calculate Win Rate
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => (Number(trade.pnl) || 0) > 0);
    const totalWinningTrades = winningTrades.length;
    const winRate = totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0;
    setWinRate(winRate);

    // Calculate Risk-Reward Ratio
    const validRiskRewardTrades = trades.filter(trade => {
      const riskReward = Number(trade.risk_reward);
      const calculatedRR = trade.risk && trade.reward ? Number(trade.reward) / Number(trade.risk) : null;
      return (!isNaN(riskReward) && riskReward > 0) || (calculatedRR !== null && calculatedRR > 0);
    });
    
    const riskReward = validRiskRewardTrades.length > 0
      ? validRiskRewardTrades.reduce((sum, trade) => {
          const rr = Number(trade.risk_reward);
          if (!isNaN(rr) && rr > 0) return sum + rr;
          return sum + (Number(trade.reward) / Number(trade.risk));
        }, 0) / validRiskRewardTrades.length
      : 0;
    setAvgRiskReward(riskReward);

    // Calculate Profit Factor
    const grossProfit = winningTrades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
    const grossLoss = Math.abs(trades
      .filter(trade => (Number(trade.pnl) || 0) < 0)
      .reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    setProfitFactor(profitFactor);

    // Calculate Average P&L per Day
    const tradingDays = new Set(trades.map(trade => 
      new Date(trade.entry_date).toISOString().split('T')[0]
    )).size;
    const avgPnlPerDay = tradingDays > 0 ? pnl / tradingDays : 0;
    setAvgPnlPerDay(avgPnlPerDay);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const fetchData = async () => {
    setIsLoadingTrades(true);
    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;

      // Filter trades based on selected strategy
      const filteredTrades = selectedStrategy === 'ALL' 
        ? trades 
        : trades.filter(trade => trade.strategy_id === selectedStrategy);

      setAllTrades(filteredTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoadingTrades(false);
    }
  };

  // Update fetchData when selectedStrategy changes
  useEffect(() => {
    fetchData();
  }, [selectedStrategy]);

  const handleGenerateTestTrades = async () => {
    try {
      setIsRefreshing(true);
      await generateTestTrades();
      // Re-fetch data to include the new test trades
      await fetchData();
    } catch (error) {
      console.error('Error generating test trades:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderChart = () => {
    switch (selectedChartType) {
      case 'bar':
        return <Bar data={performanceData} options={chartOptions} />;
      default:
        return <Line data={performanceData} options={chartOptions} />;
    }
  };

  // Performance data using allTrades
  const performanceData = {
    labels: allTrades.map((trade: Trade) => new Date(trade.entry_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Account Balance',
        data: allTrades.reduce((acc: number[], trade: Trade, index: number) => {
          const balance = index === 0 
            ? initialBalance + (trade.pnl || 0)
            : acc[index - 1] + (trade.pnl || 0);
          acc.push(balance);
          return acc;
        }, []),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'var(--color-text-primary)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'var(--color-background)',
        titleColor: 'var(--color-text-primary)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return ` ${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          color: 'var(--color-grid)',
          borderColor: 'var(--color-grid)'
        },
        ticks: {
          color: 'var(--color-text-muted)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        grid: {
          color: 'var(--color-grid)',
          borderColor: 'var(--color-grid)'
        },
        ticks: {
          color: 'var(--color-text-muted)',
          callback: function(value: number | string) {
            return `$${Number(value).toFixed(0)}`;
          }
        }
      }
    }
  } as const;

  // Add this function to fetch strategies
  const fetchStrategies = async () => {
    try {
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('id, name, asset_name')
        .order('asset_name');

      if (error) throw error;

      // Group strategies by asset
      const grouped = (strategies as SupabaseStrategy[]).reduce((acc, strategy) => {
        const asset = strategy.asset_name;
        if (!acc[asset]) {
          acc[asset] = [];
        }
        acc[asset].push({
          id: strategy.id,
          name: strategy.name,
          asset: strategy.asset_name
        });
        return acc;
      }, {} as Record<string, Strategy[]>);

      setGroupedStrategies(grouped);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const renderSkeletonMetrics = () => (
    <div className={styles.metricsGrid}>
      {Array(5).fill(null).map((_, index) => (
        <div key={index} className={styles.metricCard}>
          <SkeletonLoader type="text" width="120px" height="16px" className={styles.metricTitle} />
          <SkeletonLoader type="text" width="80px" height="24px" className={styles.metricValue} />
        </div>
      ))}
    </div>
  );

  const renderSkeletonChart = () => (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <div>
          <SkeletonLoader type="text" width="180px" height="20px" className={styles.chartTitle} />
          <SkeletonLoader type="text" width="140px" height="16px" className={styles.chartSubtitle} />
        </div>
        <div className={styles.chartControls}>
          {Array(2).fill(null).map((_, index) => (
            <SkeletonLoader key={index} type="button" width="40px" height="32px" />
          ))}
        </div>
      </div>
      <div className={styles.chartContainer}>
        <SkeletonLoader type="chart" height="300px" />
      </div>
    </div>
  );

  const handleTogglePercentage = () => {
    setShowPercentage(!showPercentage);
  };

  const handleMetricHover = (metric: string | null) => {
    setHoveredMetric(metric);
  };

  if (isLoadingTrades) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <PageHeader 
            title="Trading Dashboard"
            subtitle={
              <span>
                <Clock />
                Loading...
              </span>
            }
          />
          {renderSkeletonMetrics()}
          <div className={styles.mainGrid}>
            <div className={styles.mainColumn}>
              {renderSkeletonChart()}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                onClick={handleGenerateTestTrades}
                className={styles.generateTestButton}
              >
                <Plus />
                Generate Test Trades
              </button>
              <button
                onClick={handleRefresh}
                className={styles.refreshButton}
              >
                <Upload className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                className={styles.downloadButton}
              >
                <Download />
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
          selectedStrategy={selectedStrategy}
          onStrategyChange={setSelectedStrategy}
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
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
  Table,
  RefreshCw
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart, Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
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
    datasets: [
      {
        label: 'Cumulative P&L',
        data: allTrades.map((trade: Trade, index: number) => ({
          x: new Date(trade.entry_date).getTime(),
          y: allTrades.slice(0, index + 1).reduce((sum, t) => sum + (t.pnl || 0), initialBalance)
        })),
        borderColor: styles.chartLine,
        backgroundColor: styles.chartLine,
        fill: true,
        tension: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-line-tension')),
        borderWidth: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-line-width')),
        pointRadius: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-point-radius')),
        pointHoverRadius: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-point-hover-radius')),
        yAxisID: 'y'
      },
      {
        label: 'Daily P&L',
        data: allTrades.map((trade: Trade) => ({
          x: new Date(trade.entry_date).getTime(),
          y: trade.pnl || 0
        })),
        borderColor: styles.chartBar,
        backgroundColor: styles.chartBar,
        yAxisID: 'y1',
        order: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Trading Performance',
        font: {
          size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
          family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
        },
        padding: {
          top: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-padding')),
          bottom: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-padding'))
        }
      },
      tooltip: {
        backgroundColor: styles.chartTooltip,
        titleColor: styles.chartText,
        bodyColor: styles.chartText,
        borderColor: styles.chartBorder,
        borderWidth: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-border-width')),
        padding: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-box-padding')),
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          },
          padding: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-padding'))
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date',
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          }
        },
        ticks: {
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          }
        },
        grid: {
          color: styles.chartGrid
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Cumulative P&L',
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          }
        },
        ticks: {
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
          }
        },
        grid: {
          color: styles.chartGrid
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Daily P&L',
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          }
        },
        ticks: {
          color: styles.chartText,
          font: {
            size: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-font-size')),
            family: getComputedStyle(document.documentElement).getPropertyValue('--chart-font-family')
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
          }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

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
            title="Dashboard"
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
        <div className={styles.header}>
          <div className={styles.header__left}>
            <h1 className={styles.header__title}>Performance Overview</h1>
            <p className={styles.header__subtitle}>Track your trading performance and analyze key metrics</p>
          </div>
          <div className={styles.header__right}>
            <div className={styles.header__actions}>
              <button 
                className={`${styles.actionButton} ${styles.actionButtonIcon}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={isRefreshing ? styles.spinning : ''} size={20} />
              </button>
              <button 
                className={`${styles.actionButton} ${styles.actionButtonGradient}`}
                onClick={() => navigate('/trades/new')}
              >
                <Plus size={20} />
                New Trade
              </button>
            </div>
          </div>
        </div>

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
              <h2 className={styles.chartTitle}>Performance Overview</h2>
              <p className={styles.chartSubtitle}>Account growth over time</p>
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
            <Scatter data={performanceData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
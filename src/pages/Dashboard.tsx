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
import { supabase } from '../lib/supabase';
import { TradingCalendar } from '../components/TradingCalendar';
import type { Trade as CalendarTrade } from '../components/TradingCalendar';
import type { Trade as DBTrade } from '../types/trade';
import { generateTestTrades } from '../utils/testTrades';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { MetricsGrid } from '../components/Metrics/MetricsGrid';
import styles from './Dashboard.module.css';
import { SkeletonLoader } from '../components/SkeletonLoader';

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
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]); // Add state for all trades
  const [selectedRange, setSelectedRange] = useState('1M');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [showMetricDetails, setShowMetricDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calendarTrades, setCalendarTrades] = useState<CalendarTrade[]>([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [strategies, setStrategies] = useState<{ id: string; name: string; asset: string }[]>([]);
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

    // Calculate Win Rate with detailed logging
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => {
      const pnl = Number(trade.pnl);
      return pnl > 0;
    });
    const totalWinningTrades = winningTrades.length;
    
    const winRate = totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0;
    setWinRate(winRate);

    // Calculate Risk-Reward Ratio
    const validRiskRewardTrades = trades.filter(trade => {
      // First try to use risk_reward if available
      const riskReward = Number(trade.risk_reward);
      // If not available, calculate from risk and reward
      const calculatedRR = trade.risk && trade.reward ? Number(trade.reward) / Number(trade.risk) : null;
      
      return (!isNaN(riskReward) && riskReward > 0) || (calculatedRR !== null && calculatedRR > 0);
    });
    
    const riskReward = validRiskRewardTrades.length > 0
      ? validRiskRewardTrades.reduce((sum, trade) => {
          const rr = Number(trade.risk_reward);
          if (!isNaN(rr) && rr > 0) return sum + rr;
          // If risk_reward is not available, calculate from risk and reward
          return sum + (Number(trade.reward) / Number(trade.risk));
        }, 0) / validRiskRewardTrades.length
      : 0;
    
    setAvgRiskReward(riskReward);

    // Calculate Average Holding Time
    const holdTime = calculateAverageHoldingTime(trades);
    setAvgHoldingTime(holdTime);

    // Calculate Max Drawdown
    const drawdown = calculateMaxDrawdown(trades);
    setMaxDrawdown(drawdown);

    // Calculate Expectancy
    const losingTrades = trades.filter(trade => (Number(trade.pnl) || 0) <= 0);
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0) / winningTrades.length 
      : 0;
    
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0)) / losingTrades.length 
      : 0;
    
    const expectancy = (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss);
    
    setExpectancy(expectancy);

    // Calculate Best Trading Day
    const dayStats = calculateBestTradingDay(trades);
    setBestDayOfWeek(dayStats.bestDayOfWeek);
    setBestDayWinRate(dayStats.bestDayWinRate);
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
      setRecentTrades(filteredTrades.slice(0, 5));
      
      // Update calendar trades
      const calendarTradesData: CalendarTrade[] = filteredTrades.map(trade => {
        const date = new Date(trade.entry_date);
        const localDate = date.toLocaleDateString('en-CA');
        return {
          id: trade.id,
          date: localDate,
          symbol: trade.symbol,
          type: trade.type,
          result: (trade.pnl || 0) > 0 ? 'Win' : 'Loss',
          profit: trade.pnl || 0,
          volume: trade.quantity,
          entry: trade.entry_price,
          exit: trade.exit_price || trade.entry_price
        };
      });
      setCalendarTrades(calendarTradesData);
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

  // Profit distribution data using allTrades
  const profitDistributionData = {
    labels: allTrades.reduce((acc: string[], trade: Trade) => {
      const pnl = trade.pnl || 0;
      const bucket = Math.floor(pnl / 100) * 100;
      if (!acc.includes(`$${bucket}`)) {
        acc.push(`$${bucket}`);
      }
      return acc.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
    }, []),
    datasets: [{
      label: 'Number of Trades',
      data: allTrades.reduce((acc: { bucket: string; count: number }[], trade: Trade) => {
        const pnl = trade.pnl || 0;
        const bucket = Math.floor(pnl / 100) * 100;
        const index = acc.findIndex(item => item.bucket === `$${bucket}`);
        if (index === -1) {
          acc.push({ bucket: `$${bucket}`, count: 1 });
        } else {
          acc[index].count++;
        }
        return acc;
      }, [])
        .sort((a, b) => parseInt(a.bucket.slice(1)) - parseInt(b.bucket.slice(1)))
        .map(item => item.count),
      backgroundColor: allTrades.map((trade: Trade) => (trade.pnl || 0) >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
      borderColor: allTrades.map((trade: Trade) => (trade.pnl || 0) >= 0 ? '#22c55e' : '#ef4444'),
      borderWidth: 2,
    }]
  };

  // R-Multiple data using allTrades
  const rMultipleData = {
    labels: allTrades.map((trade: Trade) => {
      const rr = trade.risk_reward || 0;
      if (rr <= -3) return '≤-3R';
      if (rr >= 3) return '≥3R';
      return `${rr.toFixed(1)}R`;
    }),
    datasets: [{
      label: 'R-Multiple Distribution',
      data: allTrades.map((trade: Trade) => trade.risk_reward || 0),
      backgroundColor: allTrades.map((trade: Trade) => (trade.pnl || 0) >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
      borderColor: allTrades.map((trade: Trade) => (trade.pnl || 0) >= 0 ? '#22c55e' : '#ef4444'),
      borderWidth: 2,
    }]
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.6)',
          padding: 20,
          font: {
            size: 12,
          },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: true,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
    cutout: '75%',
  };

  // Strategy performance data using allTrades
  const strategyPerformanceData = {
    labels: allTrades.reduce((acc: string[], trade: Trade) => {
      const strategy = trade.strategy || 'Unknown';
      if (!acc.includes(strategy)) {
        acc.push(strategy);
      }
      return acc;
    }, []),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Win Rate %',
        data: allTrades.reduce((acc: { strategy: string; wins: number; total: number }[], trade: Trade) => {
          const strategy = trade.strategy || 'Unknown';
          const index = acc.findIndex(item => item.strategy === strategy);
          if (index === -1) {
            acc.push({ 
              strategy, 
              wins: (trade.pnl || 0) > 0 ? 1 : 0, 
              total: 1 
            });
          } else {
            acc[index].wins += (trade.pnl || 0) > 0 ? 1 : 0;
            acc[index].total += 1;
          }
          return acc;
        }, []).map(item => (item.wins / item.total) * 100),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Total P&L',
        data: allTrades.reduce((acc: { strategy: string; pnl: number }[], trade: Trade) => {
          const strategy = trade.strategy || 'Unknown';
          const index = acc.findIndex(item => item.strategy === strategy);
          if (index === -1) {
            acc.push({ strategy, pnl: trade.pnl || 0 });
          } else {
            acc[index].pnl += trade.pnl || 0;
          }
          return acc;
        }, []).map(item => item.pnl),
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        yAxisID: 'y1',
      }
    ]
  };

  // Market performance data using allTrades
  const marketPerformanceData = {
    labels: allTrades.reduce((acc: string[], trade: Trade) => {
      const market = trade.market || 'Unknown';
      if (!acc.includes(market)) {
        acc.push(market);
      }
      return acc;
    }, []),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Number of Trades',
        data: allTrades.reduce((acc: { market: string; count: number }[], trade: Trade) => {
          const market = trade.market || 'Unknown';
          const index = acc.findIndex(item => item.market === market);
          if (index === -1) {
            acc.push({ market, count: 1 });
          } else {
            acc[index].count++;
          }
          return acc;
        }, []).map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
      {
        type: 'line' as const,
        label: 'Average P&L',
        data: allTrades.reduce((acc: { market: string; pnl: number; count: number }[], trade: Trade) => {
          const market = trade.market || 'Unknown';
          const index = acc.findIndex(item => item.market === market);
          if (index === -1) {
            acc.push({ market, pnl: trade.pnl || 0, count: 1 });
          } else {
            acc[index].pnl += trade.pnl || 0;
            acc[index].count++;
          }
          return acc;
        }, []).map(item => item.pnl / item.count),
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        yAxisID: 'y1',
      }
    ]
  };

  const strategyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
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
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const datasetLabel = context.dataset.label;
            if (datasetLabel === 'Win Rate %') {
              return ` ${value.toFixed(1)}%`;
            }
            return ` ${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: number | string) {
            return `${Number(value).toFixed(1)}%`;
          }
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: number | string) {
            return `$${Number(value).toFixed(0)}`;
          }
        }
      }
    }
  } as const;

  const generateHeatmapData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ count: 0, pnl: 0 })));

    allTrades.forEach((trade: Trade) => {
      const entryDate = new Date(trade.entry_date);
      const day = entryDate.getDay();
      const hour = entryDate.getHours();
      data[day][hour].count++;
      data[day][hour].pnl += trade.pnl || 0;
    });

    return {
      hours,
      days,
      data: data.map(row => row.map(cell => ({
        ...cell,
        avgPnl: cell.count > 0 ? cell.pnl / cell.count : 0
      })))
    };
  };

  const heatmapData = generateHeatmapData();

  const calculateDisciplineMetrics = () => {
    const metrics = {
      disciplineRate: 0,
      emotionCorrelation: 0,
      checklistAdherence: 0,
    };

    if (!allTrades.length) return metrics;

    // Calculate Discipline Compliance Rate
    const compliantTrades = allTrades.filter(trade => 
      trade.followed_plan && 
      trade.had_setup && 
      trade.respected_stops
    ).length;
    metrics.disciplineRate = (compliantTrades / allTrades.length) * 100;

    // Calculate Emotion vs P/L Correlation
    const emotionScores = allTrades.map(trade => trade.emotion_score || 0);
    const pnlValues = allTrades.map(trade => trade.pnl || 0);
    
    if (emotionScores.length > 1) {
      const emotionMean = emotionScores.reduce((a, b) => a + b) / emotionScores.length;
      const pnlMean = pnlValues.reduce((a, b) => a + b) / pnlValues.length;
      
      const emotionDeviation = emotionScores.map(score => score - emotionMean);
      const pnlDeviation = pnlValues.map(pnl => pnl - pnlMean);
      
      const covariance = emotionDeviation.reduce((sum, deviation, i) => 
        sum + (deviation * pnlDeviation[i]), 0) / emotionScores.length;
      
      const emotionStdDev = Math.sqrt(emotionDeviation.reduce((sum, dev) => 
        sum + (dev * dev), 0) / emotionScores.length);
      const pnlStdDev = Math.sqrt(pnlDeviation.reduce((sum, dev) => 
        sum + (dev * dev), 0) / pnlValues.length);
      
      metrics.emotionCorrelation = covariance / (emotionStdDev * pnlStdDev);
    }

    // Calculate Checklist/Plan Adherence
    const checklistItems = allTrades.reduce((sum, trade) => 
      sum + (trade.checklist_completed || 0), 0);
    metrics.checklistAdherence = (checklistItems / (allTrades.length * 10)) * 100;

    return metrics;
  };

  const disciplineMetrics = calculateDisciplineMetrics();

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
      {Array(8).fill(null).map((_, index) => (
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

  const renderSkeletonRecentTrades = () => (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <div>
          <SkeletonLoader type="text" width="140px" height="20px" className={styles.chartTitle} />
          <SkeletonLoader type="text" width="100px" height="16px" className={styles.chartSubtitle} />
        </div>
        <SkeletonLoader type="button" width="32px" height="32px" />
      </div>
      <div className={styles.recentTradesList}>
        {Array(4).fill(null).map((_, index) => (
          <div key={index} className={styles.tradeItem}>
            <div className={styles.tradeInfo}>
              <SkeletonLoader type="avatar" width="32px" height="32px" rounded />
              <div>
                <SkeletonLoader type="text" width="120px" height="16px" />
                <SkeletonLoader type="text" width="80px" height="14px" />
              </div>
            </div>
            <div>
              <SkeletonLoader type="text" width="60px" height="16px" />
              <SkeletonLoader type="text" width="40px" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeletonStrategyBreakdown = () => (
    <div className={styles.strategyBreakdown}>
      <div className={styles.strategyGrid}>
        {Array(2).fill(null).map((_, index) => (
          <div key={index} className={styles.strategyCard}>
            <SkeletonLoader type="text" width="200px" height="24px" className={styles.strategyCardTitle} />
            <div className={styles.strategyChartContainer}>
              <SkeletonLoader type="chart" height="200px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const calculateCircleDash = (rate: number) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    return {
      strokeDasharray: circumference,
      strokeDashoffset: circumference * (1 - rate / 100)
    };
  };

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
              <div className={styles.chartSection}>
                <SkeletonLoader type="chart" height="200px" />
              </div>
            </div>
            <div className={styles.mainColumn}>
              {renderSkeletonRecentTrades()}
            </div>
          </div>
          {renderSkeletonStrategyBreakdown()}
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
              February 12, 2024
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
        <div className={styles.filterControls}>
          <div className={styles.filterControlsInner}>
            {/* Date Range Filter */}
            <div className={styles.filterGroup}>
              <select className={styles.filterSelect}>
                <option value="1D">Today</option>
                <option value="1W">This Week</option>
                <option value="1M">This Month</option>
                <option value="3M">Last 3 Months</option>
                <option value="6M">Last 6 Months</option>
                <option value="1Y">This Year</option>
                <option value="ALL">All Time</option>
              </select>
            </div>

            {/* Strategy Filter */}
            <div className={styles.filterGroup}>
              <div>
                <select 
                  className={styles.filterSelectWide}
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                >
                  <option value="ALL">All Strategies</option>
                  {Object.entries(groupedStrategies).map(([asset, strategies]) => (
                    <optgroup 
                      key={asset} 
                      label={asset}
                      className={styles.filterOptionGroup}
                    >
                      {strategies.map(strategy => (
                        <option 
                          key={strategy.id} 
                          value={strategy.id}
                          className={styles.filterOption}
                        >
                          {strategy.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Symbol Filter */}
            <div className={styles.filterGroup}>
              <input
                type="text"
                placeholder="Filter by symbol..."
                className={styles.filterInput}
              />
            </div>

            {/* Trade Direction Filter */}
            <div className={styles.filterGroup}>
              <select className={styles.filterSelect}>
                <option value="ALL">All Trades</option>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className={styles.metricsGrid}>
          {/* Total Net P/L */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <h3 className={styles.metricTitle}>Total Net P/L</h3>
              <button 
                className={styles.metricToggle}
                onClick={handleTogglePercentage}
              >
                {showPercentage ? '%' : '$'}
              </button>
            </div>
            <div className={`${styles.metricValue} ${totalPnL >= 0 ? styles.metricValuePositive : styles.metricValueNegative}`}>
              {showPercentage 
                ? `${((totalPnL / initialBalance) * 100).toFixed(2)}%`
                : `$${totalPnL.toFixed(2)}`
              }
            </div>
          </div>

          {/* Win Rate */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Win Rate</h3>
            <div className={`${styles.metricValue} ${winRate >= 50 ? styles.metricValuePositive : styles.metricValueNegative}`}>
              {winRate.toFixed(1)}%
            </div>
          </div>

          {/* Risk-Reward Ratio */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Avg Risk-Reward</h3>
            <div className={`${styles.metricValue} ${avgRiskReward >= 2 ? styles.metricValuePositive : styles.metricValueNeutral}`}>
              {avgRiskReward.toFixed(2)}R
            </div>
          </div>

          {/* Expectancy */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Expectancy</h3>
            <div className={`${styles.metricValue} ${expectancy >= 0 ? styles.metricValuePositive : styles.metricValueNegative}`}>
              ${expectancy.toFixed(2)}
            </div>
          </div>

          {/* Average Holding Time */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Avg Holding Time</h3>
            <div className={styles.metricValue}>
              {avgHoldingTime}
            </div>
          </div>

          {/* Max Drawdown */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Max Drawdown</h3>
            <div className={`${styles.metricValue} ${maxDrawdown <= 20 ? styles.metricValuePositive : styles.metricValueNegative}`}>
              {maxDrawdown.toFixed(1)}%
            </div>
          </div>

          {/* Best Trading Day */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Best Trading Day</h3>
            <div className={styles.metricValue}>
              {bestDayOfWeek}
            </div>
            <div className={styles.metricSubtitle}>
              {bestDayWinRate.toFixed(1)}% win rate
            </div>
          </div>

          {/* Number of Trades */}
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Number of Trades</h3>
            <div className={styles.metricValue}>
              {allTrades.length}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column - Chart */}
          <div className={styles.mainColumn}>
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

            {/* Trading Calendar */}
            <TradingCalendar trades={calendarTrades} />
          </div>

          {/* Right Column - Recent Trades & Quick Stats */}
          <div className={styles.mainColumn}>
            {/* Recent Trades */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>
                    Recent Trades
                  </h3>
                  <p className={styles.chartSubtitle}>
                    Last 24 hours
                  </p>
                </div>
                <button className={styles.chartTypeButton}>
                  <Filter />
                </button>
              </div>
              <div className={styles.recentTradesList}>
                {recentTrades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.tradeItem} ${hoveredMetric === trade.id ? styles.tradeItemHovered : ''}`}
                    onMouseEnter={() => setHoveredMetric(trade.id)}
                    onMouseLeave={() => setHoveredMetric(null)}
                  >
                    <div className={styles.tradeInfo}>
                      <div className={`${styles.tradeIcon} ${trade.type === 'Long' ? styles.tradeIconLong : styles.tradeIconShort}`}>
                        {trade.type === 'Long' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div className={styles.tradeHeader}>
                          <span className={styles.tradeSymbol}>{trade.symbol}</span>
                          <span className={styles.tradeDate}>
                            <Clock size={10} />
                            {new Date(trade.entry_date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        <div className={styles.tradePrice}>
                          ${trade.entry_price} → ${trade.exit_price || 'Open'}
                        </div>
                      </div>
                    </div>
                    <div className={styles.tradePnl}>
                      <div className={`${styles.tradePnlValue} ${(trade.pnl || 0) >= 0 ? styles.tradePnlValuePositive : styles.tradePnlValueNegative}`}>
                        ${Math.abs(trade.pnl || 0)}
                      </div>
                      <div className={styles.tradeQuantity}>
                        {trade.quantity} shares
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy & Trade Type Breakdown */}
        <div className={styles.strategyBreakdown}>
          <div className={styles.strategyGrid}>
            {/* Performance by Strategy */}
            <div className={styles.strategyCard}>
              <h2 className={styles.strategyCardTitle}>
                <PieChart />
                Performance by Strategy
              </h2>
              <div className={styles.strategyChartContainer}>
                <Chart type="bar" data={strategyPerformanceData} options={strategyChartOptions} />
              </div>
            </div>

            {/* Performance by Market */}
            <div className={styles.strategyCard}>
              <h2 className={styles.strategyCardTitle}>
                <BarChart2 />
                Performance by Market
              </h2>
              <div className={styles.strategyChartContainer}>
                <Chart type="bar" data={marketPerformanceData} options={strategyChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Entry/Exit Timing Heatmap */}
        <div className={styles.heatmapSection}>
          <div className={styles.heatmapCard}>
            <h2 className={styles.heatmapTitle}>
              <PieChart />
              Entry/Exit Timing Heatmap
            </h2>
            <div className={styles.heatmapGrid}>
              {/* Hours Header */}
              <div className={styles.heatmapHeader}></div>
              {heatmapData.hours.map(hour => (
                <div key={hour} className={styles.heatmapHourHeader}>
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}

              {/* Days and Data */}
              {heatmapData.days.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  <div className={styles.heatmapDayHeader}>
                    {day}
                  </div>
                  {heatmapData.data[dayIndex].map((cell, hourIndex) => {
                    const intensity = cell.count === 0 ? 0 : Math.min(Math.abs(cell.avgPnl) / 1000, 1);
                    const color = cell.avgPnl >= 0 
                      ? `rgba(34, 197, 94, ${intensity})`
                      : `rgba(239, 68, 68, ${intensity})`;
                    
                    return (
                      <div
                        key={`${day}-${hourIndex}`}
                        className={`${styles.heatmapCell} ${
                          cell.count === 0 
                            ? styles.heatmapCellEmpty 
                            : cell.avgPnl >= 0 
                              ? styles.heatmapCellProfit 
                              : styles.heatmapCellLoss
                        }`}
                        style={{
                          '--heatmap-profit-color': `rgba(34, 197, 94, ${intensity})`,
                          '--heatmap-loss-color': `rgba(239, 68, 68, ${intensity})`
                        } as React.CSSProperties}
                        title={`${day} ${hourIndex}:00\nTrades: ${cell.count}\nAvg P&L: ${cell.avgPnl >= 0 ? '+' : ''}$${cell.avgPnl.toFixed(2)}`}
                      >
                        {cell.count}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className={styles.heatmapLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.legendColorLoss}`}></div>
                <span>Loss</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.legendColorProfit}`}></div>
                <span>Profit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Behavioral & Discipline Metrics */}
        <div className={styles.disciplineSection}>
          <div className={styles.disciplineGrid}>
            {/* Discipline Compliance Rate */}
            <div className={styles.disciplineCard}>
              <h2 className={styles.disciplineTitle}>
                <Table />
                Discipline Compliance
              </h2>
              <div className={styles.disciplineContent}>
                <div className={styles.disciplineValue}>
                  <svg className={styles.disciplineChart}>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className={styles.disciplineCircleBackground}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className={`${styles.disciplineCircle} ${styles.disciplineCircleProgress} ${
                        disciplineMetrics.disciplineRate >= 80 
                          ? styles.disciplineCircleProgressHigh 
                          : styles.disciplineCircleProgressLow
                      }`}
                    />
                  </svg>
                  <div className={styles.disciplineValueText}>
                    {disciplineMetrics.disciplineRate.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.disciplineDescription}>
                  Overall discipline compliance rate based on plan following, setup quality, and stop management
                </div>
              </div>
            </div>

            {/* Emotion vs P/L Correlation */}
            <div className={styles.disciplineCard}>
              <h2 className={styles.disciplineTitle}>
                <LineChart />
                Emotion vs P/L Correlation
              </h2>
              <div className={styles.disciplineContent}>
                <div className={styles.disciplineValue}>
                  <div className={`${styles.disciplineValueText} ${
                    Math.abs(disciplineMetrics.emotionCorrelation) <= 0.3 
                      ? styles.emotionValue 
                      : styles.emotionValueHigh
                  }`}>
                    {disciplineMetrics.emotionCorrelation.toFixed(2)}
                  </div>
                </div>
                <div className={styles.disciplineDescription}>
                  Correlation between emotional state and trading performance (-1 to 1)
                </div>
              </div>
            </div>

            {/* Checklist Adherence */}
            <div className={styles.disciplineCard}>
              <h2 className={styles.disciplineTitle}>
                <Filter />
                Checklist Adherence
              </h2>
              <div className={styles.disciplineContent}>
                <div className={styles.disciplineValue}>
                  <svg className={styles.disciplineChart}>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className={styles.disciplineCircleBackground}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className={`${styles.disciplineCircle} ${styles.disciplineCircleProgress} ${
                        disciplineMetrics.checklistAdherence >= 90 
                          ? styles.disciplineCircleProgressHigh 
                          : styles.disciplineCircleProgressLow
                      }`}
                    />
                  </svg>
                  <div className={styles.disciplineValueText}>
                    {disciplineMetrics.checklistAdherence.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.disciplineDescription}>
                  Percentage of pre-trade checklist items completed across all trades
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  RiExchangeDollarLine,
  RiPieChartLine,
  RiScales3Line,
  RiLineChartLine,
  RiTimeLine,
  RiArrowDownLine,
  RiExchangeLine,
  RiCalendarCheckLine,
  RiBarChartGroupedLine,
  RiBarChartLine,
  RiArrowUpLine,
  RiFilterLine,
  RiMoreLine,
  RiPieChart2Line,
  RiSettings4Line,
  RiDownload2Line,
  RiRefreshLine,
  RiTestTubeLine,
} from 'react-icons/ri';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart, Line, Bar, Doughnut } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import { TradingCalendar } from '../components/TradingCalendar';
import type { Trade as CalendarTrade } from '../components/TradingCalendar';
import type { Trade as DBTrade } from '../types/trade';
import { generateTestTrades } from '../utils/testTrades';
import { PageHeader } from '../components/PageHeader';

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
  { id: 'line', icon: RiLineChartLine, label: 'Line' },
  { id: 'bar', icon: RiBarChartLine, label: 'Bar' }
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

const Dashboard = () => {
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
    console.log("=== HOLDING TIME CALCULATION ===");
    console.log("Total trades with exit dates:", holdingTimes.length);
    console.log("Average minutes:", avgMinutes);
    
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

  useEffect(() => {
    if (allTrades.length > 0) {
      calculateMetrics(allTrades);
    }
  }, [allTrades]);

  const calculateMetrics = (trades: Trade[]) => {
    if (!trades.length) return;

    console.log("CALCULATING METRICS - All Trades:", trades.map(t => ({
      symbol: t.symbol,
      pnl: t.pnl,
      date: t.entry_date
    })));

    // Calculate Total P&L
    const pnl = trades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
    setTotalPnL(pnl);

    // Calculate Win Rate with detailed logging
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => {
      const pnl = Number(trade.pnl);
      console.log(`Trade ${trade.symbol} PnL:`, pnl);
      return pnl > 0;
    });
    const totalWinningTrades = winningTrades.length;
    
    console.log("=== WIN RATE CALCULATION ===");
    console.log("Total Trades:", totalTrades);
    console.log("Total Winning Trades:", totalWinningTrades);
    console.log("Calculation:", totalWinningTrades, "/", totalTrades, "=", (totalWinningTrades / totalTrades));
    console.log("Win Rate:", (totalWinningTrades / totalTrades) * 100, "%");
    
    const winRate = totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0;
    setWinRate(winRate);

    // Calculate Risk-Reward Ratio
    const validRiskRewardTrades = trades.filter(trade => {
      const rr = Number(trade.risk_reward);
      return !isNaN(rr) && rr > 0;
    });
    
    const riskReward = validRiskRewardTrades.length > 0
      ? validRiskRewardTrades.reduce((sum, trade) => sum + Number(trade.risk_reward), 0) / validRiskRewardTrades.length
      : 0;
    
    console.log("=== RISK-REWARD CALCULATION ===");
    console.log("Total trades with valid RR:", validRiskRewardTrades.length);
    console.log("Average RR:", riskReward);
    
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
    
    console.log("=== EXPECTANCY CALCULATION ===");
    console.log("Total Trades:", trades.length);
    console.log("Winning Trades:", winningTrades.length);
    console.log("Average Win:", avgWin);
    console.log("Average Loss:", avgLoss);
    console.log("Win Rate:", winRate);
    console.log("Expectancy:", expectancy);
    
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
    try {
      setIsLoadingTrades(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all trades for metrics calculation
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (tradesError) throw tradesError;
      
      // Process all trades
      if (tradesData) {
        const processedTrades = tradesData.map(trade => {
          const pnl = trade.pnl !== null ? Number(trade.pnl) : 0;
          console.log(`Processing trade ${trade.symbol}:`, { pnl, original: trade.pnl });
          return {
            ...trade,
            pnl
          };
        });
        
        // Store all trades and calculate metrics
        setAllTrades(processedTrades);
        calculateMetrics(processedTrades);
        
        // Set calendar trades
        setCalendarTrades(processedTrades.map(trade => {
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
        }));

        // Set recent trades (last 10 trades) - ONLY for display
        setRecentTrades(processedTrades.slice(0, 10));
      }

    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoadingTrades(false);
    }
  };

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

  useEffect(() => {
    fetchData();
  }, []);

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
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
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
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
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

  return (
    <div style={{ 
      padding: '5px', 
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)',
    }}>
      <PageHeader 
        title="Trading Dashboard"
        subtitle={
          <span>
            <RiCalendarCheckLine />
            February 12, 2024
          </span>
        }
        actions={
          <>
            <button
              onClick={handleGenerateTestTrades}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#4B5563',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <RiTestTubeLine />
              Generate Test Trades
            </button>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <RiRefreshLine className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              style={{ 
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RiDownload2Line />
            </button>
            <button 
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 8px rgba(37, 99, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)';
              }}
            >
              <RiTimeLine />
              New Trade
            </button>
          </>
        }
      />

      {/* Filters Section */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '16px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Date Range Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}>
              <option value="ALL">All Strategies</option>
              <option value="BREAKOUT">Breakout</option>
              <option value="REVERSAL">Reversal</option>
              <option value="TREND">Trend Following</option>
            </select>
          </div>

          {/* Symbol Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Filter by symbol..."
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                width: '150px'
              }}
            />
          </div>

          {/* Trade Direction Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}>
              <option value="ALL">All Directions</option>
              <option value="LONG">Long Only</option>
              <option value="SHORT">Short Only</option>
            </select>
          </div>

          {/* Session Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}>
              <option value="ALL">All Sessions</option>
              <option value="LONDON">London</option>
              <option value="NY">New York</option>
              <option value="ASIA">Asia</option>
            </select>
          </div>

          {/* Tags Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}>
              <option value="ALL">All Tags</option>
              <option value="OVERTRADED">Overtraded</option>
              <option value="NEWS">News-based</option>
              <option value="DISCIPLINE_BREACH">Discipline Breach</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RiRefreshLine />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {/* Total Net P/L */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <h3 style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 'normal'
            }}>
              Total Net P/L
            </h3>
            <button style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '11px'
            }}>
              {showPercentage ? '%' : '$'}
            </button>
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: totalPnL >= 0 ? '#22c55e' : '#ef4444'
          }}>
            {showPercentage 
              ? `${((totalPnL / initialBalance) * 100).toFixed(2)}%`
              : `$${totalPnL.toFixed(2)}`
            }
          </div>
        </div>

        {/* Win Rate */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Win Rate
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: winRate >= 50 ? '#22c55e' : '#ef4444'
          }}>
            {winRate.toFixed(1)}%
          </div>
        </div>

        {/* Risk-Reward Ratio */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Avg Risk-Reward
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: avgRiskReward >= 2 ? '#22c55e' : '#f59e0b'
          }}>
            {avgRiskReward.toFixed(2)}R
          </div>
        </div>

        {/* Expectancy */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Expectancy
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: expectancy >= 0 ? '#22c55e' : '#ef4444'
          }}>
            ${expectancy.toFixed(2)}
          </div>
        </div>

        {/* Average Holding Time */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Avg Holding Time
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: 'white'
          }}>
            {avgHoldingTime}
          </div>
        </div>

        {/* Max Drawdown */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Max Drawdown
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: maxDrawdown <= 20 ? '#22c55e' : '#ef4444'
          }}>
            {maxDrawdown.toFixed(1)}%
          </div>
        </div>

        {/* Best Trading Day */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Best Trading Day
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: 'white'
          }}>
            {bestDayOfWeek}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            {bestDayWinRate.toFixed(1)}% win rate
          </div>
        </div>

        {/* Number of Trades */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'normal',
            marginBottom: '4px'
          }}>
            Number of Trades
          </h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: 'white'
          }}>
            {allTrades.length}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {/* Left Column - Chart */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Performance Chart */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '12px' 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  marginBottom: '2px',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Performance Overview
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Account growth over time
                </p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {chartTypes.map((type) => (
                  <button
                    key={type.id}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedChartType === type.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: selectedChartType === type.id ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                    onClick={() => setSelectedChartType(type.id)}
                  >
                    <type.icon />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: '300px' }}>
              {renderChart()}
            </div>
          </div>

          {/* Trading Calendar */}
          {isLoadingTrades ? (
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
              borderRadius: '12px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading trades...</div>
            </div>
          ) : (
            <TradingCalendar trades={calendarTrades} />
          )}
        </div>

        {/* Right Column - Recent Trades & Quick Stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Recent Trades */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            flex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '12px' 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  marginBottom: '2px',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Recent Trades
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Last 24 hours
                </p>
              </div>
              <button style={{
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
                <RiFilterLine />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isLoadingTrades ? (
                // Loading skeleton
                Array(4).fill(null).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }} />
                      <div>
                        <div style={{ 
                          width: '60px', 
                          height: '12px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px',
                          marginBottom: '6px'
                        }} />
                        <div style={{ 
                          width: '90px', 
                          height: '10px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        width: '45px', 
                        height: '12px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        marginBottom: '6px'
                      }} />
                      <div style={{ 
                        width: '60px', 
                        height: '10px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))
              ) : recentTrades.length === 0 ? (
                <div style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                }}>
                  No trades in the last 24 hours
                </div>
              ) : (
                recentTrades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: hoveredMetric === trade.id ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={() => setHoveredMetric(trade.id)}
                    onMouseLeave={() => setHoveredMetric(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: trade.type === 'Long' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: trade.type === 'Long' ? '#22c55e' : '#ef4444'
                      }}>
                        {trade.type === 'Long' ? <RiArrowUpLine size={16} /> : <RiArrowDownLine size={16} />}
                      </div>
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          marginBottom: '2px' 
                        }}>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{trade.symbol}</span>
                          <span style={{ 
                            fontSize: '11px', 
                            color: 'rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <RiTimeLine size={10} />
                            {new Date(trade.entry_date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                          ${trade.entry_price} → ${trade.exit_price || 'Open'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: (trade.pnl || 0) >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: '600',
                        marginBottom: '2px',
                        fontSize: '13px'
                      }}>
                        ${Math.abs(trade.pnl || 0)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {trade.quantity} shares
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy & Trade Type Breakdown */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '8px'
        }}>
          {/* Performance by Strategy */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RiPieChartLine />
              Performance by Strategy
            </h2>
            <div style={{ height: '300px' }}>
              <Chart type="bar" data={strategyPerformanceData} options={strategyChartOptions} />
            </div>
          </div>

          {/* Performance by Market */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RiBarChartGroupedLine />
              Performance by Market
            </h2>
            <div style={{ height: '300px' }}>
              <Chart type="bar" data={marketPerformanceData} options={strategyChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Entry/Exit Timing Heatmap */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <RiPieChart2Line />
            Entry/Exit Timing Heatmap
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'auto repeat(24, minmax(32px, 1fr))',
              gap: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1px',
              borderRadius: '8px'
            }}>
              {/* Hours Header */}
              <div style={{ padding: '6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11px' }}></div>
              {heatmapData.hours.map(hour => (
                <div
                  key={hour}
                  style={{
                    padding: '6px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    fontSize: '11px'
                  }}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}

              {/* Days and Data */}
              {heatmapData.days.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  <div style={{
                    padding: '6px',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    whiteSpace: 'nowrap',
                    fontSize: '11px'
                  }}>
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
                        style={{
                          padding: '6px',
                          backgroundColor: cell.count === 0 ? 'rgba(30, 41, 59, 0.4)' : color,
                          textAlign: 'center',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title={`${day} ${hourIndex}:00
Trades: ${cell.count}
Avg P&L: ${cell.avgPnl >= 0 ? '+' : ''}$${cell.avgPnl.toFixed(2)}`}
                      >
                        {cell.count}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 1))',
                borderRadius: '2px'
              }}></div>
              <span>Loss</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: 'linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 1))',
                borderRadius: '2px'
              }}></div>
              <span>Profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral & Discipline Metrics */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {/* Discipline Compliance Rate */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RiSettings4Line />
              Discipline Compliance
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={disciplineMetrics.disciplineRate >= 80 ? '#22c55e' : '#f59e0b'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - disciplineMetrics.disciplineRate / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {disciplineMetrics.disciplineRate.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                Overall discipline compliance rate based on plan following, setup quality, and stop management
              </div>
            </div>
          </div>

          {/* Emotion vs P/L Correlation */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RiLineChartLine />
              Emotion vs P/L Correlation
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: Math.abs(disciplineMetrics.emotionCorrelation) <= 0.3 ? '#22c55e' : '#ef4444'
                }}>
                  {disciplineMetrics.emotionCorrelation.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                Correlation between emotional state and trading performance (-1 to 1)
              </div>
            </div>
          </div>

          {/* Checklist Adherence */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RiFilterLine />
              Checklist Adherence
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={disciplineMetrics.checklistAdherence >= 90 ? '#22c55e' : '#f59e0b'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - disciplineMetrics.checklistAdherence / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {disciplineMetrics.checklistAdherence.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                Percentage of pre-trade checklist items completed across all trades
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
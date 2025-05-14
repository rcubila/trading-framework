import { useState, useEffect } from 'react';
import {
  RiCalendarLine,
  RiBarChartLine,
  RiPieChart2Line,
  RiLineChartLine,
  RiTimeLine,
  RiFilterLine,
  RiAddLine,
  RiSearchLine,
  RiEmotionLine,
  RiMoonClearLine,
  RiSunLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiExchangeDollarLine,
  RiScales3Line,
  RiBarChartGroupedLine,
  RiCalendarCheckLine,
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { supabase } from '../lib/supabase';

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

interface Trade {
  id: string;
  entry_date: string;
  exit_date: string;
  symbol: string;
  setup: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  fees: number;
  notes: string;
  emotions: string[];
  market_conditions: string[];
  mistakes: string[];
  lessons: string[];
  trade_duration: string;
  time_of_day: string;
  session: 'Pre-Market' | 'Regular' | 'After-Hours';
  strategy: string;
  risk_reward: number;
  win_loss: 'Win' | 'Loss';
}

interface JournalStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageHoldingTime: string;
  bestPerformingSetup: string;
  worstPerformingSetup: string;
  bestTimeOfDay: string;
  profitBySession: {
    preMarket: number;
    regular: number;
    afterHours: number;
  };
  emotionalBalance: number;
  mostCommonMistakes: string[];
  bestStrategies: { strategy: string; winRate: number }[];
  averageRiskPerTrade: number;
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  sharpeRatio: number;
  averageRRR: number;
  performanceByDayOfWeek: {
    day: string;
    winRate: number;
    pnl: number;
    trades: number;
  }[];
  performanceBySize: {
    size: string;
    winRate: number;
    pnl: number;
    trades: number;
  }[];
  consecutiveStats: {
    maxWinStreak: number;
    maxLossStreak: number;
    currentStreak: number;
  };
  timeStats: {
    holdingTimeDistribution: {
      duration: string;
      winRate: number;
      trades: number;
    }[];
    bestHoldingPeriod: string;
    worstHoldingPeriod: string;
  };
  marketConditionStats: {
    condition: string;
    winRate: number;
    pnl: number;
    trades: number;
  }[];
}

export const Journal = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [selectedView, setSelectedView] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const periods = [
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];

  const views = [
    { label: 'Overview', value: 'overview', icon: RiBarChartLine },
    { label: 'Trade Analysis', value: 'analysis', icon: RiLineChartLine },
    { label: 'Psychology', value: 'psychology', icon: RiEmotionLine },
    { label: 'Journal Entries', value: 'entries', icon: RiCalendarLine },
  ];

  useEffect(() => {
    fetchTrades();
  }, [selectedPeriod]);

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch trades based on selected period
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setTrades(trades || []);
      calculateStats(trades || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (trades: Trade[]) => {
    if (!trades.length) {
      setStats(null);
      return;
    }

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);

    const stats: JournalStats = {
      totalTrades: trades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      profitFactor: Math.abs(
        winningTrades.reduce((sum, t) => sum + t.pnl, 0) /
        losingTrades.reduce((sum, t) => sum + t.pnl, 0)
      ),
      averageWin: winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length,
      averageLoss: Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length),
      largestWin: Math.max(...winningTrades.map(t => t.pnl)),
      largestLoss: Math.abs(Math.min(...losingTrades.map(t => t.pnl))),
      averageHoldingTime: calculateAverageHoldingTime(trades),
      bestPerformingSetup: findBestSetup(trades),
      worstPerformingSetup: findWorstSetup(trades),
      bestTimeOfDay: findBestTimeOfDay(trades),
      profitBySession: calculateProfitBySession(trades),
      emotionalBalance: calculateEmotionalBalance(trades),
      mostCommonMistakes: findMostCommonMistakes(trades),
      bestStrategies: findBestStrategies(trades),
      averageRiskPerTrade: calculateAverageRisk(trades),
      maxDrawdown: calculateMaxDrawdown(trades),
      maxDrawdownPercentage: calculateMaxDrawdownPercentage(trades),
      sharpeRatio: calculateSharpeRatio(trades),
      averageRRR: calculateAverageRRR(trades),
      performanceByDayOfWeek: calculatePerformanceByDayOfWeek(trades),
      performanceBySize: calculatePerformanceBySize(trades),
      consecutiveStats: calculateConsecutiveStats(trades),
      timeStats: calculateTimeStats(trades),
      marketConditionStats: calculateMarketConditionStats(trades),
    };

    setStats(stats);
  };

  const calculateAverageHoldingTime = (trades: Trade[]) => {
    // Implementation for calculating average holding time
    return "25m";
  };

  const findBestSetup = (trades: Trade[]) => {
    // Implementation for finding best setup
    return "Bull Flag";
  };

  const findWorstSetup = (trades: Trade[]) => {
    // Implementation for finding worst setup
    return "VWAP Rejection";
  };

  const findBestTimeOfDay = (trades: Trade[]) => {
    // Implementation for finding best time of day
    return "10:30 AM";
  };

  const calculateProfitBySession = (trades: Trade[]) => {
    return {
      preMarket: 2500,
      regular: 15000,
      afterHours: 1800,
    };
  };

  const calculateEmotionalBalance = (trades: Trade[]) => {
    // Implementation for calculating emotional balance
    return 85;
  };

  const findMostCommonMistakes = (trades: Trade[]) => {
    // Implementation for finding most common mistakes
    return ["FOMO Entry", "Early Exit", "Size Too Large"];
  };

  const findBestStrategies = (trades: Trade[]) => {
    // Implementation for finding best strategies
    return [
      { strategy: "Momentum", winRate: 75 },
      { strategy: "Reversal", winRate: 65 },
      { strategy: "Breakout", winRate: 62 },
    ];
  };

  const calculateAverageRisk = (trades: Trade[]) => {
    return trades.reduce((sum, t) => sum + (t.entry_price * t.quantity), 0) / trades.length;
  };

  const calculateMaxDrawdown = (trades: Trade[]) => {
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;

    trades.forEach(trade => {
      runningPnL += trade.pnl;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  };

  const calculateMaxDrawdownPercentage = (trades: Trade[]) => {
    const maxDrawdown = calculateMaxDrawdown(trades);
    const totalCapital = trades.reduce((sum, t) => sum + Math.abs(t.entry_price * t.quantity), 0);
    return (maxDrawdown / totalCapital) * 100;
  };

  const calculateSharpeRatio = (trades: Trade[]) => {
    const returns = trades.map(t => t.pnl);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    return avgReturn / stdDev;
  };

  const calculateAverageRRR = (trades: Trade[]) => {
    return trades.reduce((sum, t) => sum + t.risk_reward, 0) / trades.length;
  };

  const calculatePerformanceByDayOfWeek = (trades: Trade[]) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => {
      const dayTrades = trades.filter(t => new Date(t.entry_date).getDay() === days.indexOf(day));
      const winningTrades = dayTrades.filter(t => t.pnl > 0);
      return {
        day,
        winRate: dayTrades.length ? (winningTrades.length / dayTrades.length) * 100 : 0,
        pnl: dayTrades.reduce((sum, t) => sum + t.pnl, 0),
        trades: dayTrades.length
      };
    });
  };

  const calculatePerformanceBySize = (trades: Trade[]) => {
    // Implementation for calculating performance by size
    return [];
  };

  const calculateConsecutiveStats = (trades: Trade[]) => {
    // Implementation for calculating consecutive stats
    return {
      maxWinStreak: 0,
      maxLossStreak: 0,
      currentStreak: 0,
    };
  };

  const calculateTimeStats = (trades: Trade[]) => {
    // Implementation for calculating time stats
    return {
      holdingTimeDistribution: [],
      bestHoldingPeriod: "",
      worstHoldingPeriod: "",
    };
  };

  const calculateMarketConditionStats = (trades: Trade[]) => {
    // Implementation for calculating market condition stats
    return [];
  };

  return (
    <div style={{
      padding: '5px',
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '5px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '4px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Trading Journal
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Track, analyze, and improve your trading performance
          </p>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            style={{
              padding: '5px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <RiAddLine />
            New Entry
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {views.map((view) => (
          <button
            key={view.value}
            onClick={() => setSelectedView(view.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: selectedView === view.value ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: 'none',
              color: selectedView === view.value ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <view.icon />
            {view.label}
          </button>
        ))}
      </div>

      {/* Period Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: selectedPeriod === period.value ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: selectedPeriod === period.value ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      {selectedView === 'entries' ? (
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          {/* Search and Filter Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <div style={{
                position: 'relative',
                width: '300px',
              }}>
                <RiSearchLine style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.6)',
                }} />
                <input
                  type="text"
                  placeholder="Search trades..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    outline: 'none',
                  }}
                />
              </div>
              <button style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}>
                <RiFilterLine />
                Filter
              </button>
            </div>
          </div>

          {/* Journal Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)' }}>Symbol</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)' }}>Strategy</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)' }}>Entry</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)' }}>Exit</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)' }}>Quantity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)' }}>P&L</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr
                    key={trade.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>{new Date(trade.entry_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>{trade.symbol}</td>
                    <td style={{ padding: '12px 16px' }}>{trade.strategy}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>${trade.entry_price.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>${trade.exit_price.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>{trade.quantity}</td>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      color: trade.pnl >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: '600',
                    }}>
                      ${trade.pnl.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                      }}>
                        <button style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: 'none',
                          color: '#60a5fa',
                          cursor: 'pointer',
                        }}>
                          <RiSearchLine />
                        </button>
                        <button style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: 'none',
                          color: '#22c55e',
                          cursor: 'pointer',
                        }}>
                          <RiAddLine />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Showing 1-10 of {trades.length} entries
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <button style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
              }}>
                Previous
              </button>
              <button style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}>
                1
              </button>
              <button style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
              }}>
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              {/* Primary Metrics */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <RiPieChart2Line style={{ color: '#60a5fa' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Performance</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.winRate.toFixed(1)}% Win Rate
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {stats.totalTrades} trades • ${stats.averageWin.toFixed(2)} avg win
                </div>
              </div>

              {/* Risk Metrics */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <RiScales3Line style={{ color: '#22c55e' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Risk Management</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.averageRRR.toFixed(2)}x R:R
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {stats.maxDrawdownPercentage.toFixed(1)}% max DD • ${stats.averageRiskPerTrade.toFixed(2)} avg risk
                </div>
              </div>

              {/* Consistency Metrics */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <RiBarChartGroupedLine style={{ color: '#8b5cf6' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Consistency</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.profitFactor.toFixed(2)} PF
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {stats.consecutiveStats.maxWinStreak} win streak • {stats.sharpeRatio.toFixed(2)} Sharpe
                </div>
              </div>

              {/* Time Analysis */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <RiTimeLine style={{ color: '#f59e0b' }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Timing</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.averageHoldingTime}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Best time: {stats.bestTimeOfDay}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analysis Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}>
            {/* Left Column - Charts */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}>
              {/* Performance by Day */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <RiCalendarCheckLine />
                  Performance by Day
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                }}>
                  {stats?.performanceByDayOfWeek.map((day) => (
                    <div key={day.day} style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                        {day.day}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {day.winRate.toFixed(1)}%
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: day.pnl >= 0 ? '#22c55e' : '#ef4444',
                      }}>
                        ${day.pnl.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Conditions Impact */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <RiBarChartLine />
                  Market Conditions Impact
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                }}>
                  {stats?.marketConditionStats.map((condition) => (
                    <div key={condition.condition} style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                        {condition.condition}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {condition.winRate.toFixed(1)}% WR
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {condition.trades} trades
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}>
              {/* Holding Time Distribution */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <RiTimeLine />
                  Holding Time Analysis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats?.timeStats.holdingTimeDistribution.map((time) => (
                    <div key={time.duration} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                    }}>
                      <div>
                        <div style={{ marginBottom: '4px' }}>{time.duration}</div>
                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                          {time.trades} trades
                        </div>
                      </div>
                      <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        {time.winRate.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 
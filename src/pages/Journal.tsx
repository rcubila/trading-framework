import { useState, useEffect } from 'react';
import styles from '../components/Journal/Journal.module.css';
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
  RiArrowLeftLine,
  RiArrowRightLine,
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
import { PageHeader } from '../components/PageHeader/PageHeader';
import { PageTitle } from '../components/PageTitle/PageTitle';
import { PageContainer } from '../components/PageContainer/PageContainer';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { AddEntryModal } from '../components/AddEntryModal/AddEntryModal';
import { AnimatedButton } from '../components/AnimatedButton';

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
    <div className={styles.container}>
      <PageHeader 
        title="Trading Journal"
        subtitle="Track, analyze, and improve your trading performance"
        actions={
          <button className={styles.actionButton}>
            <RiAddLine />
            New Entry
          </button>
        }
      />

      {/* View Selector */}
      <div className={styles.viewSelector}>
        {views.map((view) => (
          <button
            key={view.value}
            onClick={() => setSelectedView(view.value)}
            className={
              selectedView === view.value
                ? `${styles.viewButton} ${styles.selected}`
                : styles.viewButton
            }
          >
            <view.icon />
            {view.label}
          </button>
        ))}
      </div>

      {/* Period Selector */}
      <div className={styles.periodSelector}>
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={
              selectedPeriod === period.value
                ? `${styles.periodButton} ${styles.selected}`
                : styles.periodButton
            }
          >
            {period.label}
          </button>
        ))}
      </div>

      {selectedView === 'entries' ? (
        <div className={styles.journalContainer}>
          {/* Search and Filter Bar */}
          <div className={styles.searchBar}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className={styles.searchInput}>
                <RiSearchLine className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search trades..."
                  className={styles.input}
                />
              </div>
              <button className={styles.filterButton}>
                <RiFilterLine />
                Filter
              </button>
            </div>
          </div>

          {/* Journal Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableCell}>Date</th>
                  <th className={styles.tableCell}>Symbol</th>
                  <th className={styles.tableCell}>Strategy</th>
                  <th className={`${styles.tableCell} ${styles.right}`}>Entry</th>
                  <th className={`${styles.tableCell} ${styles.right}`}>Exit</th>
                  <th className={`${styles.tableCell} ${styles.right}`}>Quantity</th>
                  <th className={`${styles.tableCell} ${styles.right}`}>P&L</th>
                  <th className={`${styles.tableCell} ${styles.center}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr
                    key={trade.id}
                    className={styles.tableRow}
                  >
                    <td className={styles.tableCell}>{new Date(trade.entry_date).toLocaleDateString()}</td>
                    <td className={styles.tableCell}>{trade.symbol}</td>
                    <td className={styles.tableCell}>{trade.strategy}</td>
                    <td className={`${styles.tableCell} ${styles.right}`}>${trade.entry_price.toFixed(2)}</td>
                    <td className={`${styles.tableCell} ${styles.right}`}>${trade.exit_price.toFixed(2)}</td>
                    <td className={`${styles.tableCell} ${styles.right}`}>{trade.quantity}</td>
                    <td className={`${styles.tableCell} ${styles.right} ${trade.pnl >= 0 ? styles.profit : styles.loss}`}>
                      ${trade.pnl.toFixed(2)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.center}`}>
                      <div className={styles.actionButtons}>
                        <button className={`${styles.actionButton} ${styles.viewButton}`}>
                          <RiSearchLine />
                        </button>
                        <button className={`${styles.actionButton} ${styles.addButton}`}>
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
          <div className={styles.pagination}>
            <div>
              Showing 1-10 of {trades.length} entries
            </div>
            <div>
              <button className={styles.periodButton}>Previous</button>
              <button className={`${styles.periodButton} ${styles.selected}`}>1</button>
              <button className={styles.periodButton}>Next</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          {stats && (
            <div className={styles.overviewGrid}>
              {/* Primary Metrics */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <RiPieChart2Line className={styles.iconBlue} />
                  <span className={styles.cardTitle}>Performance</span>
                </div>
                <div className={styles.cardValue}>
                  {stats.winRate.toFixed(1)}% Win Rate
                </div>
                <div className={styles.cardSub}>
                  {stats.totalTrades} trades • ${stats.averageWin.toFixed(2)} avg win
                </div>
              </div>

              {/* Risk Metrics */}
              <div className={`${styles.card} ${styles.cardRisk}`}>
                <div className={styles.cardHeader}>
                  <RiScales3Line className={styles.iconGreen} />
                  <span className={styles.cardTitle}>Risk Management</span>
                </div>
                <div className={styles.cardValue}>
                  {stats.averageRRR.toFixed(2)}x R:R
                </div>
                <div className={styles.cardSub}>
                  {stats.maxDrawdownPercentage.toFixed(1)}% max DD • ${stats.averageRiskPerTrade.toFixed(2)} avg risk
                </div>
              </div>

              {/* Consistency Metrics */}
              <div className={`${styles.card} ${styles.cardConsistency}`}>
                <div className={styles.cardHeader}>
                  <RiBarChartGroupedLine className={styles.iconPurple} />
                  <span className={styles.cardTitle}>Consistency</span>
                </div>
                <div className={styles.cardValue}>
                  {stats.profitFactor.toFixed(2)} PF
                </div>
                <div className={styles.cardSub}>
                  {stats.consecutiveStats.maxWinStreak} win streak • {stats.sharpeRatio.toFixed(2)} Sharpe
                </div>
              </div>

              {/* Time Analysis */}
              <div className={`${styles.card} ${styles.cardTime}`}>
                <div className={styles.cardHeader}>
                  <RiTimeLine className={styles.iconYellow} />
                  <span className={styles.cardTitle}>Timing</span>
                </div>
                <div className={styles.cardValue}>
                  {stats.averageHoldingTime}
                </div>
                <div className={styles.cardSub}>
                  Best time: {stats.bestTimeOfDay}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analysis Section */}
          <div className={styles.analysisGrid}>
            {/* Left Column - Charts */}
            <div className={styles.analysisLeft}>
              {/* Performance by Day */}
              <div className={styles.analysisCard}>
                <h3 className={styles.analysisCardHeader}>
                  <RiCalendarCheckLine />
                  <span className={styles.analysisCardTitle}>Performance by Day</span>
                </h3>
                <div className={styles.analysisDayGrid}>
                  {stats?.performanceByDayOfWeek.map((day) => (
                    <div key={day.day} className={styles.analysisDay}>
                      <div className={styles.analysisDayLabel}>{day.day}</div>
                      <div className={styles.analysisDayValue}>{day.winRate.toFixed(1)}%</div>
                      <div className={day.pnl >= 0 ? styles.analysisDayProfit : styles.analysisDayLoss}>
                        ${day.pnl.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Conditions Impact */}
              <div className={styles.analysisCard}>
                <h3 className={styles.analysisCardHeader}>
                  <RiBarChartLine />
                  <span className={styles.analysisCardTitle}>Market Conditions Impact</span>
                </h3>
                <div className={styles.analysisConditionGrid}>
                  {stats?.marketConditionStats.map((condition) => (
                    <div key={condition.condition} className={styles.analysisCondition}>
                      <div className={styles.analysisConditionLabel}>{condition.condition}</div>
                      <div className={styles.analysisConditionValue}>{condition.winRate.toFixed(1)}% WR</div>
                      <div className={styles.analysisConditionSub}>{condition.trades} trades</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.analysisRight}>
              {/* Holding Time Distribution */}
              <div className={styles.analysisCard}>
                <h3 className={styles.analysisCardHeader}>
                  <RiTimeLine />
                  <span className={styles.analysisCardTitle}>Holding Time Analysis</span>
                </h3>
                <div>
                  {stats?.timeStats.holdingTimeDistribution.map((time) => (
                    <div key={time.duration} className={styles.analysisTimeRow}>
                      <div>
                        <div className={styles.analysisTimeLabel}>{time.duration}</div>
                        <div className={styles.analysisTimeSub}>{time.trades} trades</div>
                      </div>
                      <div className={styles.analysisTimeWinRate}>{time.winRate.toFixed(1)}%</div>
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
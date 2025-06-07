import { useState, useEffect } from 'react';
import styles from "./Journal.module.css";
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
import { supabase } from '../../lib/supabase';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PageTitle } from '../../components/PageTitle/PageTitle';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { AddEntryModal } from '../../components/AddEntryModal/AddEntryModal';
import { AnimatedButton } from '../../components/AnimatedButton';

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
  const [showAddEntry, setShowAddEntry] = useState(false);

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

  const handleAddEntry = (entry: Trade) => {
    // Implementation for adding a new entry
    console.log("Adding new entry:", entry);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Trading Journal"
        subtitle={
          <span>
            <RiCalendarLine />
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        }
        actions={
          <>
            <Button onClick={() => setShowAddEntry(true)}>
              <RiAddLine className="mr-2" />
              Add Entry
            </Button>
          </>
        }
      />

      <div className={styles.controls}>
        <div className={styles.viewControls}>
          {views.map((view) => (
            <button
              key={view.value}
              className={`${styles.viewButton} ${selectedView === view.value ? styles.selected : ''}`}
              onClick={() => setSelectedView(view.value)}
            >
              <view.icon />
              {view.label}
            </button>
          ))}
        </div>

        <div className={styles.periodControls}>
          {periods.map((period) => (
            <button
              key={period.value}
              className={`${styles.periodButton} ${selectedPeriod === period.value ? styles.selected : ''}`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : !trades.length ? (
        <div className={styles.empty}>
          <RiCalendarLine className={styles.emptyIcon} />
          <p className={styles.emptyText}>No journal entries yet</p>
          <p className={styles.emptySubtext}>Add your first trade to start tracking your progress</p>
        </div>
      ) : (
        <div className={styles.content}>
          {selectedView === 'overview' && (
            <>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Performance Overview</h2>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Trades</span>
                    <span className={styles.statValue}>{stats?.totalTrades}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Win Rate</span>
                    <span className={`${styles.statValue} ${stats?.winRate >= 50 ? styles.statValuePositive : styles.statValueNegative}`}>
                      {stats?.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Profit Factor</span>
                    <span className={styles.statValue}>{stats?.profitFactor.toFixed(2)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Average Win</span>
                    <span className={styles.statValuePositive}>${stats?.averageWin.toFixed(2)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Average Loss</span>
                    <span className={styles.statValueNegative}>${stats?.averageLoss.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Risk Management</h2>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Max Drawdown</span>
                    <span className={styles.statValueNegative}>{stats?.maxDrawdownPercentage.toFixed(1)}%</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Sharpe Ratio</span>
                    <span className={styles.statValue}>{stats?.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Avg Risk/Reward</span>
                    <span className={styles.statValue}>{stats?.averageRRR.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedView === 'entries' && (
            <div className={styles.entryList}>
              {trades.map((trade) => (
                <div key={trade.id} className={styles.entry}>
                  <div className={styles.entryHeader}>
                    <span className={styles.entryDate}>{new Date(trade.entry_date).toLocaleDateString()}</span>
                    <span className={styles.entrySymbol}>{trade.symbol}</span>
                  </div>
                  <div className={styles.entryDetails}>
                    <div className={styles.entryDetail}>
                      <span className={styles.detailLabel}>P&L</span>
                      <span className={`${styles.detailValue} ${trade.pnl >= 0 ? styles.statValuePositive : styles.statValueNegative}`}>
                        ${trade.pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.entryDetail}>
                      <span className={styles.detailLabel}>Setup</span>
                      <span className={styles.detailValue}>{trade.setup}</span>
                    </div>
                    <div className={styles.entryDetail}>
                      <span className={styles.detailLabel}>Strategy</span>
                      <span className={styles.detailValue}>{trade.strategy}</span>
                    </div>
                  </div>
                  {trade.notes && <p className={styles.entryNotes}>{trade.notes}</p>}
                  <div className={styles.tags}>
                    {trade.emotions?.map((emotion) => (
                      <span key={emotion} className={styles.tag}>{emotion}</span>
                    ))}
                    {trade.market_conditions?.map((condition) => (
                      <span key={condition} className={styles.tag}>{condition}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddEntry && (
        <AddEntryModal
          onClose={() => setShowAddEntry(false)}
          onSave={handleAddEntry}
        />
      )}
    </div>
  );
}; 
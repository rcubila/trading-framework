import { useState, useEffect } from 'react';
import {
  RiLineChartLine,
  RiTimeLine,
  RiCalendarLine,
  RiStockLine,
  RiSunLine,
  RiMoonLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri';
import styles from './PatternAnalysis.module.css';

interface Trade {
  id: string;
  symbol: string;
  type: 'Long' | 'Short';
  entry_price: number;
  exit_price?: number;
  entry_date: string;
  exit_date?: string;
  pnl?: number;
  setup_type?: string;
  market_conditions?: string;
  timeframe?: string;
}

interface PatternMetrics {
  setupPerformance: {
    setup: string;
    winRate: number;
    avgReturn: number;
    count: number;
  }[];
  timeBasedPatterns: {
    timeOfDay: string;
    winRate: number;
    avgReturn: number;
    count: number;
  }[];
  marketConditions: {
    condition: string;
    winRate: number;
    avgReturn: number;
    count: number;
  }[];
}

export const PatternAnalysis = ({ trades }: { trades: Trade[] }) => {
  const [metrics, setMetrics] = useState<PatternMetrics>({
    setupPerformance: [],
    timeBasedPatterns: [],
    marketConditions: [],
  });

  useEffect(() => {
    analyzePatterns();
  }, [trades]);

  const analyzePatterns = () => {
    // Analyze setup performance
    const setupMap = new Map<string, { wins: number; total: number; returns: number[] }>();
    const timeMap = new Map<string, { wins: number; total: number; returns: number[] }>();
    const conditionMap = new Map<string, { wins: number; total: number; returns: number[] }>();

    trades.forEach(trade => {
      const pnl = trade.pnl || 0;
      const isWin = pnl > 0;
      const returnPct = trade.exit_price && trade.entry_price 
        ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
        : 0;

      // Setup analysis
      if (trade.setup_type) {
        const setup = setupMap.get(trade.setup_type) || { wins: 0, total: 0, returns: [] };
        setup.total++;
        if (isWin) setup.wins++;
        setup.returns.push(returnPct);
        setupMap.set(trade.setup_type, setup);
      }

      // Time-based analysis
      const hour = new Date(trade.entry_date).getHours();
      let timeOfDay = '';
      if (hour < 10) timeOfDay = 'Pre-Market (4-9:30)';
      else if (hour < 12) timeOfDay = 'Morning (9:30-11:30)';
      else if (hour < 14) timeOfDay = 'Mid-Day (11:30-13:30)';
      else if (hour < 16) timeOfDay = 'Afternoon (13:30-16:00)';
      else timeOfDay = 'After-Hours (16:00+)';

      const time = timeMap.get(timeOfDay) || { wins: 0, total: 0, returns: [] };
      time.total++;
      if (isWin) time.wins++;
      time.returns.push(returnPct);
      timeMap.set(timeOfDay, time);

      // Market conditions analysis
      if (trade.market_conditions) {
        const condition = conditionMap.get(trade.market_conditions) || { wins: 0, total: 0, returns: [] };
        condition.total++;
        if (isWin) condition.wins++;
        condition.returns.push(returnPct);
        conditionMap.set(trade.market_conditions, condition);
      }
    });

    // Convert maps to sorted arrays
    const setupPerformance = Array.from(setupMap.entries())
      .map(([setup, stats]) => ({
        setup,
        winRate: (stats.wins / stats.total) * 100,
        avgReturn: stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length,
        count: stats.total,
      }))
      .sort((a, b) => b.avgReturn - a.avgReturn);

    const timeBasedPatterns = Array.from(timeMap.entries())
      .map(([timeOfDay, stats]) => ({
        timeOfDay,
        winRate: (stats.wins / stats.total) * 100,
        avgReturn: stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length,
        count: stats.total,
      }))
      .sort((a, b) => b.avgReturn - a.avgReturn);

    const marketConditions = Array.from(conditionMap.entries())
      .map(([condition, stats]) => ({
        condition,
        winRate: (stats.wins / stats.total) * 100,
        avgReturn: stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length,
        count: stats.total,
      }))
      .sort((a, b) => b.avgReturn - a.avgReturn);

    setMetrics({
      setupPerformance,
      timeBasedPatterns,
      marketConditions,
    });
  };

  return (
    <div className={styles.container}>
      {/* Setup Performance */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <RiStockLine />
          Setup Performance
        </h2>
        <div className={styles.metricsGrid}>
          {metrics.setupPerformance.map((setup) => (
            <div
              key={setup.setup}
              className={styles.metricCard}
            >
              <div>
                <div className={styles.metricName}>{setup.setup}</div>
                <div className={styles.metricCount}>
                  {setup.count} trades
                </div>
              </div>
              <div className={styles.metricValue}>
                <div className={setup.winRate >= 50 ? styles.positiveValue : styles.negativeValue}>
                  {setup.winRate.toFixed(1)}%
                </div>
                <div className={styles.metricLabel}>
                  Win Rate
                </div>
              </div>
              <div className={styles.metricValue}>
                <div className={setup.avgReturn >= 0 ? styles.positiveValue : styles.negativeValue}>
                  {setup.avgReturn >= 0 ? '+' : ''}{setup.avgReturn.toFixed(2)}%
                </div>
                <div className={styles.metricLabel}>
                  Avg Return
                </div>
              </div>
              <div className={`${styles.trendIcon} ${setup.avgReturn >= 0 ? styles.trendIconPositive : styles.trendIconNegative}`}>
                {setup.avgReturn >= 0 ? <RiArrowUpLine /> : <RiArrowDownLine />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-Based Patterns */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <RiTimeLine />
          Time-Based Patterns
        </h2>
        <div className={styles.metricsGrid}>
          {metrics.timeBasedPatterns.map((time) => (
            <div
              key={time.timeOfDay}
              className={`${styles.metricCard} ${styles.metricCardTime}`}
            >
              <div>
                <div className={styles.metricName}>{time.timeOfDay}</div>
                <div className={styles.metricCount}>
                  {time.count} trades
                </div>
              </div>
              <div className={styles.metricValue}>
                <div className={time.winRate >= 50 ? styles.positiveValue : styles.negativeValue}>
                  {time.winRate.toFixed(1)}%
                </div>
                <div className={styles.metricLabel}>
                  Win Rate
                </div>
              </div>
              <div className={styles.metricValue}>
                <div className={time.avgReturn >= 0 ? styles.positiveValue : styles.negativeValue}>
                  {time.avgReturn >= 0 ? '+' : ''}{time.avgReturn.toFixed(2)}%
                </div>
                <div className={styles.metricLabel}>
                  Avg Return
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Conditions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <RiLineChartLine />
          Market Conditions
        </h2>
        <div className={styles.metricsGrid}>
          {metrics.marketConditions.map((condition) => (
            <div
              key={condition.condition}
              className={styles.metricCard}
            >
              <div>
                <div className={styles.metricName}>{condition.condition}</div>
                <div className={styles.metricCount}>
                  {condition.count} trades
                </div>
              </div>
              <div className={styles.metricValue}>
                <div className={condition.winRate >= 50 ? styles.positiveValue : styles.negativeValue}>
                  {condition.winRate.toFixed(1)}%
                </div>
                <div className={styles.metricLabel}>
                  Win Rate
                </div>
              </div>
              <div className={styles.metricValue}>
                <div className={condition.avgReturn >= 0 ? styles.positiveValue : styles.negativeValue}>
                  {condition.avgReturn >= 0 ? '+' : ''}{condition.avgReturn.toFixed(2)}%
                </div>
                <div className={styles.metricLabel}>
                  Avg Return
                </div>
              </div>
              <div className={`${styles.trendIcon} ${condition.avgReturn >= 0 ? styles.trendIconPositive : styles.trendIconNegative}`}>
                {condition.avgReturn >= 0 ? <RiArrowUpLine /> : <RiArrowDownLine />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
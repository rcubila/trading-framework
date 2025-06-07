import React from 'react';
import styles from './Dashboard.module.css';

interface MetricsSectionProps {
  totalPnL: number;
  showPercentage: boolean;
  initialBalance: number;
  onTogglePercentage: () => void;
  winRate: number;
  avgRiskReward: number;
  expectancy: number;
  avgHoldingTime: string;
  maxDrawdown: number;
  bestDayOfWeek: string;
  bestDayWinRate: number;
  allTradesCount: number;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  totalPnL,
  showPercentage,
  initialBalance,
  onTogglePercentage,
  winRate,
  avgRiskReward,
  expectancy,
  avgHoldingTime,
  maxDrawdown,
  bestDayOfWeek,
  bestDayWinRate,
  allTradesCount
}) => (
  <div className={styles.metricsGrid}>
    {/* Total Net P/L */}
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <h3 className={styles.metricTitle}>Total Net P/L</h3>
        <button 
          className={styles.metricToggle}
          onClick={onTogglePercentage}
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
        {allTradesCount}
      </div>
    </div>
  </div>
); 
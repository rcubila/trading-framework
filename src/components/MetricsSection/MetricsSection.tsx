import React from 'react';
import styles from './MetricsSection.module.css';

interface Metrics {
  totalPnL: number;
  winRate: number;
  avgRiskReward: number;
  avgHoldingTime: number;
  maxDrawdown: number;
  bestTradingDay: number;
  expectancy: number;
}

interface MetricsSectionProps {
  metrics: Metrics;
  loading: boolean;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Total P&L</h3>
        <p className={styles.metricValue}>{formatCurrency(metrics.totalPnL)}</p>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Win Rate</h3>
        <p className={styles.metricValue}>{formatPercentage(metrics.winRate)}</p>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Avg Risk/Reward</h3>
        <p className={styles.metricValue}>{metrics.avgRiskReward.toFixed(2)}</p>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Avg Holding Time</h3>
        <p className={styles.metricValue}>{formatTime(metrics.avgHoldingTime)}</p>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Max Drawdown</h3>
        <p className={styles.metricValue}>{formatPercentage(metrics.maxDrawdown)}</p>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Best Trading Day</h3>
        <p className={styles.metricValue}>{formatCurrency(metrics.bestTradingDay)}</p>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>Expectancy</h3>
        <p className={styles.metricValue}>{formatCurrency(metrics.expectancy)}</p>
      </div>
    </div>
  );
};

export default MetricsSection; 
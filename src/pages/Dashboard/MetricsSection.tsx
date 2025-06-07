import React from 'react';
import styles from './Dashboard.module.css';

interface MetricsSectionProps {
  totalPnL: number;
  winRate: number;
  avgRiskReward: number;
  avgHoldingTime: string;
  maxDrawdown: number;
  bestDayOfWeek: string;
  bestDayWinRate: number;
  expectancy: number;
  showPercentage: boolean;
  onTogglePercentage: () => void;
  hoveredMetric: string | null;
  onMetricHover: (metric: string | null) => void;
  showMetricDetails: string | null;
  setShowMetricDetails: (metric: string | null) => void;
  isLoading: boolean;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  totalPnL,
  winRate,
  avgRiskReward,
  avgHoldingTime,
  maxDrawdown,
  bestDayOfWeek,
  bestDayWinRate,
  expectancy,
  showPercentage,
  onTogglePercentage,
  hoveredMetric,
  onMetricHover,
  showMetricDetails,
  setShowMetricDetails,
  isLoading
}) => (
  <div className={styles.metricsGrid}>
    {/* Total Net P/L */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('pnl')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'pnl' ? null : 'pnl')}
    >
      <div className={styles.metricHeader}>
        <h3 className={styles.metricTitle}>Total Net P/L</h3>
        <button 
          className={styles.metricToggle}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePercentage();
          }}
        >
          {showPercentage ? '%' : '$'}
        </button>
      </div>
      <div className={`${styles.metricValue} ${totalPnL >= 0 ? styles.metricValuePositive : styles.metricValueNegative}`}>
        {showPercentage 
          ? `${((totalPnL / 100000) * 100).toFixed(2)}%`
          : `$${totalPnL.toFixed(2)}`
        }
      </div>
    </div>

    {/* Win Rate */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('winRate')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'winRate' ? null : 'winRate')}
    >
      <h3 className={styles.metricTitle}>Win Rate</h3>
      <div className={`${styles.metricValue} ${winRate >= 50 ? styles.metricValuePositive : styles.metricValueNegative}`}>
        {winRate.toFixed(1)}%
      </div>
    </div>

    {/* Risk-Reward Ratio */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('riskReward')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'riskReward' ? null : 'riskReward')}
    >
      <h3 className={styles.metricTitle}>Avg Risk-Reward</h3>
      <div className={`${styles.metricValue} ${avgRiskReward >= 2 ? styles.metricValuePositive : styles.metricValueNeutral}`}>
        {avgRiskReward.toFixed(2)}R
      </div>
    </div>

    {/* Expectancy */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('expectancy')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'expectancy' ? null : 'expectancy')}
    >
      <h3 className={styles.metricTitle}>Expectancy</h3>
      <div className={`${styles.metricValue} ${expectancy >= 0 ? styles.metricValuePositive : styles.metricValueNegative}`}>
        ${expectancy.toFixed(2)}
      </div>
    </div>

    {/* Average Holding Time */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('holdingTime')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'holdingTime' ? null : 'holdingTime')}
    >
      <h3 className={styles.metricTitle}>Avg Holding Time</h3>
      <div className={styles.metricValue}>
        {avgHoldingTime}
      </div>
    </div>

    {/* Max Drawdown */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('drawdown')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'drawdown' ? null : 'drawdown')}
    >
      <h3 className={styles.metricTitle}>Max Drawdown</h3>
      <div className={`${styles.metricValue} ${maxDrawdown <= 20 ? styles.metricValuePositive : styles.metricValueNegative}`}>
        {maxDrawdown.toFixed(1)}%
      </div>
    </div>

    {/* Best Trading Day */}
    <div 
      className={styles.metricCard}
      onMouseEnter={() => onMetricHover('bestDay')}
      onMouseLeave={() => onMetricHover(null)}
      onClick={() => setShowMetricDetails(showMetricDetails === 'bestDay' ? null : 'bestDay')}
    >
      <h3 className={styles.metricTitle}>Best Trading Day</h3>
      <div className={styles.metricValue}>
        {bestDayOfWeek}
      </div>
      <div className={styles.metricSubtitle}>
        {bestDayWinRate.toFixed(1)}% win rate
      </div>
    </div>
  </div>
); 
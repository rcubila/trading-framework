import { Card } from '../../../components/Card';
import { formatCurrency, formatPercentage, formatTime } from '../../../utils/formatters';
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

export function MetricsSection({ metrics, loading }: MetricsSectionProps) {
  if (loading) {
    return (
      <div className={styles.metricsGrid}>
        {[...Array(7)].map((_, i) => (
          <Card key={i} className={styles.metricCard}>
            <div className={styles.skeleton} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.metricsGrid}>
      <Card className={styles.metricCard}>
        <h3>Total P&L</h3>
        <p className={metrics.totalPnL >= 0 ? styles.positive : styles.negative}>
          {formatCurrency(metrics.totalPnL)}
        </p>
      </Card>

      <Card className={styles.metricCard}>
        <h3>Win Rate</h3>
        <p>{formatPercentage(metrics.winRate)}</p>
      </Card>

      <Card className={styles.metricCard}>
        <h3>Avg Risk/Reward</h3>
        <p>{metrics.avgRiskReward.toFixed(2)}</p>
      </Card>

      <Card className={styles.metricCard}>
        <h3>Avg Holding Time</h3>
        <p>{formatTime(metrics.avgHoldingTime)}</p>
      </Card>

      <Card className={styles.metricCard}>
        <h3>Max Drawdown</h3>
        <p className={styles.negative}>{formatPercentage(metrics.maxDrawdown)}</p>
      </Card>

      <Card className={styles.metricCard}>
        <h3>Best Trading Day</h3>
        <p className={styles.positive}>{formatCurrency(metrics.bestTradingDay)}</p>
      </Card>

      <Card className={styles.metricCard}>
        <h3>Expectancy</h3>
        <p className={metrics.expectancy >= 0 ? styles.positive : styles.negative}>
          {formatCurrency(metrics.expectancy)}
        </p>
      </Card>
    </div>
  );
}

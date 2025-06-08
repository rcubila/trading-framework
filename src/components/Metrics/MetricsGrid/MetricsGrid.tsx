import React from 'react';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  BarChart2 
} from 'lucide-react';
import type { MetricsGridProps } from '../types';
import { MetricCard } from '../MetricCard/MetricCard';
import styles from './MetricsGrid.module.css';

/**
 * MetricsGrid component displays a grid of metric cards showing various trading statistics.
 * It handles the layout and organization of multiple MetricCard components.
 */
export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  showPercentage,
  onTogglePercentage,
  hoveredMetric,
  onMetricHover
}) => {
  const {
    totalPnL,
    winRate,
    avgRiskReward,
    maxDrawdown,
    bestDayOfWeek,
    bestDayWinRate,
    expectancy
  } = metrics;

  return (
    <div className={styles.metricsGrid}>
      <MetricCard
        title="P&L"
        value={showPercentage ? `${((totalPnL / 100000) * 100).toFixed(2)}%` : `$${totalPnL.toLocaleString()}`}
        icon={<DollarSign size={14} />}
        isPositive={totalPnL > 0}
        isNegative={totalPnL < 0}
        showPercentage={showPercentage}
        onTogglePercentage={onTogglePercentage}
        onHover={() => onMetricHover('pnl')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'pnl'}
      />

      <MetricCard
        title="Win rate"
        value={`${winRate.toFixed(1)}%`}
        icon={<Percent size={14} />}
        isPositive={winRate > 50}
        isNegative={winRate < 50}
        onHover={() => onMetricHover('winRate')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'winRate'}
      />

      <MetricCard
        title="R:R"
        value={avgRiskReward.toFixed(2)}
        icon={<TrendingUp size={14} />}
        isPositive={avgRiskReward > 1}
        isNegative={avgRiskReward < 1}
        onHover={() => onMetricHover('riskReward')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'riskReward'}
      />

      <MetricCard
        title="DD"
        value={`${maxDrawdown.toFixed(1)}%`}
        icon={<AlertTriangle size={14} />}
        isNegative={true}
        onHover={() => onMetricHover('drawdown')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'drawdown'}
      />

      <MetricCard
        title="Best"
        value={bestDayOfWeek}
        subtitle={`${bestDayWinRate.toFixed(1)}%`}
        icon={<Calendar size={14} />}
        isPositive={bestDayWinRate > 50}
        isNegative={bestDayWinRate < 50}
        onHover={() => onMetricHover('bestDay')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'bestDay'}
      />

      <MetricCard
        title="Exp"
        value={`$${expectancy.toFixed(2)}`}
        icon={<BarChart2 size={14} />}
        isPositive={expectancy > 0}
        isNegative={expectancy < 0}
        onHover={() => onMetricHover('expectancy')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'expectancy'}
      />
    </div>
  );
}; 
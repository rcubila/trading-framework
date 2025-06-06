import React from 'react';
import { 
  DollarSign, 
  Percent, 
  Clock, 
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
    avgHoldingTime,
    maxDrawdown,
    bestDayOfWeek,
    bestDayWinRate,
    expectancy
  } = metrics;

  return (
    <div className={styles.metricsGrid}>
      <MetricCard
        title="Total P&L"
        value={showPercentage ? `${((totalPnL / 100000) * 100).toFixed(2)}%` : `$${totalPnL.toLocaleString()}`}
        icon={<DollarSign size={20} />}
        isPositive={totalPnL > 0}
        isNegative={totalPnL < 0}
        showPercentage={showPercentage}
        onTogglePercentage={onTogglePercentage}
        onHover={() => onMetricHover('pnl')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'pnl'}
      />

      <MetricCard
        title="Win Rate"
        value={`${winRate.toFixed(1)}%`}
        icon={<Percent size={20} />}
        isPositive={winRate > 50}
        isNegative={winRate < 50}
        onHover={() => onMetricHover('winRate')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'winRate'}
      />

      <MetricCard
        title="Avg Risk/Reward"
        value={avgRiskReward.toFixed(2)}
        icon={<TrendingUp size={20} />}
        isPositive={avgRiskReward > 1}
        isNegative={avgRiskReward < 1}
        onHover={() => onMetricHover('riskReward')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'riskReward'}
      />

      <MetricCard
        title="Avg Holding Time"
        value={avgHoldingTime}
        icon={<Clock size={20} />}
        onHover={() => onMetricHover('holdingTime')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'holdingTime'}
      />

      <MetricCard
        title="Max Drawdown"
        value={`${maxDrawdown.toFixed(1)}%`}
        icon={<AlertTriangle size={20} />}
        isNegative={true}
        onHover={() => onMetricHover('drawdown')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'drawdown'}
      />

      <MetricCard
        title="Best Trading Day"
        value={bestDayOfWeek}
        subtitle={`${bestDayWinRate.toFixed(1)}% win rate`}
        icon={<Calendar size={20} />}
        isPositive={bestDayWinRate > 50}
        isNegative={bestDayWinRate < 50}
        onHover={() => onMetricHover('bestDay')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'bestDay'}
      />

      <MetricCard
        title="Expectancy"
        value={`$${expectancy.toFixed(2)}`}
        icon={<BarChart2 size={20} />}
        isPositive={expectancy > 0}
        isNegative={expectancy < 0}
        onHover={() => onMetricHover('expectancy')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'expectancy'}
      />
    </div>
  );
}; 
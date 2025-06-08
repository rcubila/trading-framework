import React from 'react';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  BarChart2,
  Calendar
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
    totalPnL = 0,
    winRate = 0,
    avgRiskReward = 0,
    profitFactor = 0,
    avgPnlPerDay = 0
  } = metrics || {};

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
        title="Win Rate"
        value={`${winRate.toFixed(1)}%`}
        icon={<Percent size={14} />}
        isPositive={winRate > 50}
        isNegative={winRate < 50}
        onHover={() => onMetricHover('winRate')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'winRate'}
      />

      <MetricCard
        title="Risk-Reward"
        value={`${avgRiskReward.toFixed(2)}R`}
        icon={<TrendingUp size={14} />}
        isPositive={avgRiskReward > 2}
        isNeutral={avgRiskReward <= 2}
        onHover={() => onMetricHover('riskReward')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'riskReward'}
      />

      <MetricCard
        title="Profit Factor"
        value={profitFactor.toFixed(2)}
        icon={<BarChart2 size={14} />}
        isPositive={profitFactor > 1.5}
        isNeutral={profitFactor <= 1.5}
        onHover={() => onMetricHover('profitFactor')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'profitFactor'}
      />

      <MetricCard
        title="Avg. P&L/Day"
        value={`$${avgPnlPerDay.toFixed(2)}`}
        icon={<Calendar size={14} />}
        isPositive={avgPnlPerDay > 0}
        isNegative={avgPnlPerDay < 0}
        onHover={() => onMetricHover('avgPnlPerDay')}
        onLeave={() => onMetricHover(null)}
        isHovered={hoveredMetric === 'avgPnlPerDay'}
      />
    </div>
  );
}; 
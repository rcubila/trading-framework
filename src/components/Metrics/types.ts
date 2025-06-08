export interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  isPositive?: boolean;
  isNegative?: boolean;
  isNeutral?: boolean;
  showPercentage?: boolean;
  onTogglePercentage?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
  isHovered?: boolean;
}

export interface MetricsGridProps {
  metrics: {
    totalPnL: number;
    winRate: number;
    avgRiskReward: number;
    profitFactor: number;
    avgPnlPerDay: number;
  };
  showPercentage: boolean;
  onTogglePercentage: () => void;
  hoveredMetric: string | null;
  onMetricHover: (metric: string | null) => void;
}

export interface MetricValue {
  value: number | string;
  isPositive?: boolean;
  isNegative?: boolean;
  isNeutral?: boolean;
} 
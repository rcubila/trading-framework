export type DateRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface Strategy {
  id: string;
  name: string;
  asset: string;
}

export interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: Date;
  exitTime: Date;
  pnl: number;
  strategy: string;
  type: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  riskReward: number;
  holdingTime: number;
}

export interface MetricValue {
  value: number;
  change?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  isNeutral?: boolean;
  showPercentage?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: MetricValue;
  icon?: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
}

export interface MetricsGridProps {
  metrics: {
    totalPnL: MetricValue;
    winRate: MetricValue;
    avgRiskReward: MetricValue;
    avgHoldingTime: MetricValue;
    maxDrawdown: MetricValue;
    bestDayOfWeek: MetricValue;
    bestDayWinRate: MetricValue;
    expectancy: MetricValue;
  };
  showPercentage: boolean;
  onTogglePercentage: () => void;
  hoveredMetric: string | null;
  onMetricHover: (metric: string | null) => void;
} 
import React from 'react';
import type { Metrics } from '../../types/metrics';

interface MetricsSectionProps {
  metrics: Metrics;
  loading: boolean;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-1 mb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
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
    <div className="grid grid-cols-7 gap-1 mb-4">
      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">Total P&L</h3>
        <p className="text-xs font-semibold text-white">{formatCurrency(metrics.totalPnL)}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">Win Rate</h3>
        <p className="text-xs font-semibold text-white">{formatPercentage(metrics.winRate)}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">R:R</h3>
        <p className="text-xs font-semibold text-white">{metrics.avgRiskReward.toFixed(2)}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">Time</h3>
        <p className="text-xs font-semibold text-white">{formatTime(metrics.avgHoldingTime)}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">DD</h3>
        <p className="text-xs font-semibold text-white">{formatPercentage(metrics.maxDrawdown)}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">Best</h3>
        <p className="text-xs font-semibold text-white">{formatCurrency(metrics.bestTradingDay)}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded p-2">
        <h3 className="text-[10px] text-white/60">Exp</h3>
        <p className="text-xs font-semibold text-white">{formatCurrency(metrics.expectancy)}</p>
      </div>
    </div>
  );
};

export default MetricsSection; 
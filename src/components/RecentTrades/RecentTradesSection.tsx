import React from 'react';
import styles from './RecentTradesSection.module.css';
import type { Trade } from '../../types/trade';

interface RecentTradesSectionProps {
  trades: Trade[];
  loading: boolean;
}

const RecentTradesSection: React.FC<RecentTradesSectionProps> = ({ trades, loading }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent Trades</h2>
        </div>
        <div className={styles.skeletonList}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Trades</h2>
      </div>
      <div className={styles.tradesList}>
        {trades.map((trade) => (
          <div key={trade.id} className={styles.tradeItem}>
            <div className={styles.tradeInfo}>
              <span className={styles.symbol}>{trade.symbol}</span>
              <span className={styles.type}>{trade.type}</span>
              <span className={styles.date}>{formatDate(trade.entry_date)}</span>
            </div>
            <div className={styles.tradeMetrics}>
              <span className={`${styles.pnl} ${(trade.pnl || 0) >= 0 ? styles.positive : styles.negative}`}>
                {formatCurrency(trade.pnl || 0)}
              </span>
              <span className={styles.riskReward}>
                R:R {trade.risk_reward?.toFixed(2) || 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTradesSection; 
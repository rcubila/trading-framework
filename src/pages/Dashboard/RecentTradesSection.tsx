import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import styles from './Dashboard.module.css';

interface RecentTradesSectionProps {
  recentTrades: any[];
  hoveredMetric: string | null;
  setHoveredMetric: (id: string | null) => void;
}

export const RecentTradesSection: React.FC<RecentTradesSectionProps> = ({ recentTrades, hoveredMetric, setHoveredMetric }) => (
  <div className={styles.chartSection}>
    <div className={styles.chartHeader}>
      <div>
        <h3 className={styles.chartTitle}>Recent Trades</h3>
        <p className={styles.chartSubtitle}>Last 24 hours</p>
      </div>
      <button className={styles.chartTypeButton}>
        {/* Filter icon can be added here if needed */}
        Filter
      </button>
    </div>
    <div className={styles.recentTradesList}>
      {recentTrades.map((trade, index) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${styles.tradeItem} ${hoveredMetric === trade.id ? styles.tradeItemHovered : ''}`}
          onMouseEnter={() => setHoveredMetric(trade.id)}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className={styles.tradeInfo}>
            <div className={`${styles.tradeIcon} ${trade.type === 'Long' ? styles.tradeIconLong : styles.tradeIconShort}`}>
              {trade.type === 'Long' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            </div>
            <div>
              <div className={styles.tradeHeader}>
                <span className={styles.tradeSymbol}>{trade.symbol}</span>
                <span className={styles.tradeDate}>
                  <Clock size={10} />
                  {new Date(trade.entry_date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              <div className={styles.tradePrice}>
                ${trade.entry_price} → ${trade.exit_price || 'Open'}
              </div>
            </div>
          </div>
          <div className={styles.tradePnl}>
            <div className={`${styles.tradePnlValue} ${(trade.pnl || 0) >= 0 ? styles.tradePnlValuePositive : styles.tradePnlValueNegative}`}>
              ${Math.abs(trade.pnl || 0)}
            </div>
            <div className={styles.tradeQuantity}>
              {trade.quantity} shares
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
); 
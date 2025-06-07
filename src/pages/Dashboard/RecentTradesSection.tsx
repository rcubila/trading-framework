import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './Dashboard.module.css';
import type { NormalizedTrade } from './index';

interface RecentTradesSectionProps {
  recentTrades: NormalizedTrade[];
}

const RecentTradesSection: React.FC<RecentTradesSectionProps> = ({ recentTrades }) => {
  return (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Recent Trades</h3>
          <p className={styles.chartSubtitle}>Latest trading activity</p>
        </div>
      </div>
      <div className={styles.recentTradesList}>
        {recentTrades.map((trade) => (
          <motion.div
            key={trade.id}
            className={styles.tradeItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.tradeInfo}>
              <div className={styles.tradeSymbol}>
                {trade.symbol}
              </div>
              <div className={styles.tradeDetails}>
                <span className={styles.tradeType}>{trade.type}</span>
                <span className={styles.tradeMarket}>{trade.market}</span>
              </div>
            </div>
            <div className={styles.tradeResult}>
              <div className={`${styles.tradePnl} ${trade.pnl >= 0 ? styles.profit : styles.loss}`}>
                {trade.pnl >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                ${Math.abs(trade.pnl).toFixed(2)}
              </div>
              <div className={styles.tradeStrategy}>{trade.strategy}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentTradesSection; 
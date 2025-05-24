import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './TradeList.module.css';

interface Trade {
  id: string;
  symbol: string;
  date: string;
  pnl: number;
}

interface TradeListProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onTradeClick }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Trades</h3>
      </div>
      <div className={styles.list}>
        {trades.map((trade) => (
          <div
            key={trade.id}
            className={styles.tradeItem}
            onClick={() => onTradeClick(trade)}
          >
            <div className={styles.tradeInfo}>
              <span className={styles.symbol}>{trade.symbol}</span>
              <span className={styles.date}>{trade.date}</span>
            </div>
            <div className={`${styles.pnl} ${trade.pnl >= 0 ? styles.profit : styles.loss}`}>
              {trade.pnl >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeList; 
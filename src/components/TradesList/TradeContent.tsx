import React from 'react';
import { RiArrowUpLine, RiArrowDownLine, RiDeleteBinLine } from 'react-icons/ri';
import type { Trade } from '../../types/trade';
import { formatPnL } from '../../utils/trading';
import styles from './TradesList.module.css';

interface TradeContentProps {
  trade: Trade;
  onDeleteClick?: (trade: Trade) => void;
  onSelectTrade: (trade: Trade) => void;
  selectedTrades?: Set<string>;
}

export const TradeContent = ({ 
  trade, 
  onDeleteClick, 
  onSelectTrade,
  selectedTrades = new Set()
}: TradeContentProps) => {
  const isSelected = selectedTrades.has(trade.id);
  const isLong = trade.type === 'Long';
  const pnl = trade.pnl ? formatPnL(trade.pnl) : '0.00';
  const pnlClass = trade.pnl && trade.pnl >= 0 ? styles.profit : styles.loss;

  return (
    <div className={styles.tradeContent}>
      <div className={styles.tradeLeft}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectTrade(trade)}
          className={styles.checkbox}
          onClick={(e) => e.stopPropagation()}
        />
        <div className={styles.tradeInfo}>
          <div className={styles.symbol}>{trade.symbol}</div>
          <div className={styles.date}>{new Date(trade.entry_date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className={styles.tradeRight}>
        <div className={styles.tradeDetails}>
          <div className={styles.type}>
            {isLong ? <RiArrowUpLine className={styles.longIcon} /> : <RiArrowDownLine className={styles.shortIcon} />}
            {trade.type}
          </div>
          <div className={styles.pnl}>
            <span className={pnlClass}>{pnl}</span>
          </div>
        </div>
        {onDeleteClick && (
          <button 
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(trade);
            }}
          >
            <RiDeleteBinLine />
          </button>
        )}
      </div>
    </div>
  );
}; 
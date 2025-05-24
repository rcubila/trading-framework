import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreVertical, Edit, Trash2 } from 'lucide-react';
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
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (trade: Trade) => void;
}

const TradeList: React.FC<TradeListProps> = ({ 
  trades, 
  onTradeClick, 
  onEditTrade, 
  onDeleteTrade 
}) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleMenuClick = (e: React.MouseEvent, tradeId: string) => {
    e.stopPropagation();
    setShowMenu(showMenu === tradeId ? null : tradeId);
  };

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
            <div className={styles.tradeActions}>
              <div className={`${styles.pnl} ${trade.pnl >= 0 ? styles.profit : styles.loss}`}>
                {trade.pnl >= 0 ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
              </div>
              <div className={styles.menuContainer}>
                <button 
                  className={styles.menuButton}
                  onClick={(e) => handleMenuClick(e, trade.id)}
                >
                  <MoreVertical size={16} />
                </button>
                {showMenu === trade.id && (
                  <div className={styles.menuDropdown}>
                    {onEditTrade && (
                      <button 
                        className={styles.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTrade(trade);
                          setShowMenu(null);
                        }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    )}
                    {onDeleteTrade && (
                      <button 
                        className={styles.menuItemDelete}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this trade?')) {
                            onDeleteTrade(trade);
                          }
                          setShowMenu(null);
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeList; 
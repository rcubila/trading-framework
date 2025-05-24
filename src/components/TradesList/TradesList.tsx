import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { RiArrowUpLine, RiArrowDownLine, RiDeleteBinLine, RiMoreLine, RiEditLine, RiFileCopyLine } from 'react-icons/ri';
import { FixedSizeList as List } from 'react-window';
import type { Trade } from '../types/trade';
import { formatPnL } from '../utils/trading';
import styles from './TradesList.module.css';

interface TradesListProps {
  fetchTrades: (page: number, pageSize: number) => Promise<Trade[]>;
  initialPageSize?: number;
  onTradeClick: (trade: Trade) => void;
  onDeleteClick: (trade: Trade) => void;
  selectedTrades: Set<string>;
  onSelectTrade: (tradeId: string) => void;
  onSelectAll: (trades: Trade[]) => void;
  refreshTrigger: number;
}

interface TradeMenuProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

interface RowProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  isSelected: boolean;
  onSelect: (tradeId: string) => void;
}

interface TradeContentProps {
  trades: Trade[];
  onDeleteClick: (tradeId: string) => void;
  onSelectTrade: (trade: Trade) => void;
}

const ITEM_SIZE = 72; // Height of each trade row
const LOADING_BUFFER = 10; // Number of items to load before reaching the end

// Add dropdown menu component
const TradeMenu = ({ trade, onEdit, onDelete }: TradeMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.menuContainer}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={styles.menuTrigger}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {isOpen && (
        <div 
          className={`${styles.menu} ${styles.menuPosition}`}
          style={{
            '--menu-top': `${position.top}px`,
            '--menu-right': `${position.right}px`
          } as React.CSSProperties}
        >
          <button className={styles.menuButton} onClick={() => onEdit(trade)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button className={styles.menuButtonDelete} onClick={() => onDelete(trade.id)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Modify TradeContent to include menu functionality
const TradeContent = ({ trades, onDeleteClick, onSelectTrade }: TradeContentProps) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  return (
    <div className={styles.listContainer}>
      {trades.map((trade) => (
        <Row
          key={trade.id}
          trade={trade}
          onEdit={onSelectTrade}
          onDelete={onDeleteClick}
          isSelected={selectedTrade?.id === trade.id}
          onSelect={(tradeId) => setSelectedTrade(trades.find(t => t.id === tradeId) || null)}
        />
      ))}
    </div>
  );
};

// Memoize the row component
const Row = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: { 
    trades: Trade[]; 
    onTradeClick?: (trade: Trade) => void;
    onDeleteClick?: (trade: Trade) => void;
    selectedTrades: Set<string>;
    onSelectTrade: (tradeId: string) => void;
  } 
}) => {
  const trade = data.trades[index];
  
  if (!trade) {
    return (
      <div className={styles.skeleton} style={style}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    );
  }

  return (
    <div
      className={styles.tradeRow}
      style={style}
      onClick={() => data.onTradeClick?.(trade)}
    >
      <TradeContent trade={trade} onDeleteClick={data.onDeleteClick} onSelectTrade={data.onSelectTrade} />
    </div>
  );
});

Row.displayName = 'Row';

// Add PageSizeSelector component
const PageSizeSelector = memo(({ 
  pageSize, 
  onPageSizeChange 
}: { 
  pageSize: number; 
  onPageSizeChange: (size: number) => void;
}) => (
  <div className={styles.pageSizeSelector}>
    <span className={styles.headerText}>Show:</span>
    <select
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      className={styles.pageSizeSelect}
    >
      <option value={10}>10 trades</option>
      <option value={20}>20 trades</option>
      <option value={50}>50 trades</option>
      <option value={100}>100 trades</option>
    </select>
  </div>
));

PageSizeSelector.displayName = 'PageSizeSelector';

export const TradesList = ({
  fetchTrades,
  initialPageSize = 10,
  onTradeClick,
  onDeleteClick,
  selectedTrades,
  onSelectTrade,
  onSelectAll,
  refreshTrigger
}: TradesListProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const listHeight = 600;

  const loadTrades = useCallback(async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const newTrades = await fetchTrades(page, pageSize);
      setTrades(prev => page === 1 ? newTrades : [...prev, ...newTrades]);
      setHasMore(newTrades.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
      console.error('Error loading trades:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchTrades, page, pageSize, refreshTrigger]);

  useEffect(() => {
    // Don't clear trades immediately to avoid flickering
    loadTrades();
  }, [loadTrades, refreshTrigger]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className={styles.tradesListContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <input
            type="checkbox"
            checked={trades.length > 0 && selectedTrades.size === trades.length}
            onChange={() => onSelectAll(trades)}
            className={styles.checkbox}
          />
          <span className={styles.headerText}>Select All</span>
        </div>
        <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
      </div>

      <div className={styles.content}>
        {error ? (
          <div className={styles.errorMessage}>
            {error}
          </div>
        ) : (
          <>
            <div className={styles.tableHeader}>
              <div></div>
              <div>Symbol</div>
              <div>Date</div>
              <div>Type</div>
              <div>Entry</div>
              <div>Exit</div>
              <div>P&L</div>
              <div>Status</div>
              <div></div>
            </div>
            <List
              height={listHeight}
              itemCount={trades.length}
              itemSize={ITEM_SIZE}
              width="100%"
              itemData={{ 
                trades, 
                onTradeClick, 
                onDeleteClick,
                selectedTrades,
                onSelectTrade
              }}
              className={styles.listContainer}
            >
              {Row}
            </List>
            
            {loading && (
              <div className={styles.loadingMessage}>
                Loading trades...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 
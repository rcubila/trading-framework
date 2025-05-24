import { useState, useEffect, useRef, useCallback, memo } from 'react';
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

const ITEM_SIZE = 72; // Height of each trade row
const LOADING_BUFFER = 10; // Number of items to load before reaching the end

// Add dropdown menu component
const TradeMenu = memo(({ 
  trade, 
  onDeleteClick,
  onClose,
  position
}: { 
  trade: Trade;
  onDeleteClick?: (trade: Trade) => void;
  onClose: () => void;
  position: { top: number | string; right: number | string };
}) => (
  <div className={`${styles.menu} ${styles.menuPosition}`} style={{ top: position.top, right: position.right }}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(trade, null, 2));
        onClose();
      }}
      className={styles.menuButton}
    >
      <RiFileCopyLine size={16} />
      Copy Data
    </button>
    
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (onDeleteClick) {
          onDeleteClick(trade);
        }
        onClose();
      }}
      className={styles.menuButtonDelete}
    >
      <RiDeleteBinLine size={16} />
      Delete Trade
    </button>
  </div>
));

TradeMenu.displayName = 'TradeMenu';

// Modify TradeContent to include menu functionality
const TradeContent = memo(({ 
  trade, 
  onDeleteClick,
  selectedTrades,
  onSelectTrade
}: { 
  trade: Trade; 
  onDeleteClick?: (trade: Trade) => void;
  selectedTrades: Set<string>;
  onSelectTrade: (tradeId: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.tradeContent}>
      <div>
        <input
          type="checkbox"
          checked={selectedTrades.has(trade.id)}
          onChange={(e) => {
            e.stopPropagation();
            onSelectTrade(trade.id);
          }}
          className={styles.checkbox}
        />
      </div>
      <div>{trade.symbol}</div>
      <div>{new Date(trade.entry_date).toLocaleDateString()}</div>
      <div>{trade.type}</div>
      <div>${trade.entry_price}</div>
      <div>${trade.exit_price || '-'}</div>
      <div className={(trade.pnl || 0) > 0 ? styles.pnlPositive : (trade.pnl || 0) < 0 ? styles.pnlNegative : ''}>
        {formatPnL(trade.pnl || 0)}
      </div>
      <div>{trade.status}</div>
      <div className={styles.menuContainer}>
        <div 
          ref={menuButtonRef}
          className={styles.menuButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <RiMoreLine />
        </div>
        {showMenu && (
          <TradeMenu 
            trade={trade} 
            onDeleteClick={onDeleteClick} 
            onClose={() => setShowMenu(false)}
            position={{ top: '100%', right: 0 }}
          />
        )}
      </div>
    </div>
  );
});

TradeContent.displayName = 'TradeContent';

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
      <TradeContent trade={trade} onDeleteClick={data.onDeleteClick} selectedTrades={data.selectedTrades} onSelectTrade={data.onSelectTrade} />
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
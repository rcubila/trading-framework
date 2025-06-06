import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { RiArrowUpLine, RiArrowDownLine, RiDeleteBinLine, RiMoreLine, RiEditLine, RiFileCopyLine } from 'react-icons/ri';
import { FixedSizeList as List } from 'react-window';
import type { Trade } from '../../types/trade';
import { formatPnL } from '../../utils/trading';
import { SkeletonLoader } from '../SkeletonLoader';
import styles from './TradesList.module.css';

interface TradesListProps {
  fetchTrades: (page: number, pageSize: number) => Promise<Trade[]>;
  initialPageSize?: number;
  onTradeClick: (trade: Trade) => void;
  onDeleteClick: (trade: Trade) => void;
  selectedTrades: Set<string>;
  onSelectTrade: (trade: Trade) => void;
  onSelectAll: (trades: Trade[]) => void;
  refreshTrigger: number;
}

interface TradeMenuProps {
  trade: Trade;
  onDeleteClick?: (trade: Trade) => void;
  onClose: () => void;
  position: { top: number | string; right: number | string };
}

interface TradeContentProps {
  trade: Trade;
  onDeleteClick?: (trade: Trade) => void;
  isSelected: boolean;
  onSelect: (trade: Trade) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    trades: Trade[];
    onTradeClick?: (trade: Trade) => void;
    onDeleteClick?: (trade: Trade) => void;
    selectedTrades: Set<string>;
    onSelectTrade: (trade: Trade) => void;
  };
}

const ITEM_SIZE = 72;
const LOADING_BUFFER = 10; // Number of items to load before reaching the end

const TradeMenu = memo(({ trade, onDeleteClick, onClose, position }: TradeMenuProps) => (
  <div 
    className={styles.tradesList__dropdown}
    style={{ top: position.top, right: position.right }}
  >
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(trade, null, 2));
        onClose();
      }}
      className={styles.tradesList__button}
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
      className={`${styles.tradesList__button} ${styles['tradesList__button--delete']}`}
    >
      <RiDeleteBinLine size={16} />
      Delete Trade
    </button>
  </div>
));

TradeMenu.displayName = 'TradeMenu';

const TradeContent = memo(({ 
  trade, 
  onDeleteClick,
  isSelected,
  onSelect
}: TradeContentProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className={`${styles.tradesList__row} ${isSelected ? styles['tradesList__row--selected'] : ''}`}
      onClick={() => onSelect(trade)}
    >
      <div className={styles.tradesList__content}>
        <div className={styles.tradesList__info}>
          <span className={styles.tradesList__symbol}>{trade.symbol}</span>
          <span className={styles.tradesList__date}>{new Date(trade.entry_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className={styles.tradesList__menu}>
        <div 
          ref={menuButtonRef}
          className={styles.tradesList__menuTrigger}
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

const renderSkeletonRow = (style: React.CSSProperties) => (
  <div className={styles.tradesList__skeleton} style={style}>
    <div className={styles.tradesList__skeletonLine} />
    <div className={styles.tradesList__skeletonLine} />
  </div>
);

const Row = memo(({ index, style, data }: RowProps) => {
  const trade = data.trades[index];
  
  if (!trade) {
    return (
      <div className={styles.tradesList__skeleton} style={style}>
        <div className={styles.tradesList__skeletonLine} />
        <div className={styles.tradesList__skeletonLine} />
      </div>
    );
  }

  return (
    <div style={style}>
      <TradeContent 
        trade={trade} 
        onDeleteClick={data.onDeleteClick} 
        isSelected={data.selectedTrades.has(trade.id)}
        onSelect={data.onSelectTrade}
      />
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

  const renderSkeletonHeader = () => (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <SkeletonLoader type="circle" width="20px" height="20px" />
        <SkeletonLoader type="text" width="80px" height="16px" />
      </div>
      <div className={styles.headerRight}>
        <SkeletonLoader type="button" width="100px" height="32px" />
      </div>
    </div>
  );

  const renderSkeletonTable = () => (
    <div className={styles.content}>
      <div className={styles.tableHeader}>
        <div></div>
        <div><SkeletonLoader type="text" width="60px" height="16px" /></div>
        <div><SkeletonLoader type="text" width="80px" height="16px" /></div>
        <div><SkeletonLoader type="text" width="40px" height="16px" /></div>
        <div><SkeletonLoader type="text" width="60px" height="16px" /></div>
        <div><SkeletonLoader type="text" width="60px" height="16px" /></div>
        <div><SkeletonLoader type="text" width="40px" height="16px" /></div>
        <div><SkeletonLoader type="text" width="60px" height="16px" /></div>
        <div></div>
      </div>
      <List
        height={listHeight}
        itemCount={pageSize}
        itemSize={ITEM_SIZE}
        width="100%"
        itemData={{ 
          trades: [], 
          onTradeClick, 
          onDeleteClick, 
          selectedTrades, 
          onSelectTrade,
          isLoading: true
        }}
        className={styles.listContainer}
      >
        {Row}
      </List>
    </div>
  );

  if (loading && trades.length === 0) {
    return (
      <div className={styles.tradesListContainer}>
        {renderSkeletonHeader()}
        {renderSkeletonTable()}
      </div>
    );
  }

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
              itemCount={trades.length + (loading ? pageSize : 0)}
              itemSize={ITEM_SIZE}
              width="100%"
              itemData={{ 
                trades, 
                onTradeClick, 
                onDeleteClick,
                selectedTrades,
                onSelectTrade,
                isLoading: loading
              }}
              className={styles.listContainer}
              onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
                if (!scrollUpdateWasRequested && !loading && hasMore) {
                  const maxOffset = (trades.length - LOADING_BUFFER) * ITEM_SIZE;
                  if (scrollOffset >= maxOffset) {
                    handleLoadMore();
                  }
                }
              }}
            >
              {Row}
            </List>
          </>
        )}
      </div>
    </div>
  );
}; 
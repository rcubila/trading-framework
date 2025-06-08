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
  selectedTrades: Set<string>;
  onSelectTrade: (trade: Trade) => void;
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
    role="menu"
    aria-label="Trade actions"
  >
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(trade, null, 2));
        onClose();
      }}
      className={styles.tradesList__button}
      role="menuitem"
    >
      <RiFileCopyLine size={16} aria-hidden="true" />
      <span>Copy Data</span>
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
      role="menuitem"
    >
      <RiDeleteBinLine size={16} aria-hidden="true" />
      <span>Delete Trade</span>
    </button>
  </div>
));

TradeMenu.displayName = 'TradeMenu';

const TradeContent = memo(({ 
  trade, 
  onDeleteClick,
  selectedTrades,
  onSelectTrade
}: { 
  trade: Trade; 
  onDeleteClick?: (trade: Trade) => void;
  selectedTrades: Set<string>;
  onSelectTrade: (trade: Trade) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isSelected = selectedTrades.has(trade.id);
  const isLong = trade.type === 'Long';
  const pnl = trade.pnl ? formatPnL(trade.pnl) : '0.00';
  const pnlClass = trade.pnl && trade.pnl >= 0 ? styles['trades-list__pnl--profit'] : styles['trades-list__pnl--loss'];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowMenu(!showMenu);
    } else if (e.key === 'Escape' && showMenu) {
      setShowMenu(false);
    }
  };

  return (
    <div 
      className={styles['trades-list__content']}
      role="row"
      aria-selected={isSelected}
    >
      <div className={styles['trades-list__left']}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectTrade(trade)}
          className={styles['trades-list__checkbox']}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select trade ${trade.symbol}`}
        />
        <div className={styles['trades-list__info']}>
          <div className={styles['trades-list__symbol']}>{trade.symbol}</div>
          <div className={styles['trades-list__date']}>{new Date(trade.entry_date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className={styles['trades-list__right']}>
        <div className={styles['trades-list__details']}>
          <div className={styles['trades-list__type']}>
            {isLong ? (
              <RiArrowUpLine className={styles['trades-list__type--long']} aria-hidden="true" />
            ) : (
              <RiArrowDownLine className={styles['trades-list__type--short']} aria-hidden="true" />
            )}
            <span>{trade.type}</span>
          </div>
          <div className={`${styles['trades-list__pnl']} ${pnlClass}`}>
            {pnl}
          </div>
        </div>
        <div className={styles['trades-list__menu']}>
          <button 
            ref={menuButtonRef}
            className={styles['trades-list__menu-trigger']}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            onKeyDown={handleKeyDown}
            aria-expanded={showMenu}
            aria-haspopup="true"
            aria-label="Trade actions"
          >
            <RiMoreLine aria-hidden="true" />
          </button>
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
        selectedTrades={data.selectedTrades}
        onSelectTrade={data.onSelectTrade}
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
  <div className={styles.pageSizeSelector} role="group" aria-label="Page size options">
    <span className={styles.headerText}>Show:</span>
    <select
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      className={styles.pageSizeSelect}
      aria-label="Select number of trades to display"
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
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
    <div 
      className={styles.tradesListContainer}
      role="region"
      aria-label="Trades list"
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <input
            type="checkbox"
            checked={trades.length > 0 && selectedTrades.size === trades.length}
            onChange={() => onSelectAll(trades)}
            className={styles.checkbox}
            aria-label="Select all trades"
          />
          <span className={styles.headerText}>Select All</span>
        </div>
        <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
      </div>

      <div className={styles.content}>
        {error ? (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        ) : (
          <>
            <div 
              className={styles.tableHeader}
              role="rowgroup"
              aria-label="Trades table header"
            >
              <div role="columnheader" aria-label="Selection"></div>
              <div role="columnheader">Symbol</div>
              <div role="columnheader">Date</div>
              <div role="columnheader">Type</div>
              <div role="columnheader">Entry</div>
              <div role="columnheader">Exit</div>
              <div role="columnheader">P&L</div>
              <div role="columnheader">Status</div>
              <div role="columnheader" aria-label="Actions"></div>
            </div>
            <div role="list" aria-label="Trades">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
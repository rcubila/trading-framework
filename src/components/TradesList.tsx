import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { RiArrowUpLine, RiArrowDownLine, RiDeleteBinLine, RiMoreLine, RiEditLine, RiFileCopyLine } from 'react-icons/ri';
import { FixedSizeList as List } from 'react-window';
import type { Trade } from '../types/trade';
import { formatPnL } from '../utils/trading';

interface TradesListProps {
  fetchTrades: (page: number, pageSize: number) => Promise<Trade[]>;
  initialPageSize?: number;
  onTradeClick?: (trade: Trade) => void;
  onDeleteClick?: (trade: Trade) => void;
  refreshTrigger?: number;
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
  position: { top: number; right: number };
}) => (
  <div 
    style={{
      position: 'absolute',
      top: position.top,
      right: position.right,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '8px 0',
      minWidth: '160px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 1000,
    }}
  >
    <button
      onClick={(e) => {
        e.stopPropagation();
        // TODO: Implement edit functionality
        onClose();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <RiEditLine size={16} />
      Edit Trade
    </button>
    
    <button
      onClick={(e) => {
        e.stopPropagation();
        // TODO: Implement duplicate functionality
        onClose();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <RiFileCopyLine size={16} />
      Duplicate Trade
    </button>
    
    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
    
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (onDeleteClick) {
          onDeleteClick(trade);
        }
        onClose();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ef4444',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <RiDeleteBinLine size={16} />
      Delete Trade
    </button>
  </div>
));

TradeMenu.displayName = 'TradeMenu';

// Modify TradeContent to include menu functionality
const TradeContent = memo(({ trade, onDeleteClick }: { trade: Trade; onDeleteClick?: (trade: Trade) => void }) => {
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
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px', 
      alignItems: 'center',
      width: '100%',
      padding: '0 10px'
    }}>
      <div>{trade.symbol}</div>
      <div>{new Date(trade.entry_date).toLocaleDateString()}</div>
      <div>{trade.type}</div>
      <div>${trade.entry_price}</div>
      <div>${trade.exit_price || '-'}</div>
      <div style={{ 
        color: (trade.pnl || 0) > 0 ? '#34D399' : (trade.pnl || 0) < 0 ? '#F87171' : 'inherit',
        fontWeight: 'bold'
      }}>
        {formatPnL(trade.pnl || 0)}
      </div>
      <div>{trade.status}</div>
      <div style={{ position: 'relative' }}>
        <div 
          ref={menuButtonRef}
          style={{ 
            cursor: 'pointer', 
            padding: '5px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <RiMoreLine />
        </div>
        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '0.5rem',
            zIndex: 10,
            minWidth: '160px'
          }}>
            <div 
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '4px',
                color: '#D1D5DB',
                transition: 'background-color 0.2s'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(JSON.stringify(trade, null, 2));
                setShowMenu(false);
              }}
            >
              <RiFileCopyLine />
              <span>Copy Data</span>
            </div>
            <div 
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '4px',
                color: '#D1D5DB',
                transition: 'background-color 0.2s'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteClick) {
                  onDeleteClick(trade);
                }
                setShowMenu(false);
              }}
            >
              <RiDeleteBinLine />
              <span>Delete</span>
            </div>
            <div 
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '4px',
                color: '#D1D5DB',
                transition: 'background-color 0.2s'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit action
                setShowMenu(false);
              }}
            >
              <RiEditLine />
              <span>Edit</span>
            </div>
          </div>
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
  } 
}) => {
  const trade = data.trades[index];
  
  if (!trade) {
    return (
      <div style={{
        ...style,
        padding: '12px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
      }}>
        <div style={{
          height: '20px',
          width: '60%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          marginBottom: '8px',
        }} />
        <div style={{
          height: '16px',
          width: '40%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
        }} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        padding: '12px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onClick={() => data.onTradeClick?.(trade)}
    >
      <TradeContent trade={trade} onDeleteClick={data.onDeleteClick} />
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
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    marginBottom: '8px'
  }}>
    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Show:</span>
    <select
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      style={{
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        cursor: 'pointer'
      }}
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
  initialPageSize = 20, 
  onTradeClick,
  onDeleteClick,
  refreshTrigger = 0
}: TradesListProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const newTrades = await fetchTrades(1, pageSize);
      setTrades(newTrades);
      setHasMore(newTrades.length >= pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchTrades, pageSize]);

  useEffect(() => {
    // Don't clear trades immediately to avoid flickering
    loadTrades();
  }, [loadTrades, refreshTrigger]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '5px',
      gap: '8px'
    }}>
      <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
      
      <div style={{ flex: 1, minHeight: 0 }}>
        {error ? (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '12px',
          }}>
            {error}
          </div>
        ) : (
          <>
            <List
              height={listHeight}
              itemCount={trades.length}
              itemSize={ITEM_SIZE}
              width="100%"
              itemData={{ trades, onTradeClick, onDeleteClick }}
              style={{
                overflowX: 'hidden'
              }}
            >
              {Row}
            </List>
            
            {loading && (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
              }}>
                Loading trades...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 
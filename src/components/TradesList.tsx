import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import { FixedSizeList as List } from 'react-window';
import type { Trade } from '../types/trade';

interface TradesListProps {
  fetchTrades: (page: number, pageSize: number) => Promise<Trade[]>;
  initialPageSize?: number;
  onTradeClick?: (trade: Trade) => void;
}

const ITEM_SIZE = 72; // Height of each trade row
const LOADING_BUFFER = 10; // Number of items to load before reaching the end

// Memoize the individual trade row content
const TradeContent = memo(({ trade }: { trade: Trade }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: trade.type === 'Long' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: trade.type === 'Long' ? '#22c55e' : '#ef4444',
      }}>
        {trade.type === 'Long' ? <RiArrowUpLine size={16} /> : <RiArrowDownLine size={16} />}
      </div>
      <div>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          marginBottom: '2px',
        }}>
          {trade.symbol}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          gap: '8px',
        }}>
          <span>{new Date(trade.entry_date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{trade.quantity} shares</span>
        </div>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: (trade.pnl || 0) >= 0 ? '#22c55e' : '#ef4444',
        marginBottom: '2px',
      }}>
        ${trade.pnl?.toLocaleString() ?? 'Open'}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
        {trade.entry_price.toFixed(2)} → {trade.exit_price?.toFixed(2) ?? 'Open'}
      </div>
    </div>
  </>
));

TradeContent.displayName = 'TradeContent';

// Memoize the row component
const Row = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: { trades: Trade[]; onTradeClick?: (trade: Trade) => void } 
}) => {
  const trade = data.trades[index];
  
  if (!trade) {
    return (
      <div style={{
        ...style,
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => data.onTradeClick?.(trade)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <TradeContent trade={trade} />
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
    marginBottom: '16px'
  }}>
    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Show:</span>
    <select
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
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

export const TradesList = ({ fetchTrades, initialPageSize = 20, onTradeClick }: TradesListProps) => {
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
    if (loadingRef.current || !hasMore) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const newTrades = await fetchTrades(1, pageSize); // Always fetch from start with pageSize
      
      setTrades(newTrades); // Replace trades instead of appending
      setHasMore(false); // Don't load more since we're getting exactly what we want
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchTrades, pageSize]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setHasMore(true); // Reset hasMore to trigger a new load
    loadingRef.current = false;
  }, []);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '10px',
      gap: '16px'
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
              itemData={{ trades, onTradeClick }}
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
import { useState, useEffect } from 'react';
import { RiArrowUpLine, RiArrowDownLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import type { Trade } from '../types/trade';

interface TradesListProps {
  fetchTrades: (page: number, pageSize: number) => Promise<Trade[]>;
  initialPageSize?: number;
}

export const TradesList = ({ fetchTrades, initialPageSize = 20 }: TradesListProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);
  const [totalTrades, setTotalTrades] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const newTrades = await fetchTrades(page, pageSize);
      setTrades(newTrades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [page, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const totalPages = Math.ceil(totalTrades / pageSize);

  const renderSkeleton = () => (
    <div style={{
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      animation: 'pulse 1.5s infinite',
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '24px',
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <option value={20}>20 trades</option>
            <option value={50}>50 trades</option>
            <option value={100}>100 trades</option>
          </select>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: page === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: page === 1 ? 'rgba(255, 255, 255, 0.3)' : 'white',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RiArrowLeftLine />
          </button>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages || loading}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: page === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: page === totalPages ? 'rgba(255, 255, 255, 0.3)' : 'white',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RiArrowRightLine />
          </button>
        </div>
      </div>

      {trades.map((trade, index) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            transition: 'all 0.2s ease',
          }}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transform: 'translateY(-2px)',
          }}
        >
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
        </motion.div>
      ))}

      {loading && Array(3).fill(null).map((_, i) => (
        <motion.div
          key={`skeleton-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}

      {error && (
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
      )}
    </div>
  );
}; 
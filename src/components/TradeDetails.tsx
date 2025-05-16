import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiLineChartLine, 
  RiExchangeDollarLine,
  RiTimeLine,
  RiScales3Line,
  RiPieChartLine,
  RiFileTextLine,
  RiBarChartGroupedLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowRightLine,
  RiLightbulbLine
} from 'react-icons/ri';
import type { Trade } from '../types/trade';
import { SlideOver } from './SlideOver';
import { TradeChart } from './TradeChart';

const calculateDuration = (entryDate: string, exitDate: string): string => {
  const start = new Date(entryDate);
  const end = new Date(exitDate);
  const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    const minutes = Math.floor((diffInHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(diffInHours / 24);
    const hours = Math.floor(diffInHours % 24);
    return `${days}d ${hours}h`;
  }
};

const calculateRiskRewardRatio = (trade: Trade): string => {
  if (!trade.risk || !trade.reward) return '-';
  const ratio = (trade.reward / trade.risk).toFixed(2);
  return `1:${ratio}`;
};

const calculateTotalCosts = (trade: Trade): string => {
  const commission = trade.commission || 0;
  const fees = trade.fees || 0;
  const slippage = trade.slippage || 0;
  const total = commission + fees + slippage;
  return total > 0 ? `$${total.toFixed(2)}` : '-';
};

interface TradeDetailsProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeDetails = ({ trade, isOpen, onClose }: TradeDetailsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!trade) return null;

  const isProfit = (trade.pnl || 0) > 0;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
        {/* Left Column - Trade Details */}
        <div style={{ flex: '1', minWidth: '500px', maxWidth: '600px' }}>
          {/* Header Section */}
          <div style={{
            marginBottom: '24px',
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    color: trade.type === 'Long' ? '#22c55e' : '#ef4444',
                    background: trade.type === 'Long' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}>
                    {trade.type}
                  </span>
                  {trade.symbol}
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                  {new Date(trade.entry_date).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: isProfit ? '#22c55e' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'flex-end'
                }}>
                  {isProfit ? <RiArrowUpLine /> : <RiArrowDownLine />}
                  ${Math.abs(trade.pnl || 0).toFixed(2)}
                </div>
                <p style={{ 
                  color: isProfit ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                  fontSize: '14px'
                }}>
                  {isProfit ? '+' : '-'}{Math.abs(trade.pnl_percentage || 0).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Trade Info List */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <RiExchangeDollarLine style={{ color: '#3b82f6' }} />
                  Entry Price
                </div>
                <div style={{ color: '#3b82f6', fontWeight: '500' }}>${trade.entry_price.toFixed(2)}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <RiExchangeDollarLine style={{ color: '#8b5cf6' }} />
                  Exit Price
                </div>
                <div style={{ color: '#8b5cf6', fontWeight: '500' }}>
                  {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <RiTimeLine style={{ color: '#f59e0b' }} />
                  Duration
                </div>
                <div style={{ color: '#f59e0b', fontWeight: '500' }}>
                  {trade.exit_date ? calculateDuration(trade.entry_date, trade.exit_date) : 'Open'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <RiScales3Line style={{ color: '#22c55e' }} />
                  Risk/Reward
                </div>
                <div style={{ color: '#22c55e', fontWeight: '500' }}>
                  {calculateRiskRewardRatio(trade)}
                </div>
              </div>
            </div>
          </div>

          {/* Market Context */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <RiPieChartLine />
              Market Context
            </h3>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '16px',
              borderRadius: '12px'
            }}>
              {[
                { label: 'Market', value: trade.market },
                { label: 'Category', value: trade.market_category },
                { label: 'Exchange', value: trade.exchange || '-' },
                { label: 'Timeframe', value: trade.timeframe || '-' }
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{item.label}</div>
                  <div style={{ fontWeight: '500' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <RiLightbulbLine />
              Strategy Details
            </h3>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '16px',
              borderRadius: '12px'
            }}>
              {[
                { label: 'Strategy', value: trade.strategy || '-' },
                { label: 'Setup Type', value: trade.setup_type || '-' },
                { label: 'Tags', value: trade.tags?.join(', ') || '-' },
                { label: 'Leverage', value: trade.leverage ? `${trade.leverage}x` : '-' }
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{item.label}</div>
                  <div style={{ fontWeight: '500' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RiFileTextLine />
                Trade Notes
              </h3>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '16px',
                borderRadius: '12px',
                whiteSpace: 'pre-wrap'
              }}>
                {trade.notes}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Chart */}
        <div style={{ flex: '2', minWidth: '800px' }}>
          <TradeChart trade={trade} />
        </div>
      </div>
    </SlideOver>
  );
}; 
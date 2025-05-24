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
import styles from './TradeDetails.module.css';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

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
      <div className={styles.container}>
        {/* Left Column - Trade Details */}
        <div className={styles.leftColumn}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <div>
                <h2 className={styles.title}>
                  <span className={`${styles.tradeType} ${trade.type === 'Long' ? styles.tradeTypeLong : styles.tradeTypeShort}`}>
                    {trade.type}
                  </span>
                  {trade.symbol}
                </h2>
                <p className={styles.date}>
                  {new Date(trade.entry_date).toLocaleString()}
                </p>
              </div>
              <div className={styles.pnlContainer}>
                <div className={`${styles.pnl} ${isProfit ? styles.pnlProfit : styles.pnlLoss}`}>
                  {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>${Math.abs(trade.pnl || 0).toFixed(2)}</span>
                </div>
                <p className={`${styles.pnlPercentage} ${isProfit ? styles.pnlPercentageProfit : styles.pnlPercentageLoss}`}>
                  {isProfit ? '+' : '-'}{Math.abs(trade.pnl_percentage || 0).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Trade Info List */}
            <div className={styles.tradeInfoList}>
              <div className={styles.tradeInfoItem}>
                <div className={styles.tradeInfoLabel}>
                  <RiExchangeDollarLine className={styles.entryIcon} />
                  Entry Price
                </div>
                <div className={`${styles.tradeInfoValue} ${styles.entryPrice}`}>
                  ${trade.entry_price.toFixed(2)}
                </div>
              </div>
              
              <div className={styles.tradeInfoItem}>
                <div className={styles.tradeInfoLabel}>
                  <RiExchangeDollarLine className={styles.exitIcon} />
                  Exit Price
                </div>
                <div className={`${styles.tradeInfoValue} ${styles.exitPrice}`}>
                  {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}
                </div>
              </div>

              <div className={styles.tradeInfoItem}>
                <div className={styles.tradeInfoLabel}>
                  <RiTimeLine className={styles.durationIcon} />
                  Duration
                </div>
                <div className={`${styles.tradeInfoValue} ${styles.duration}`}>
                  {trade.exit_date ? calculateDuration(trade.entry_date, trade.exit_date) : 'Open'}
                </div>
              </div>

              <div className={styles.tradeInfoItem}>
                <div className={styles.tradeInfoLabel}>
                  <RiScales3Line className={styles.riskRewardIcon} />
                  Risk/Reward
                </div>
                <div className={`${styles.tradeInfoValue} ${styles.riskReward}`}>
                  {calculateRiskRewardRatio(trade)}
                </div>
              </div>
            </div>
          </div>

          {/* Market Context */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <RiPieChartLine />
              Market Context
            </h3>
            <div className={styles.sectionContent}>
              {[
                { label: 'Market', value: trade.market },
                { label: 'Category', value: trade.market_category },
                { label: 'Exchange', value: trade.exchange || '-' },
                { label: 'Timeframe', value: trade.timeframe || '-' }
              ].map((item) => (
                <div key={item.label} className={styles.sectionItem}>
                  <div className={styles.sectionLabel}>{item.label}</div>
                  <div className={styles.sectionValue}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Details */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <RiLightbulbLine />
              Strategy Details
            </h3>
            <div className={styles.sectionContent}>
              {[
                { label: 'Strategy', value: trade.strategy || '-' },
                { label: 'Setup Type', value: trade.setup_type || '-' },
                { label: 'Tags', value: trade.tags?.join(', ') || '-' },
                { label: 'Leverage', value: trade.leverage ? `${trade.leverage}x` : '-' }
              ].map((item) => (
                <div key={item.label} className={styles.sectionItem}>
                  <div className={styles.sectionLabel}>{item.label}</div>
                  <div className={styles.sectionValue}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div className={styles.notes}>
              <h3 className={styles.sectionTitle}>
                <RiFileTextLine />
                Notes
              </h3>
              <div className={styles.notesContent}>
                {trade.notes}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Chart */}
        <div className={styles.chartContainer}>
          <TradeChart trade={trade} />
        </div>
      </div>
    </SlideOver>
  );
}; 
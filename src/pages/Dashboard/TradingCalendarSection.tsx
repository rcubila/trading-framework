import React from 'react';
import { TradingCalendar } from '../../components/TradingCalendar';
import styles from './Dashboard.module.css';

interface TradingCalendarSectionProps {
  calendarTrades: any[];
}

export const TradingCalendarSection: React.FC<TradingCalendarSectionProps> = ({ calendarTrades }) => (
  <div className={styles.tradingCalendarSection}>
    <TradingCalendar trades={calendarTrades} />
  </div>
); 
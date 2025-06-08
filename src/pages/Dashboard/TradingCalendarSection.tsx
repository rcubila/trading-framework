import React from 'react';
import { TradingCalendar } from '../../components/TradingCalendar';
import styles from './Dashboard.module.css';

interface CalendarTrade {
  id: string;
  date: string;
  symbol: string;
  type: string;
  result: 'Win' | 'Loss';
  profit: number;
  volume: number;
  entry: number;
  exit: number;
}

interface TradingCalendarSectionProps {
  calendarTrades: CalendarTrade[];
}

const TradingCalendarSection: React.FC<TradingCalendarSectionProps> = ({ calendarTrades }) => {
  return (
    <div className={styles.calendarSection}>
      <div className={styles.calendarHeader}>
        <div>
          <h3 className={styles.calendarTitle}>Trading Calendar</h3>
          <p className={styles.calendarSubtitle}>Daily trading activity</p>
        </div>
      </div>
      <div className={styles.calendarContainer}>
        <TradingCalendar trades={calendarTrades} />
      </div>
    </div>
  );
};

export default TradingCalendarSection; 
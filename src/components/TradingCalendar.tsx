import { useState } from 'react';
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri';
import styles from './TradingCalendar.module.css';

export interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'Long' | 'Short';
  result: 'Win' | 'Loss';
  profit: number;
  volume: number;
  entry: number;
  exit: number;
}

interface DayTrades {
  trades: Trade[];
  totalProfit: number;
  winCount: number;
  lossCount: number;
}

interface TradingCalendarProps {
  trades: Trade[];
}

export const TradingCalendar = ({ trades }: TradingCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getTradesForDay = (day: number): DayTrades => {
    // Create a date object for the current day in local time
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Format as YYYY-MM-DD in local time
    const dayDate = targetDate.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
    const dayTrades = trades.filter(trade => trade.date === dayDate);
    
    return {
      trades: dayTrades,
      totalProfit: dayTrades.reduce((sum, trade) => sum + trade.profit, 0),
      winCount: dayTrades.filter(trade => trade.result === 'Win').length,
      lossCount: dayTrades.filter(trade => trade.result === 'Loss').length,
    };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={styles.dayCellEmpty}
        />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTrades = getTradesForDay(day);
      const hasActivity = dayTrades.trades.length > 0;
      const isProfit = dayTrades.totalProfit > 0;

      days.push(
        <div
          key={day}
          className={`${styles.dayCell} ${hasActivity ? styles.dayCellActive : ''} ${
            hasActivity ? (isProfit ? styles.dayCellProfit : styles.dayCellLoss) : ''
          }`}
        >
          <div className={styles.dayNumber}>{day}</div>
          {hasActivity && (
            <>
              <div className={isProfit ? styles.profitAmount : styles.lossAmount}>
                {isProfit ? <RiArrowUpLine /> : <RiArrowDownLine />}
                ${Math.abs(dayTrades.totalProfit).toLocaleString()}
              </div>
              <div className={styles.tradeCount}>
                {dayTrades.trades.length} trade{dayTrades.trades.length !== 1 ? 's' : ''}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            Trading Calendar
          </h3>
          <p className={styles.subtitle}>
            Daily performance overview
          </p>
        </div>
        <div className={styles.controls}>
          <button
            onClick={previousMonth}
            className={styles.button}
          >
            <RiArrowLeftLine />
          </button>
          <div className={styles.dateDisplay}>
            <RiCalendarLine />
            {formatDate(currentDate)}
          </div>
          <button
            onClick={nextMonth}
            className={styles.button}
          >
            <RiArrowRightLine />
          </button>
        </div>
      </div>

      <div className={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {renderCalendarDays()}
      </div>
    </div>
  );
}; 
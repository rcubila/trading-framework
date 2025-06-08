import React from 'react';
import styles from './TradingCalendarSection.module.css';
import type { CalendarTrade } from '../../types/trade';

interface TradingCalendarSectionProps {
  trades: CalendarTrade[];
  loading: boolean;
}

const TradingCalendarSection: React.FC<TradingCalendarSectionProps> = ({ trades, loading }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Trading Calendar</h2>
        </div>
        <div className={styles.skeletonCalendar} />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTradesForDate = (date: Date) => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getDate() === date.getDate() &&
             tradeDate.getMonth() === date.getMonth() &&
             tradeDate.getFullYear() === date.getFullYear();
    });
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthDays = getMonthDays(currentYear, currentMonth);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Trading Calendar</h2>
        <p className={styles.subtitle}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className={styles.calendar}>
        <div className={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={styles.weekDay}>{day}</div>
          ))}
        </div>
        <div className={styles.days}>
          {monthDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className={styles.emptyDay} />;
            }

            const dayTrades = getTradesForDate(date);
            const totalPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
            const isToday = date.getDate() === currentDate.getDate() &&
                          date.getMonth() === currentDate.getMonth() &&
                          date.getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={date.toISOString()}
                className={`${styles.day} ${isToday ? styles.today : ''} ${dayTrades.length > 0 ? styles.hasTrades : ''}`}
              >
                <span className={styles.dayNumber}>{date.getDate()}</span>
                {dayTrades.length > 0 && (
                  <div className={styles.dayTrades}>
                    <span className={`${styles.pnl} ${totalPnL >= 0 ? styles.positive : styles.negative}`}>
                      {formatCurrency(totalPnL)}
                    </span>
                    <span className={styles.tradeCount}>{dayTrades.length} trades</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TradingCalendarSection; 
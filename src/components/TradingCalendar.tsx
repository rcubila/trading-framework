import { useState } from 'react';
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri';

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
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    const dayTrades = trades.filter(trade => trade.date.startsWith(dayDate));
    
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
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '8px',
            aspectRatio: '1',
          }}
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
          style={{
            backgroundColor: hasActivity
              ? isProfit
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(239, 68, 68, 0.1)'
              : 'rgba(30, 41, 59, 0.4)',
            borderRadius: '8px',
            padding: '8px',
            cursor: hasActivity ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            aspectRatio: '1',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={(e) => {
            if (hasActivity) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = isProfit
                ? 'rgba(34, 197, 94, 0.2)'
                : 'rgba(239, 68, 68, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (hasActivity) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = isProfit
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(239, 68, 68, 0.1)';
            }
          }}
        >
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>{day}</div>
          {hasActivity && (
            <>
              <div
                style={{
                  fontSize: '12px',
                  color: isProfit ? '#22c55e' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginBottom: '2px',
                }}
              >
                {isProfit ? <RiArrowUpLine /> : <RiArrowDownLine />}
                ${Math.abs(dayTrades.totalProfit).toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
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
    <div style={{
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '4px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Trading Calendar
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Daily performance overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={previousMonth}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RiArrowLeftLine />
          </button>
          <div style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <RiCalendarLine />
            {formatDate(currentDate)}
          </div>
          <button
            onClick={nextMonth}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RiArrowRightLine />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
      }}>
        {renderCalendarDays()}
      </div>
    </div>
  );
}; 
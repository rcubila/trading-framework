import type { Trade, CalendarTrade } from '../types/trade';

export const transformTradesForCalendar = (trades: Trade[]): CalendarTrade[] => {
  const tradesByDate = trades.reduce((acc, trade) => {
    const date = new Date(trade.entry_date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        id: date,
        date,
        pnl: 0,
        count: 0
      };
    }
    acc[date].pnl += trade.pnl || 0;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, CalendarTrade>);

  return Object.values(tradesByDate);
}; 
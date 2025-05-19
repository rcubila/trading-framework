import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock trades endpoint
  http.get('/api/trades', () => {
    return HttpResponse.json([
      {
        id: 1,
        symbol: 'AAPL',
        entry_date: '2024-03-20T10:00:00Z',
        exit_date: '2024-03-20T11:00:00Z',
        entry_price: 150.00,
        exit_price: 155.00,
        quantity: 100,
        pnl: 500,
        strategy: 'Momentum',
        market: 'Stocks',
        notes: 'Test trade'
      }
    ]);
  }),

  // Mock metrics endpoint
  http.get('/api/metrics', () => {
    return HttpResponse.json({
      totalTrades: 1,
      winRate: 100,
      averageWin: 500,
      averageLoss: 0,
      profitFactor: 1,
      expectancy: 500,
      sharpeRatio: 1.5
    });
  })
]; 
import { downloadCSV } from './csvParser';

const sampleTrades = [
  {
    market: 'EUREX',
    market_category: 'Futures',
    symbol: 'GER40',
    type: 'Long',
    status: 'Open',
    entry_price: 18250.25,
    quantity: 1,
    entry_date: '2024-03-20T10:00:00Z',
    strategy: 'Swing Trading',
    tags: ['index', 'futures'],
    notes: 'Entered on support level',
    stop_loss: 18150.00,
    take_profit: 18400.00
  },
  {
    market: 'NYSE',
    market_category: 'Equities',
    symbol: 'AAPL',
    type: 'Long',
    status: 'Open',
    entry_price: 150.25,
    quantity: 10,
    entry_date: '2024-03-20T10:00:00Z',
    strategy: 'Swing Trading',
    tags: ['tech', 'blue-chip'],
    notes: 'Entered on support level',
    stop_loss: 145.00,
    take_profit: 160.00
  },
  {
    market: 'NASDAQ',
    market_category: 'Equities',
    symbol: 'MSFT',
    type: 'Short',
    status: 'Closed',
    entry_price: 380.50,
    exit_price: 375.25,
    quantity: 5,
    entry_date: '2024-03-19T14:30:00Z',
    exit_date: '2024-03-20T11:15:00Z',
    pnl: 26.25,
    pnl_percentage: 1.38,
    strategy: 'Day Trading',
    tags: ['tech', 'momentum'],
    notes: 'Exited on resistance',
    commission: 5.00,
    fees: 2.50
  }
];

export function downloadTradeTemplate(): void {
  downloadCSV(sampleTrades, 'trade_template.csv');
} 
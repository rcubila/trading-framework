import type { Trade } from '../types/trade';

export const getFormattedSymbol = (trade: Trade): string => {
  if (!trade || !trade.symbol) {
    console.error('Invalid trade object:', trade);
    return 'NASDAQ:AAPL'; // Default fallback symbol
  }

  // Special cases for indices and commodities
  if (trade.symbol === '.USTEC') {
    return 'NASDAQ:NDX';
  }
  if (trade.symbol === 'GER40' || trade.symbol === 'DE40') {
    return 'OANDA:DE30EUR';  // OANDA's DAX feed
  }
  if (trade.symbol === 'US30') {
    return 'DJ:DJI';  // Dow Jones Industrial Average
  }
  if (trade.symbol === 'XAUUSD' || trade.symbol === 'GOLD') {
    return 'OANDA:XAUUSD';  // OANDA's Gold feed
  }

  // Handle futures
  if (trade.market === 'Futures') {
    const futuresMap: Record<string, string> = {
      'NQ': 'CME_MINI:NQ1!',
      'ES': 'CME_MINI:ES1!',
      'YM': 'CME_MINI:YM1!',
      'RTY': 'CME_MINI:RTY1!',
      'CL': 'NYMEX:CL1!',
      'GC': 'COMEX:GC1!',
      'SI': 'COMEX:SI1!',
      '6E': 'CME:6E1!',
    };
    return futuresMap[trade.symbol] || `CME:${trade.symbol}1!`;
  }

  // Handle stocks based on exchange
  if (trade.market === 'Stocks' || trade.market === 'ETFs') {
    const exchange = trade.exchange?.toUpperCase() || 'NASDAQ';
    return `${exchange}:${trade.symbol}`;
  }

  // Handle crypto
  if (trade.market === 'Spot Crypto' || trade.market === 'Crypto Futures') {
    const symbol = trade.symbol.replace('/', '').toUpperCase();
    return `BINANCE:${symbol}USDT`;
  }

  // Handle forex
  if (trade.market === 'Spot Forex') {
    const symbol = trade.symbol.replace('/', '').toUpperCase();
    return `FX:${symbol}`;
  }

  return `NASDAQ:${trade.symbol}`;
}; 
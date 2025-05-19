import type { Trade } from '../types/trade';

export interface PnLFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'never';
  currency?: boolean;
  percentage?: boolean;
}

export const defaultPnLFormatOptions: PnLFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
  currency: true,
  percentage: false,
};

/**
 * Format a P&L value with consistent styling
 */
export const formatPnL = (value: number, options: PnLFormatOptions = defaultPnLFormatOptions): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    signDisplay = 'always',
    currency = true,
    percentage = false,
  } = options;

  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
  });

  if (percentage) {
    return `${formattedValue}%`;
  }

  return currency ? `$${formattedValue}` : formattedValue;
};

/**
 * Calculate total P&L for a set of trades
 */
export const calculateTotalPnL = (trades: Trade[]): number => {
  return trades.reduce((sum, trade) => {
    // Handle both database trades with pnl and calendar trades with profit
    const value = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return sum + value;
  }, 0);
};

/**
 * Calculate daily P&L for a set of trades
 */
export const calculateDailyPnL = (trades: Trade[], date: string): number => {
  return trades
    .filter(trade => trade.date === date)
    .reduce((sum, trade) => {
      // Handle both database trades with pnl and calendar trades with profit
      const value = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
      return sum + value;
    }, 0);
};

/**
 * Calculate win rate for a set of trades
 */
export const calculateWinRate = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  
  const wins = trades.filter(trade => {
    // If the trade already has a result field, use it
    if (trade.result) {
      return trade.result === 'Win';
    }
    
    // Otherwise, determine result based on P&L
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return pnl > 0;
  }).length;
  
  return (wins / trades.length) * 100;
};

/**
 * Calculate profit factor for a set of trades
 */
export const calculateProfitFactor = (trades: Trade[]): number => {
  const grossProfit = trades
    .filter(trade => {
      const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
      return pnl > 0;
    })
    .reduce((sum, trade) => {
      const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
      return sum + pnl;
    }, 0);
  
  const grossLoss = Math.abs(trades
    .filter(trade => {
      const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
      return pnl < 0;
    })
    .reduce((sum, trade) => {
      const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
      return sum + pnl;
    }, 0));

  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
};

/**
 * Calculate average profit per winning trade
 */
export const calculateAverageWin = (trades: Trade[]): number => {
  const winningTrades = trades.filter(trade => {
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return pnl > 0;
  });
  
  if (winningTrades.length === 0) return 0;
  
  return winningTrades.reduce((sum, trade) => {
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return sum + pnl;
  }, 0) / winningTrades.length;
};

/**
 * Calculate average loss per losing trade
 */
export const calculateAverageLoss = (trades: Trade[]): number => {
  const losingTrades = trades.filter(trade => {
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return pnl < 0;
  });
  
  if (losingTrades.length === 0) return 0;
  
  return Math.abs(losingTrades.reduce((sum, trade) => {
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return sum + pnl;
  }, 0)) / losingTrades.length;
};

/**
 * Calculate risk-reward ratio
 */
export const calculateRiskRewardRatio = (trades: Trade[]): number => {
  const avgWin = calculateAverageWin(trades);
  const avgLoss = calculateAverageLoss(trades);
  return avgLoss === 0 ? 0 : avgWin / avgLoss;
};

/**
 * Calculate largest winning trade
 */
export const calculateLargestWin = (trades: Trade[]): number => {
  const winningTrades = trades.filter(trade => {
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return pnl > 0;
  });
  
  if (winningTrades.length === 0) return 0;
  
  return Math.max(...winningTrades.map(trade => {
    return trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
  }));
};

/**
 * Calculate largest losing trade
 */
export const calculateLargestLoss = (trades: Trade[]): number => {
  const losingTrades = trades.filter(trade => {
    const pnl = trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
    return pnl < 0;
  });
  
  if (losingTrades.length === 0) return 0;
  
  return Math.min(...losingTrades.map(trade => {
    return trade.profit !== undefined ? trade.profit : (trade.pnl || 0);
  }));
};

/**
 * Calculate consecutive wins
 */
export const calculateConsecutiveWins = (trades: Trade[]): number => {
  let maxConsecutive = 0;
  let currentConsecutive = 0;

  trades.forEach(trade => {
    if (trade.result === 'Win') {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  });

  return maxConsecutive;
};

/**
 * Calculate consecutive losses
 */
export const calculateConsecutiveLosses = (trades: Trade[]): number => {
  let maxConsecutive = 0;
  let currentConsecutive = 0;

  trades.forEach(trade => {
    if (trade.result === 'Loss') {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  });

  return maxConsecutive;
};

/**
 * Calculate average trade duration
 */
export const calculateAverageTradeDuration = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  const durations = trades.map(trade => {
    const entry = new Date(trade.date);
    const exit = new Date(trade.date); // Assuming exit is same day for now
    return exit.getTime() - entry.getTime();
  });
  return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
};

/**
 * Calculate monthly P&L
 */
export const calculateMonthlyPnL = (trades: Trade[], year: number, month: number): number => {
  return trades
    .filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
    })
    .reduce((sum, trade) => sum + trade.profit, 0);
};

/**
 * Calculate yearly P&L
 */
export const calculateYearlyPnL = (trades: Trade[], year: number): number => {
  return trades
    .filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getFullYear() === year;
    })
    .reduce((sum, trade) => sum + trade.profit, 0);
};

/**
 * Calculate P&L by symbol
 */
export const calculatePnLBySymbol = (trades: Trade[]): Record<string, number> => {
  return trades.reduce((acc, trade) => {
    acc[trade.symbol] = (acc[trade.symbol] || 0) + trade.profit;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Calculate P&L by trade type (Long/Short)
 */
export const calculatePnLByType = (trades: Trade[]): { long: number; short: number } => {
  return trades.reduce((acc, trade) => {
    if (trade.type === 'Long') {
      acc.long += trade.profit;
    } else {
      acc.short += trade.profit;
    }
    return acc;
  }, { long: 0, short: 0 });
}; 
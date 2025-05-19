import type { Trade } from '../types/trade';
import { supabase } from '../lib/supabaseClient';

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  errors: string[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export class ImportService {
  private static validateTrade(trade: Partial<Trade>, row: number): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Required fields validation
    const requiredFields: (keyof Trade)[] = [
      'market',
      'market_category',
      'symbol',
      'type',
      'entry_price',
      'quantity',
      'entry_date'
    ];

    requiredFields.forEach(field => {
      if (!trade[field]) {
        errors.push({
          row,
          field: field.toString(),
          message: `${field} is required`
        });
      }
    });

    // Type validation
    if (trade.market_category && !['Equities', 'Crypto', 'Forex', 'Futures', 'Other'].includes(trade.market_category)) {
      errors.push({
        row,
        field: 'market_category',
        message: 'Invalid market category'
      });
    }

    if (trade.type && !['Long', 'Short'].includes(trade.type)) {
      errors.push({
        row,
        field: 'type',
        message: 'Invalid trade type'
      });
    }

    // Date validation
    if (trade.entry_date && isNaN(Date.parse(trade.entry_date))) {
      errors.push({
        row,
        field: 'entry_date',
        message: 'Invalid entry date format'
      });
    }

    if (trade.exit_date && isNaN(Date.parse(trade.exit_date))) {
      errors.push({
        row,
        field: 'exit_date',
        message: 'Invalid exit date format'
      });
    }

    // Numeric validation
    const numericFields: (keyof Trade)[] = [
      'entry_price',
      'exit_price',
      'quantity',
      'pnl',
      'pnl_percentage',
      'risk',
      'reward',
      'leverage',
      'stop_loss',
      'take_profit',
      'commission',
      'fees',
      'slippage'
    ];

    numericFields.forEach(field => {
      if (trade[field] !== undefined && trade[field] !== null && isNaN(Number(trade[field]))) {
        errors.push({
          row,
          field: field.toString(),
          message: `${field} must be a number`
        });
      }
    });

    return errors;
  }

  private static transformTrade(rawTrade: any): Partial<Trade> {
    // Helper function to safely parse numbers
    const parseNumber = (value: any): number | undefined => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    // Log the raw trade data for debugging
    console.log('Raw trade data:', rawTrade);

    const transformed = {
      market: rawTrade.market,
      market_category: rawTrade.market_category,
      symbol: rawTrade.symbol?.toUpperCase(),
      type: rawTrade.type,
      status: rawTrade.status || 'Open',
      entry_price: parseNumber(rawTrade.entry_price),
      exit_price: parseNumber(rawTrade.exit_price),
      quantity: parseNumber(rawTrade.quantity),
      entry_date: rawTrade.entry_date,
      exit_date: rawTrade.exit_date || undefined,
      pnl: parseNumber(rawTrade.pnl),
      pnl_percentage: parseNumber(rawTrade.pnl_percentage),
      risk: parseNumber(rawTrade.risk),
      reward: parseNumber(rawTrade.reward),
      strategy: rawTrade.strategy || undefined,
      tags: Array.isArray(rawTrade.tags) ? rawTrade.tags : undefined,
      notes: rawTrade.notes || undefined,
      leverage: parseNumber(rawTrade.leverage),
      stop_loss: parseNumber(rawTrade.stop_loss),
      take_profit: parseNumber(rawTrade.take_profit),
      commission: parseNumber(rawTrade.commission),
      fees: parseNumber(rawTrade.fees),
      slippage: parseNumber(rawTrade.slippage),
      exchange: rawTrade.exchange || undefined,
      timeframe: rawTrade.timeframe || undefined,
      setup_type: rawTrade.setup_type || undefined
    };

    // Log the transformed trade for debugging
    console.log('Transformed trade:', transformed);

    return transformed;
  }

  public static async importTrades(trades: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      total: trades.length,
      imported: 0,
      failed: 0,
      errors: []
    };

    const validTrades: Partial<Trade>[] = [];

    // Validate all trades first
    trades.forEach((trade, index) => {
      const transformedTrade = this.transformTrade(trade);
      const errors = this.validateTrade(transformedTrade, index + 1);
      
      if (errors.length > 0) {
        result.failed++;
        errors.forEach(error => {
          result.errors.push(`Row ${error.row}: ${error.field} - ${error.message}`);
        });
      } else {
        validTrades.push(transformedTrade);
      }
    });

    if (validTrades.length === 0) {
      result.success = false;
      return result;
    }

    try {
      // Use a transaction to ensure all-or-nothing import
      const { data, error } = await supabase
        .from('trades')
        .insert(validTrades)
        .select();

      if (error) throw error;

      result.imported = validTrades.length;
      return result;
    } catch (error: unknown) {
      result.success = false;
      result.errors.push(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }
} 
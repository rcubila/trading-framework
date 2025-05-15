import { supabase } from './supabase';
import type { Database } from './supabase-types';
import type { Trade } from '../types/trade';

interface ImportResult {
  trades: Trade[];
  errors: ImportError[];
}

interface ImportError {
  row: number;
  message: string;
}

// UUID v4 generator
const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to validate numbers
const validateNumber = (value: string, fieldName: string): number => {
  // Remove currency symbols and commas
  const cleanValue = value.replace(/[$,]/g, '');
  const num = parseFloat(cleanValue);
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: ${value}. Must be a valid number.`);
  }
  return num;
};

// Helper function to validate dates
const validateDate = (value: string, fieldName: string): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}: ${value}. Must be a valid date.`);
  }
  return date.toISOString();
};

export const importTradesFromCSV = async (csvContent: string): Promise<ImportResult> => {
  const errors: ImportError[] = [];
  const trades: Trade[] = [];

  try {
    // Parse CSV content
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Validate required columns
    const requiredColumns = ['Open', 'Symbol', 'Open Price', 'Volume', 'Action'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push({
        row: 0,
        message: `Missing required columns: ${missingColumns.join(', ')}`
      });
      return { trades, errors };
    }

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim());
        const rowData: { [key: string]: string } = {};

        // Map values to headers
        values.forEach((value, index) => {
          if (index < headers.length) {
            rowData[headers[index]] = value;
          }
        });

        // Validate required fields
        const missingFields = requiredColumns.filter(field => !rowData[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate action
        const action = (rowData['Action'] || '').toLowerCase();
        if (action !== 'buy' && action !== 'sell') {
          throw new Error(`Invalid Action: ${rowData['Action']}. Must be either 'buy' or 'sell'`);
        }

        // Create trade object
        const trade: Trade = {
          id: uuidv4(),
          symbol: rowData['Symbol'].toUpperCase(),
          market_category: 'Equities',
          market: 'Stocks',
          type: action === 'buy' ? 'Long' : 'Short',
          status: rowData['Close Price'] ? 'Closed' : 'Open',
          entry_price: validateNumber(rowData['Open Price'], 'Open Price'),
          exit_price: rowData['Close Price'] ? validateNumber(rowData['Close Price'], 'Close Price') : undefined,
          quantity: validateNumber(rowData['Volume'], 'Volume'),
          entry_date: validateDate(rowData['Open'], 'Open Date'),
          exit_date: rowData['Close'] ? validateDate(rowData['Close'], 'Close Date') : undefined,
          pnl: rowData['Profit'] ? validateNumber(rowData['Profit'], 'Profit') : undefined,
          tags: rowData['Tags'] ? rowData['Tags'].split(';').map(tag => tag.trim()) : undefined,
          notes: rowData['Notes'] || undefined
        };

        trades.push(trade);
      } catch (error: any) {
        errors.push({
          row: i,
          message: `Row ${i}: ${error?.message || 'Failed to parse trade data'}`
        });
      }
    }

    if (trades.length === 0 && errors.length === 0) {
      errors.push({
        row: 0,
        message: 'No valid trades found in the CSV file'
      });
    }

    return { trades, errors };
  } catch (error: any) {
    errors.push({
      row: 0,
      message: error?.message || 'Failed to parse CSV file'
    });
    return { trades, errors };
  }
}; 
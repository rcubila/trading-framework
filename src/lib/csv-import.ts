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
const validateNumber = (value: string, fieldName: string, isInteger: boolean = false): number => {
  // Remove currency symbols, commas, and any quotes
  const cleanValue = value.replace(/[$,'"]/g, '');
  
  // Handle European number format (replace , with .)
  const normalizedValue = cleanValue.includes(',') ? 
    cleanValue.replace(',', '.') : cleanValue;
  
  const num = parseFloat(normalizedValue);
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: ${value}. Must be a valid number.`);
  }
  if (isInteger) {
    // Round to nearest integer instead of requiring exact integer
    return Math.round(num);
  }
  return num;
};

// Helper function to validate dates
const validateDate = (value: string, fieldName: string): string => {
  // Remove any quotes
  const cleanValue = value.replace(/['"]/g, '').trim();
  
  // Try parsing different date formats
  let date: Date | null = null;
  
  // Try DD/MM/YY HH:mm format
  if (cleanValue.match(/^\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}$/)) {
    const [datePart, timePart] = cleanValue.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    // Assume 20xx for two-digit years
    const fullYear = parseInt(year) + 2000;
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  }
  // Try DD.MM.YY HH:mm format
  else if (cleanValue.match(/^\d{2}\.\d{2}\.\d{2}\s+\d{2}:\d{2}$/)) {
    const [datePart, timePart] = cleanValue.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hour, minute] = timePart.split(':');
    const fullYear = parseInt(year) + 2000;
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  }
  // Try standard ISO format and other common formats
  else {
    date = new Date(cleanValue);
  }

  if (!date || isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}: ${value}. Must be a valid date.`);
  }

  return date.toISOString();
};

// Helper function to find matching column
const findMatchingColumn = (headers: string[], possibleNames: string[]): string | undefined => {
  return headers.find(header => 
    possibleNames.some(name => 
      header.toLowerCase().replace(/[^a-z0-9]/g, '') === name.toLowerCase().replace(/[^a-z0-9]/g, '')
    )
  );
};

// Helper function to detect column type
const detectColumnType = (headers: string[], values: string[][]): { [key: string]: string } => {
  const columnTypes: { [key: string]: string } = {};
  
  headers.forEach((header, index) => {
    // Get all non-empty values for this column
    const columnValues = values.map(row => row[index]).filter(val => val && val.trim());
    if (columnValues.length === 0) return;

    // Check for date patterns
    const datePattern = /^\d{2}[-.]\d{2}[-.]\d{2}|\d{4}-\d{2}-\d{2}|^\d{2}:\d{2}|\d{2}[-.]\d{2}[-.]\d{2}\s+\d{2}:\d{2}/;
    const hasDateFormat = columnValues.some(val => datePattern.test(val));
    if (hasDateFormat) {
      columnTypes[header] = 'date';
      return;
    }

    // Check for price/number patterns
    const pricePattern = /^[\$£€]?\d+\.?\d*$/;
    const isPriceColumn = columnValues.some(val => pricePattern.test(val.replace(/,/g, '')));
    if (isPriceColumn) {
      columnTypes[header] = 'price';
      return;
    }

    // Check for volume/quantity patterns
    const isVolumeColumn = columnValues.some(val => {
      const cleanValue = val.replace(/,/g, '');
      return !isNaN(parseFloat(cleanValue)) && parseFloat(cleanValue) > 0;
    });
    if (isVolumeColumn && (
      header.toLowerCase().includes('volume') || 
      header.toLowerCase().includes('size') || 
      header.toLowerCase().includes('quantity') || 
      header.toLowerCase().includes('amount')
    )) {
      columnTypes[header] = 'volume';
      return;
    }

    // Check for action/type patterns
    const actionPattern = /(buy|sell|long|short)/i;
    const isActionColumn = columnValues.some(val => actionPattern.test(val));
    if (isActionColumn) {
      columnTypes[header] = 'action';
      return;
    }

    // Check for symbol patterns
    const symbolPattern = /^[A-Z.]{1,10}$/;
    const isSymbolColumn = columnValues.some(val => symbolPattern.test(val.toUpperCase()));
    if (isSymbolColumn) {
      columnTypes[header] = 'symbol';
      return;
    }
  });

  return columnTypes;
};

export const importTradesFromCSV = async (csvContent: string): Promise<ImportResult> => {
  const errors: ImportError[] = [];
  const trades: Trade[] = [];

  try {
    // Parse CSV content
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const values = lines.slice(1)
      .filter(line => line.trim())
      .map(line => line.split(',').map(v => v.trim()));

    // Find required columns (case insensitive)
    const dateColumn = headers.find(h => h.toLowerCase().includes('open') || h.toLowerCase().includes('date'));
    const symbolColumn = headers.find(h => h.toLowerCase().includes('symbol'));
    const priceColumn = headers.find(h => h.toLowerCase().includes('price'));
    const volumeColumn = headers.find(h => h.toLowerCase().includes('volume'));
    let actionColumn = headers.find(h => h.toLowerCase().includes('action') || h.toLowerCase().includes('type'));

    // If no explicit action column, look for a column containing buy/sell values
    if (!actionColumn) {
      actionColumn = headers.find(h => {
        const columnValues = values.map(row => row[headers.indexOf(h)]);
        return columnValues.some(val => 
          val && ['buy', 'sell', 'long', 'short'].includes(val.toLowerCase())
        );
      });
    }

    // Validate required columns
    const missingColumns = [];
    if (!dateColumn) missingColumns.push('Open/Date');
    if (!symbolColumn) missingColumns.push('Symbol');
    if (!priceColumn) missingColumns.push('Price');
    if (!volumeColumn) missingColumns.push('Volume');
    if (!actionColumn) missingColumns.push('Action/Type');

    if (missingColumns.length > 0) {
      errors.push({
        row: 0,
        message: `Missing required columns: ${missingColumns.join(', ')}`
      });
      return { trades, errors };
    }

    // Process each line
    for (let i = 0; i < values.length; i++) {
      try {
        const rowData: { [key: string]: string } = {};
        values[i].forEach((value, index) => {
          if (index < headers.length) {
            rowData[headers[index]] = value;
          }
        });

        // Get action value and normalize it
        if (!actionColumn || !rowData[actionColumn]) {
          throw new Error('Action/Type column not found or empty');
        }
        const action = rowData[actionColumn].toLowerCase();
        const normalizedAction = action.includes('buy') || action.includes('long') ? 'buy' : 
                               action.includes('sell') || action.includes('short') ? 'sell' : action;

        if (normalizedAction !== 'buy' && normalizedAction !== 'sell') {
          throw new Error(`Invalid Action: ${action}. Must indicate buy/long or sell/short`);
        }

        if (!symbolColumn || !priceColumn || !volumeColumn || !dateColumn) {
          throw new Error('Required columns not found');
        }

        // Create trade object
        const trade: Trade = {
          id: uuidv4(),
          symbol: rowData[symbolColumn].toUpperCase(),
          market_category: 'Equities',
          market: 'Stocks',
          type: normalizedAction === 'buy' ? 'Long' : 'Short',
          status: 'Open', // Default to open
          entry_price: validateNumber(rowData[priceColumn], 'Price'),
          quantity: validateNumber(rowData[volumeColumn], 'Volume', true),
          entry_date: validateDate(rowData[dateColumn], 'Date'),
        };

        // Look for optional close/exit data
        const closePrice = headers.find(h => h.toLowerCase().includes('close') && h.toLowerCase().includes('price'));
        const closeDate = headers.find(h => {
          const isCloseDate = h.toLowerCase().includes('close') && 
                            (h.toLowerCase().includes('date') || h.toLowerCase().includes('time')) &&
                            !h.toLowerCase().includes('price');
          return isCloseDate;
        });
        const profit = headers.find(h => h.toLowerCase().includes('profit') || h.toLowerCase().includes('pnl'));

        if (closePrice && rowData[closePrice]) {
          trade.exit_price = validateNumber(rowData[closePrice], 'Close Price');
          trade.status = 'Closed';
        }
        if (closeDate && rowData[closeDate]) {
          // Only try to parse as date if it looks like a date
          const dateValue = rowData[closeDate].trim();
          if (dateValue.match(/^\d{2}[\/\.]\d{2}[\/\.]\d{2}/) || dateValue.includes(':')) {
            trade.exit_date = validateDate(dateValue, 'Close Date');
          }
        }
        if (profit && rowData[profit]) {
          trade.pnl = validateNumber(rowData[profit], 'Profit');
        }

        // Look for optional metadata
        const tags = headers.find(h => h.toLowerCase().includes('tag'));
        const notes = headers.find(h => h.toLowerCase().includes('note'));

        if (tags && rowData[tags]) {
          trade.tags = rowData[tags].split(';').map(tag => tag.trim());
        }
        if (notes && rowData[notes]) {
          trade.notes = rowData[notes];
        }

        trades.push(trade);
      } catch (error: any) {
        errors.push({
          row: i + 1,
          message: `Row ${i + 1}: ${error?.message || 'Failed to parse trade data'}`
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
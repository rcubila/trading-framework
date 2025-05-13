import { supabase } from './supabase';
import type { Database } from './supabase-types';

interface CSVTrade {
  [key: string]: string | undefined; // Allow any columns
}

const validateNumber = (value: string, fieldName: string): number => {
  // Remove currency symbols and commas
  const cleanValue = value.replace(/[$,]/g, '');
  const num = parseFloat(cleanValue);
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: ${value}. Must be a valid number.`);
  }
  return num;
};

const validateDate = (value: string, fieldName: string): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}: ${value}. Must be a valid date.`);
  }
  return date.toISOString();
};

export const importTradesFromCSV = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const text = await file.text();
    const rows = text.split('\n');
    
    // Parse headers and validate required columns
    const headers = rows[0].split(',').map(h => h.trim());
    const requiredColumns = ['Open', 'Symbol', 'Open Price', 'Volume', 'Action'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Parse trades
    const trades: Database['public']['Tables']['trades']['Insert'][] = [];
    const errors: string[] = [];
    let successCount = 0;
    let skippedCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) {
        skippedCount++;
        continue; // Skip empty rows
      }
      
      try {
        const columns = row.split(',').map(col => col.trim());
        const trade: CSVTrade = {};
        
        // Map available columns to trade object
        columns.forEach((value, index) => {
          if (index < headers.length) {
            trade[headers[index]] = value;
          }
        });

        // Validate required fields
        const missingFields = requiredColumns.filter(field => !trade[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate action
        const action = (trade.Action || '').toLowerCase();
        if (action !== 'buy' && action !== 'sell') {
          throw new Error(`Invalid Action: ${trade.Action}. Must be either 'buy' or 'sell'`);
        }

        // Convert CSV data to database format with validation
        trades.push({
          user_id: user.id,
          symbol: (trade.Symbol || '').toUpperCase(),
          market_category: 'Other', // Default category, can be updated later
          market: 'Other', // Default market, can be updated later
          type: action === 'buy' ? 'Long' : 'Short',
          status: trade['Close Price'] ? 'Closed' : 'Open',
          entry_price: validateNumber(trade['Open Price'] || '', 'Open Price'),
          exit_price: trade['Close Price'] ? validateNumber(trade['Close Price'], 'Close Price') : null,
          quantity: validateNumber(trade.Volume || '', 'Volume'),
          entry_date: validateDate(trade.Open || '', 'Open Date'),
          exit_date: trade.Close ? validateDate(trade.Close, 'Close Date') : null,
          pnl: trade.Profit ? validateNumber(trade.Profit, 'Profit') : null,
          pnl_percentage: null, // Will be calculated later if needed
          notes: trade.Notes || null,
          tags: trade.Tags ? trade.Tags.split(';').map(tag => tag.trim()) : null
        });
        successCount++;
      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    if (trades.length === 0) {
      throw new Error('No valid trades found in the CSV file');
    }

    // Insert trades in batches of 100
    const batchSize = 100;
    for (let i = 0; i < trades.length; i += batchSize) {
      const batch = trades.slice(i, i + batchSize);
      const { error } = await supabase
        .from('trades')
        .insert(batch);
      
      if (error) throw error;
    }

    return {
      success: true,
      message: `Successfully imported ${successCount} trades.\n` +
               `Skipped ${skippedCount} empty rows.\n` +
               (errors.length > 0 ? `Failed to import ${errors.length} rows:\n${errors.join('\n')}` : '')
    };
  } catch (error: any) {
    console.error('Error importing trades:', error);
    return {
      success: false,
      message: error.message || 'Failed to import trades'
    };
  }
}; 
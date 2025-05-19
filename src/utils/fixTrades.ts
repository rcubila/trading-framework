import { supabase } from '../lib/supabase';

/**
 * Updates GER40/DE40/DAX trades in the database to set them as Futures and fix entry prices if they are 0
 * @param defaultEntryPrice - The default entry price to use if the current entry price is 0
 * @returns The updated trades
 */
export const fixGER40Trades = async (defaultEntryPrice: number = 15800): Promise<any[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // First, find all GER40/DE40/DAX trades
    const { data: trades, error: findError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .or('symbol.eq.GER40,symbol.eq.DE40,symbol.eq.DAX');

    if (findError) throw findError;
    if (!trades || trades.length === 0) {
      console.log('No GER40/DE40/DAX trades found');
      return [];
    }

    console.log(`Found ${trades.length} GER40/DE40/DAX trades`);
    
    // Filter trades that need fixing (wrong market or entry_price = 0)
    const tradesToFix = trades.filter(trade => 
      trade.market !== 'Futures' || 
      trade.market_category !== 'Futures' || 
      !trade.entry_price || 
      trade.entry_price === 0
    );

    if (tradesToFix.length === 0) {
      console.log('No trades need fixing');
      return [];
    }

    console.log(`Found ${tradesToFix.length} trades to fix`);

    // Update each trade that needs fixing
    const updatedTrades = [];
    for (const trade of tradesToFix) {
      const updates: any = {
        market: 'Futures',
        market_category: 'Futures'
      };
      
      // Only update entry_price if it's 0 or null
      if (!trade.entry_price || trade.entry_price === 0) {
        updates.entry_price = defaultEntryPrice;
      }

      const { data: updatedTrade, error: updateError } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', trade.id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating trade ${trade.id}:`, updateError);
        continue;
      }

      updatedTrades.push(updatedTrade);
    }

    console.log(`Successfully updated ${updatedTrades.length} trades`);
    return updatedTrades;
  } catch (error) {
    console.error('Error fixing GER40 trades:', error);
    throw error;
  }
}; 
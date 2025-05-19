import { supabase } from '../lib/supabase';

async function queryGER40Trades() {
  try {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .or('symbol.eq.GER40,symbol.eq.DE40,symbol.eq.DAX')
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      return;
    }

    console.log('GER40/DE40/DAX Trades:', JSON.stringify(trades, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

queryGER40Trades(); 
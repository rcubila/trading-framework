import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase-types';

/**
 * Generates test trades with both winning and losing P&L values
 * This is useful for testing the win rate calculation
 */
export const generateTestTrades = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // First delete existing test trades to avoid duplicates
    await supabase
      .from('trades')
      .delete()
      .eq('strategy', 'Test Strategy');

    console.log("Creating new test trades...");

    // Create an array of test trades - some winning, some losing
    const testTrades: Database['public']['Tables']['trades']['Insert'][] = [
      // Winning trades
      {
        user_id: user.id,
        market: 'Stocks',
        market_category: 'Equities',
        symbol: 'AAPL',
        type: 'Long',
        status: 'Closed',
        entry_price: 150,
        exit_price: 160,
        quantity: 10,
        entry_date: new Date().toISOString(),
        exit_date: new Date().toISOString(),
        pnl: 100, // Positive P&L (winning trade)
        pnl_percentage: 6.67,
        strategy: 'Test Strategy'
      },
      {
        user_id: user.id,
        market: 'Stocks',
        market_category: 'Equities',
        symbol: 'GOOGL',
        type: 'Long',
        status: 'Closed',
        entry_price: 2000,
        exit_price: 2100,
        quantity: 5,
        entry_date: new Date().toISOString(),
        exit_date: new Date().toISOString(),
        pnl: 500, // Positive P&L (winning trade)
        pnl_percentage: 5,
        strategy: 'Test Strategy'
      },
      // Losing trades
      {
        user_id: user.id,
        market: 'Stocks',
        market_category: 'Equities',
        symbol: 'MSFT',
        type: 'Long',
        status: 'Closed',
        entry_price: 300,
        exit_price: 290,
        quantity: 10,
        entry_date: new Date().toISOString(),
        exit_date: new Date().toISOString(),
        pnl: -100, // Negative P&L (losing trade)
        pnl_percentage: -3.33,
        strategy: 'Test Strategy'
      },
      // Another losing trade
      {
        user_id: user.id,
        market: 'Stocks',
        market_category: 'Equities',
        symbol: 'TSLA',
        type: 'Long',
        status: 'Closed',
        entry_price: 200,
        exit_price: 180,
        quantity: 10,
        entry_date: new Date().toISOString(),
        exit_date: new Date().toISOString(),
        pnl: -200, // Negative P&L (losing trade)
        pnl_percentage: -10,
        strategy: 'Test Strategy'
      }
    ];

    // Insert the test trades
    const { data, error } = await supabase
      .from('trades')
      .insert(testTrades)
      .select();

    if (error) throw error;
    console.log("Test trades created:", data);
    return data;
  } catch (error) {
    console.error('Error generating test trades:', error);
    throw error;
  }
}; 
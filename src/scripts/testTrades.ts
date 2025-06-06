import { supabase } from '../lib/supabaseClient';

async function testTrades() {
  // Test 1: Count total trades
  const { count, error: countError } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return;
  }

  // Test 2: Get recent trades
  const { data: recentTrades, error: recentError } = await supabase
    .from('trades')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(5);

  if (recentError) {
    return;
  }

  // Test 3: Get trades by market category
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('market_category');

  if (tradesError) {
    return;
  }

  // Calculate category stats manually
  const categoryStats = trades.reduce((acc: { [key: string]: number }, trade) => {
    const category = trade.market_category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Test 4: Get performance metrics
  const { data: performance, error: performanceError } = await supabase
    .from('trades')
    .select('pnl, pnl_percentage')
    .not('pnl', 'is', null);

  if (performanceError) {
    return;
  }

  if (performance && performance.length > 0) {
    const totalPnL = performance.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const avgPnL = totalPnL / performance.length;
    const winningTrades = performance.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = (winningTrades / performance.length) * 100;
  }
}

// Run the tests
testTrades().catch(console.error); 
import { supabase } from '../lib/supabaseClient';

async function testTrades() {
  console.log('Testing trades in database...\n');

  // Test 1: Count total trades
  const { count, error: countError } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting trades:', countError.message);
    return;
  }

  console.log(`Total trades in database: ${count}\n`);

  // Test 2: Get recent trades
  const { data: recentTrades, error: recentError } = await supabase
    .from('trades')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(5);

  if (recentError) {
    console.error('Error fetching recent trades:', recentError.message);
    return;
  }

  console.log('Most recent trades:');
  recentTrades.forEach((trade, index) => {
    console.log(`\nTrade ${index + 1}:`);
    console.log(`Symbol: ${trade.symbol}`);
    console.log(`Type: ${trade.type}`);
    console.log(`Status: ${trade.status}`);
    console.log(`Entry Price: ${trade.entry_price}`);
    console.log(`Entry Date: ${trade.entry_date}`);
    if (trade.exit_price) console.log(`Exit Price: ${trade.exit_price}`);
    if (trade.exit_date) console.log(`Exit Date: ${trade.exit_date}`);
    if (trade.pnl) console.log(`PnL: ${trade.pnl}`);
    console.log('------------------------');
  });

  // Test 3: Get trades by market category
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('market_category');

  if (tradesError) {
    console.error('Error fetching trades:', tradesError.message);
    return;
  }

  // Calculate category stats manually
  const categoryStats = trades.reduce((acc: { [key: string]: number }, trade) => {
    const category = trade.market_category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  console.log('\nTrades by market category:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });

  // Test 4: Get performance metrics
  const { data: performance, error: performanceError } = await supabase
    .from('trades')
    .select('pnl, pnl_percentage')
    .not('pnl', 'is', null);

  if (performanceError) {
    console.error('Error fetching performance:', performanceError.message);
    return;
  }

  if (performance && performance.length > 0) {
    const totalPnL = performance.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const avgPnL = totalPnL / performance.length;
    const winningTrades = performance.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = (winningTrades / performance.length) * 100;

    console.log('\nPerformance Metrics:');
    console.log(`Total PnL: ${totalPnL.toFixed(2)}`);
    console.log(`Average PnL: ${avgPnL.toFixed(2)}`);
    console.log(`Win Rate: ${winRate.toFixed(2)}%`);
  }
}

// Run the tests
testTrades().catch(console.error); 
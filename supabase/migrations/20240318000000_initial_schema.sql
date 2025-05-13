-- Create custom types
CREATE TYPE trade_type AS ENUM ('Long', 'Short');
CREATE TYPE trade_status AS ENUM ('Open', 'Closed');
CREATE TYPE market_category AS ENUM ('Equities', 'Crypto', 'Forex', 'Futures', 'Other');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Create trades table
CREATE TABLE public.trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    market TEXT NOT NULL,
    market_category market_category NOT NULL,
    symbol TEXT NOT NULL,
    type trade_type NOT NULL,
    status trade_status NOT NULL DEFAULT 'Open',
    entry_price DECIMAL(18,8) NOT NULL,
    exit_price DECIMAL(18,8),
    quantity DECIMAL(18,8) NOT NULL,
    entry_date TIMESTAMPTZ NOT NULL,
    exit_date TIMESTAMPTZ,
    pnl DECIMAL(18,2),
    pnl_percentage DECIMAL(8,4),
    risk DECIMAL(18,2),
    reward DECIMAL(18,2),
    strategy TEXT,
    tags TEXT[],
    notes TEXT,
    leverage DECIMAL(10,2),
    stop_loss DECIMAL(18,8),
    take_profit DECIMAL(18,8),
    commission DECIMAL(18,2),
    fees DECIMAL(18,2),
    slippage DECIMAL(18,8),
    exchange TEXT,
    timeframe TEXT,
    setup_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create strategies table
CREATE TABLE public.strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rules TEXT[],
    market_conditions TEXT[],
    timeframes TEXT[],
    risk_percentage DECIMAL(5,2),
    reward_ratio DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    trade_id UUID REFERENCES public.trades(id),
    entry_date TIMESTAMPTZ DEFAULT NOW(),
    market_conditions TEXT[],
    emotions TEXT[],
    lessons_learned TEXT[],
    mistakes TEXT[],
    improvements TEXT[],
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table for better organization
CREATE TABLE public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create discipline_tracker table
CREATE TABLE public.discipline_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    rules_followed TEXT[],
    rules_broken TEXT[],
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance_metrics table
CREATE TABLE public.performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    profit_factor DECIMAL(10,4),
    average_win DECIMAL(18,2),
    average_loss DECIMAL(18,2),
    largest_win DECIMAL(18,2),
    largest_loss DECIMAL(18,2),
    net_profit DECIMAL(18,2),
    market_category market_category,
    timeframe TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles: Users can only read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trades: Users can CRUD their own trades
CREATE POLICY "Users can CRUD own trades" ON public.trades
    FOR ALL USING (auth.uid() = user_id);

-- Strategies: Users can CRUD their own strategies
CREATE POLICY "Users can CRUD own strategies" ON public.strategies
    FOR ALL USING (auth.uid() = user_id);

-- Journal Entries: Users can CRUD their own journal entries
CREATE POLICY "Users can CRUD own journal entries" ON public.journal_entries
    FOR ALL USING (auth.uid() = user_id);

-- Tags: Users can CRUD their own tags
CREATE POLICY "Users can CRUD own tags" ON public.tags
    FOR ALL USING (auth.uid() = user_id);

-- Discipline Tracker: Users can CRUD their own discipline entries
CREATE POLICY "Users can CRUD own discipline entries" ON public.discipline_tracker
    FOR ALL USING (auth.uid() = user_id);

-- Performance Metrics: Users can CRUD their own metrics
CREATE POLICY "Users can CRUD own performance metrics" ON public.performance_metrics
    FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON public.strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discipline_tracker_updated_at
    BEFORE UPDATE ON public.discipline_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
    BEFORE UPDATE ON public.performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX trades_user_id_idx ON public.trades(user_id);
CREATE INDEX trades_symbol_idx ON public.trades(symbol);
CREATE INDEX trades_market_category_idx ON public.trades(market_category);
CREATE INDEX trades_entry_date_idx ON public.trades(entry_date);
CREATE INDEX journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX journal_entries_trade_id_idx ON public.journal_entries(trade_id);
CREATE INDEX strategies_user_id_idx ON public.strategies(user_id);
CREATE INDEX discipline_tracker_user_id_date_idx ON public.discipline_tracker(user_id, date);
CREATE INDEX performance_metrics_user_id_date_idx ON public.performance_metrics(user_id, date);

-- Begin transaction
BEGIN;

-- Insert a sample trade
INSERT INTO public.trades (
    user_id,
    market,
    market_category,
    symbol,
    type,
    status,
    entry_price,
    exit_price,
    quantity,
    entry_date,
    exit_date,
    pnl,
    pnl_percentage,
    risk,
    reward,
    strategy,
    tags,
    notes
) VALUES (
    auth.uid(), -- This will automatically use your authenticated user ID
    'NYSE',
    'Equities',
    'AAPL',
    'Long',
    'Closed',
    175.50,
    180.25,
    100,
    NOW() - interval '2 days',
    NOW() - interval '1 day',
    475.00, -- (180.25 - 175.50) * 100
    2.71, -- ((180.25 - 175.50) / 175.50) * 100
    200.00,
    600.00,
    'Breakout',
    ARRAY['momentum', 'tech'],
    'Strong breakout above resistance with good volume'
);

-- Update or insert performance metrics for today
INSERT INTO public.performance_metrics (
    user_id,
    date,
    total_trades,
    winning_trades,
    losing_trades,
    win_rate,
    profit_factor,
    average_win,
    largest_win,
    net_profit,
    market_category
) VALUES (
    auth.uid(),
    CURRENT_DATE,
    1,
    1,
    0,
    100.00,
    NULL, -- No losses yet
    475.00,
    475.00,
    475.00,
    'Equities'
)
ON CONFLICT (user_id, date) DO UPDATE SET
    total_trades = performance_metrics.total_trades + 1,
    winning_trades = performance_metrics.winning_trades + 1,
    net_profit = performance_metrics.net_profit + 475.00,
    average_win = (performance_metrics.average_win * performance_metrics.winning_trades + 475.00) / (performance_metrics.winning_trades + 1),
    largest_win = GREATEST(performance_metrics.largest_win, 475.00);

COMMIT;

-- Query to verify the results
SELECT 
    t.symbol, 
    t.type, 
    t.entry_price, 
    t.exit_price, 
    t.pnl,
    pm.total_trades,
    pm.winning_trades,
    pm.net_profit,
    pm.average_win
FROM public.trades t
JOIN public.performance_metrics pm 
    ON pm.user_id = t.user_id 
    AND pm.date = CURRENT_DATE
WHERE t.user_id = auth.uid()
ORDER BY t.created_at DESC
LIMIT 1; 
-- Add playbook support to existing strategies table
ALTER TABLE public.strategies
ADD COLUMN is_playbook BOOLEAN DEFAULT false,
ADD COLUMN asset_name VARCHAR(50),
ADD COLUMN performance_total_trades INTEGER DEFAULT 0,
ADD COLUMN performance_win_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN performance_average_r DECIMAL(10,2) DEFAULT 0,
ADD COLUMN performance_profit_factor DECIMAL(10,2) DEFAULT 0,
ADD COLUMN performance_expectancy DECIMAL(10,2) DEFAULT 0,
ADD COLUMN performance_largest_win DECIMAL(15,2) DEFAULT 0,
ADD COLUMN performance_largest_loss DECIMAL(15,2) DEFAULT 0,
ADD COLUMN performance_average_win DECIMAL(15,2) DEFAULT 0,
ADD COLUMN performance_average_loss DECIMAL(15,2) DEFAULT 0,
ADD COLUMN performance_net_pl DECIMAL(15,2) DEFAULT 0;

-- Create missed trades table
CREATE TABLE public.missed_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    reason TEXT,
    potential_pnl DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for new table
ALTER TABLE public.missed_trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for missed trades
CREATE POLICY "Users can CRUD own missed trades" ON public.missed_trades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.strategies s
            WHERE s.id = missed_trades.strategy_id
            AND s.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX missed_trades_strategy_id_idx ON public.missed_trades(strategy_id);
CREATE INDEX strategies_asset_name_idx ON public.strategies(asset_name);

-- Create trigger for missed_trades updated_at
CREATE TRIGGER update_missed_trades_updated_at
    BEFORE UPDATE ON public.missed_trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
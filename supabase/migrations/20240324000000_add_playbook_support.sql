-- Add playbook support to existing schema

-- Add playbook type to existing strategies table
ALTER TABLE public.strategies
ADD COLUMN is_playbook BOOLEAN DEFAULT false,
ADD COLUMN parent_id UUID REFERENCES public.strategies(id),
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

-- Create rules table for playbook rules
CREATE TABLE public.playbook_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Enable RLS for new tables
ALTER TABLE public.playbook_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missed_trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can CRUD own playbook rules" ON public.playbook_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.strategies s
            WHERE s.id = playbook_rules.strategy_id
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can CRUD own missed trades" ON public.missed_trades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.strategies s
            WHERE s.id = missed_trades.strategy_id
            AND s.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX playbook_rules_strategy_id_idx ON public.playbook_rules(strategy_id);
CREATE INDEX missed_trades_strategy_id_idx ON public.missed_trades(strategy_id);
CREATE INDEX strategies_parent_id_idx ON public.strategies(parent_id);
CREATE INDEX strategies_asset_name_idx ON public.strategies(asset_name);

-- Create function to update parent strategy performance
CREATE OR REPLACE FUNCTION update_parent_strategy_performance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        UPDATE public.strategies
        SET 
            performance_total_trades = (
                SELECT SUM(performance_total_trades)
                FROM public.strategies
                WHERE parent_id = NEW.parent_id
            ),
            performance_win_rate = (
                SELECT AVG(performance_win_rate)
                FROM public.strategies
                WHERE parent_id = NEW.parent_id
            ),
            performance_average_r = (
                SELECT AVG(performance_average_r)
                FROM public.strategies
                WHERE parent_id = NEW.parent_id
            ),
            performance_profit_factor = (
                SELECT AVG(performance_profit_factor)
                FROM public.strategies
                WHERE parent_id = NEW.parent_id
            ),
            performance_expectancy = (
                SELECT AVG(performance_expectancy)
                FROM public.strategies
                WHERE parent_id = NEW.parent_id
            ),
            performance_net_pl = (
                SELECT SUM(performance_net_pl)
                FROM public.strategies
                WHERE parent_id = NEW.parent_id
            ),
            updated_at = NOW()
        WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update parent strategy performance
CREATE TRIGGER update_parent_strategy_performance_trigger
    AFTER INSERT OR UPDATE ON public.strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_strategy_performance();

-- Create trigger for playbook_rules updated_at
CREATE TRIGGER update_playbook_rules_updated_at
    BEFORE UPDATE ON public.playbook_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for missed_trades updated_at
CREATE TRIGGER update_missed_trades_updated_at
    BEFORE UPDATE ON public.missed_trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
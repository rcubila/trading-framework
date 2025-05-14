-- Create trading_rules table
CREATE TABLE public.trading_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Entry', 'Exit', 'Risk Management', 'Psychology', 'Process')),
    description TEXT NOT NULL,
    importance TEXT NOT NULL CHECK (importance IN ('Critical', 'Important', 'Good Practice')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trading_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
CREATE POLICY "Users can CRUD own trading rules" ON public.trading_rules
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trading_rules_updated_at
    BEFORE UPDATE ON public.trading_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX trading_rules_user_id_idx ON public.trading_rules(user_id); 
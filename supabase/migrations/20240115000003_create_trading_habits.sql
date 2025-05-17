-- Create trading_habits table
CREATE TABLE IF NOT EXISTS public.trading_habits (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    goal INTEGER NOT NULL,
    done INTEGER DEFAULT 0,
    remaining INTEGER NOT NULL,
    daily_status JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.trading_habits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for users" ON public.trading_habits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users" ON public.trading_habits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users" ON public.trading_habits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users" ON public.trading_habits
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_trading_habits_user_id ON public.trading_habits(user_id);
CREATE INDEX idx_trading_habits_created_at ON public.trading_habits(created_at);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.trading_habits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
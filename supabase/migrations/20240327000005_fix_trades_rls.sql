-- Enable RLS for trades table
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can select own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;

-- Create comprehensive policies for all operations
CREATE POLICY "Users can select own trades"
ON public.trades
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
ON public.trades
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
ON public.trades
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
ON public.trades
FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.trades TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 
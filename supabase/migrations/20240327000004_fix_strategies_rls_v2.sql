-- First, ensure RLS is enabled
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can select own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON public.strategies;

-- Create comprehensive policies for all operations
CREATE POLICY "Users can select own strategies"
ON public.strategies
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
ON public.strategies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
ON public.strategies
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
ON public.strategies
FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.strategies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 
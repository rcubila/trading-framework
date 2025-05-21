-- Enable RLS for strategies table
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can select own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON public.strategies;

-- Allow users to select their own strategies
CREATE POLICY "Users can select own strategies" ON public.strategies
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own strategies
CREATE POLICY "Users can insert own strategies" ON public.strategies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own strategies
CREATE POLICY "Users can update own strategies" ON public.strategies
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own strategies
CREATE POLICY "Users can delete own strategies" ON public.strategies
    FOR DELETE USING (auth.uid() = user_id); 
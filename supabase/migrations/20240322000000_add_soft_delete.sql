-- Add deleted_at column to trades table
ALTER TABLE public.trades
ADD COLUMN deleted_at TIMESTAMPTZ;

-- Create index for better performance on soft delete queries
CREATE INDEX trades_deleted_at_idx ON public.trades(deleted_at);

-- Update RLS policies to exclude soft-deleted records by default
CREATE POLICY "Users can only view non-deleted trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Update existing policies to include deleted_at check
DROP POLICY IF EXISTS "Users can CRUD own trades" ON public.trades;
CREATE POLICY "Users can CRUD own trades" ON public.trades
    FOR ALL USING (auth.uid() = user_id AND deleted_at IS NULL); 
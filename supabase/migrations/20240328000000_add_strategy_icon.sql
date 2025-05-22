-- Add icon column to strategies table
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Update the type definition
COMMENT ON COLUMN public.strategies.icon IS 'Optional icon identifier for the strategy (e.g., "chart-line", "trending-up", etc.)'; 
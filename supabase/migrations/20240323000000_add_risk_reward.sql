-- Add risk_reward column to trades table
ALTER TABLE public.trades
ADD COLUMN risk_reward DECIMAL;

-- Update existing trades to calculate risk_reward from risk and reward
UPDATE public.trades
SET risk_reward = CASE 
    WHEN risk > 0 AND reward > 0 THEN reward / risk
    ELSE NULL
END; 
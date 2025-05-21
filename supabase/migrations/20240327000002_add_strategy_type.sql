-- Add type column to strategies table
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS type TEXT;

-- Add is_playbook column if it doesn't exist
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS is_playbook BOOLEAN DEFAULT false;

-- Add parent_id column if it doesn't exist
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.strategies(id);

-- Add asset_name column if it doesn't exist
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS asset_name VARCHAR(50);

-- Add performance columns if they don't exist
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS performance_total_trades INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_win_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_average_r DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_profit_factor DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_expectancy DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_largest_win DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_largest_loss DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_average_win DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_average_loss DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_net_pl DECIMAL(15,2) DEFAULT 0; 
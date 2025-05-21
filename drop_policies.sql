-- Drop all policies from trading_habits
DROP POLICY IF EXISTS "Enable read access for users" ON public.trading_habits;
DROP POLICY IF EXISTS "Enable insert for users" ON public.trading_habits;
DROP POLICY IF EXISTS "Enable update for users" ON public.trading_habits;
DROP POLICY IF EXISTS "Enable delete for users" ON public.trading_habits;

-- Drop all policies from profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop all policies from strategies
DROP POLICY IF EXISTS "Users can view own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON public.strategies;

-- Drop all policies from playbook_rules
DROP POLICY IF EXISTS "Users can CRUD own playbook rules" ON public.playbook_rules;

-- Drop all policies from missed_trades
DROP POLICY IF EXISTS "Users can CRUD own missed trades" ON public.missed_trades; 
-- Grant all permissions to the service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure the service role has access to the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO service_role;

-- Ensure the service role has access to the trades table
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.trades TO service_role; 
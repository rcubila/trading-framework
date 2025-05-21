-- Add role field to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Drop the policy if it exists before creating it
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create RLS policy for admin access
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    ));

-- Update your user to be an admin (replace with your user ID)
UPDATE public.profiles SET role = 'admin' WHERE email = 'raulcubilaperez@gmail.com'; 
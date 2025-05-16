-- Add role field to profiles table
ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create RLS policy for admin access
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    ));

-- Update your user to be an admin (replace with your user ID)
UPDATE public.profiles SET role = 'admin' WHERE email = 'raulcubilaperez@gmail.com'; 
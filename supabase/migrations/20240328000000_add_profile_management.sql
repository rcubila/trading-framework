-- Create a secure function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_profile_creation(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to insert the profile, ignore if it already exists
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_avatar_url,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_profile_creation TO authenticated; 
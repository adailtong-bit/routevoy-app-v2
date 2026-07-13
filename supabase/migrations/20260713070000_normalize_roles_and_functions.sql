DO $$
BEGIN
  -- 1. Update profiles role to lowercase to ensure RLS matching logic works robustly
  UPDATE public.profiles SET role = lower(role) WHERE role != lower(role);
  
  -- 2. Update user_invitations role to lowercase
  UPDATE public.user_invitations SET role = lower(role) WHERE role != lower(role);
END $$;

-- 3. Recreate get_my_role to always return lowercase
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT lower(role) FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Make sure authenticated users can read their own profile, regardless of status
DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
CREATE POLICY "auth_read_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Also ensure they can update their own profile while pending
DROP POLICY IF EXISTS "auth_update_own_profile" ON public.profiles;
CREATE POLICY "auth_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

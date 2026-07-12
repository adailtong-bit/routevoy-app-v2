-- Fix profiles RLS to ensure merchants can see their team and members can edit their own profiles

DROP POLICY IF EXISTS "auth_update_own_profile" ON public.profiles;
CREATE POLICY "auth_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "merchant_select_team_profiles" ON public.profiles;
CREATE POLICY "merchant_select_team_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    (company_id IS NOT NULL AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1))
  );

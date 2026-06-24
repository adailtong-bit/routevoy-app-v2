-- Fix infinite recursion in profiles and ad_campaigns policies
DO $$
BEGIN

  -- 1. Drop existing potentially recursive profiles policies
  DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

  -- 2. Create clean, non-recursive profiles policies
  CREATE POLICY "profiles_select_all" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

  CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

  -- 3. Fix ad_campaigns admin policy to avoid deep recursion if it was using complex functions
  DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
  CREATE POLICY "admin_all_ad_campaigns_override" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
      )
    );

  -- 4. Fix crm_campaigns admin policy
  DROP POLICY IF EXISTS "admin_all_crm_campaigns" ON public.crm_campaigns;
  CREATE POLICY "admin_all_crm_campaigns" ON public.crm_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
      )
    );

END $$;

-- Drop potential recursive policies on profiles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create safe policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete_own" ON public.profiles
FOR DELETE TO authenticated USING (id = auth.uid());


-- Recreate admin policies for ad_campaigns safely
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;

CREATE POLICY "admin_all_ad_campaigns_override" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.company_id = ad_campaigns.company_id OR profiles.franchise_id = ad_campaigns.franchise_id)
  )
);


-- Recreate admin policies for crm_campaigns safely
DROP POLICY IF EXISTS "admin_all_crm_campaigns" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_admin_all" ON public.crm_campaigns;
DROP POLICY IF EXISTS "auth_manage_own_crm_campaigns" ON public.crm_campaigns;

CREATE POLICY "admin_all_crm_campaigns" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "auth_manage_own_crm_campaigns" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.company_id = crm_campaigns.company_id OR profiles.franchise_id = crm_campaigns.franchise_id)
  )
);

-- Note: we use `public.profiles` in the EXISTS clause, but since the SELECT policy on `profiles` is just `USING (true)`,
-- it will not cause infinite recursion because evaluating `profiles_select_all` does not trigger another check on `profiles`.

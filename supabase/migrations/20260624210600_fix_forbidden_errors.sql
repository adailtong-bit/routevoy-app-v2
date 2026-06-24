-- Fix Infinite Recursion in profiles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "master_all_profiles" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Super admin email bypass for profiles
CREATE POLICY "master_all_profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'adailtong@gmail.com')
);

-- Fix check_hierarchy_access function to ensure it doesn't query public.users and avoid recursion
DROP FUNCTION IF EXISTS public.check_hierarchy_access(text, text, text, uuid, uuid);
DROP FUNCTION IF EXISTS public.check_hierarchy_access(text, uuid, uuid, uuid, uuid);

CREATE OR REPLACE FUNCTION public.check_hierarchy_access(
  p_target_table text,
  p_company_id text DEFAULT NULL,
  p_franchise_id text DEFAULT NULL,
  p_affiliate_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
) RETURNS boolean AS $func$
DECLARE
  v_user_role text;
  v_user_company text;
  v_user_franchise text;
  v_user_affiliate uuid;
BEGIN
  -- Master bypass directly checks auth.users to avoid public schemas
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id AND email = 'adailtong@gmail.com') THEN
    RETURN true;
  END IF;

  SELECT role, company_id, franchise_id
  INTO v_user_role, v_user_company, v_user_franchise
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_user_role IN ('super_admin', 'admin') THEN
    RETURN true;
  END IF;

  IF v_user_role = 'affiliate' THEN
    SELECT id INTO v_user_affiliate
    FROM public.affiliate_partners
    WHERE user_id = p_user_id
    LIMIT 1;

    IF p_affiliate_id IS NOT NULL AND p_affiliate_id = v_user_affiliate THEN
      RETURN true;
    END IF;
  END IF;

  IF v_user_role = 'franchisee' THEN
    IF p_franchise_id IS NOT NULL AND p_franchise_id = v_user_franchise THEN
      RETURN true;
    END IF;
  END IF;

  IF v_user_role IN ('merchant', 'shopkeeper') THEN
    IF p_company_id IS NOT NULL AND p_company_id = v_user_company THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix affiliate_partners policies to avoid recursion
DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "ensure_hierarchy_select_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_all" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_select" ON public.affiliate_partners;

CREATE POLICY "public_read_affiliates" ON public.affiliate_partners FOR SELECT USING (true);
CREATE POLICY "affiliate_insert_own" ON public.affiliate_partners FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "affiliate_update_own" ON public.affiliate_partners FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "master_all_affiliates" ON public.affiliate_partners FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'adailtong@gmail.com')
);

-- Admin Visibility for Campaigns
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;

CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'adailtong@gmail.com')
);

CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns FOR SELECT USING (true);

-- Admin Visibility for CRM Campaigns
DROP POLICY IF EXISTS "admin_all_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "admin_all_crm_campaigns" ON public.crm_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'adailtong@gmail.com')
);
CREATE POLICY "public_read_crm_campaigns" ON public.crm_campaigns FOR SELECT USING (true);

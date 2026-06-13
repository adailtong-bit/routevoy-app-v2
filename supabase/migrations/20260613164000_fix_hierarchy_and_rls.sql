-- DO Block for seed
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Function for hierarchy access
CREATE OR REPLACE FUNCTION public.check_hierarchy_access(
  p_target_table text, 
  p_franchise_id text DEFAULT NULL, 
  p_company_id text DEFAULT NULL, 
  p_affiliate_id uuid DEFAULT NULL, 
  p_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_user_franchise text;
  v_user_company text;
  v_user_affiliate uuid;
  v_email text;
BEGIN
  v_email := auth.jwt() ->> 'email';
  
  -- Super admin / Master bypass
  IF v_email = 'adailtong@gmail.com' THEN
    RETURN true;
  END IF;

  SELECT role, franchise_id, company_id 
  INTO v_role, v_user_franchise, v_user_company
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_role IN ('admin', 'super_admin') THEN
    RETURN true;
  END IF;

  -- Franchisee
  IF v_role = 'franchisee' THEN
    IF p_franchise_id IS NOT NULL THEN
      RETURN v_user_franchise = p_franchise_id;
    END IF;
  END IF;

  -- Merchant
  IF v_role IN ('merchant', 'shopkeeper') THEN
    IF p_company_id IS NOT NULL THEN
      RETURN v_user_company = p_company_id;
    END IF;
  END IF;

  -- Affiliate
  IF v_role = 'affiliate' THEN
    SELECT id INTO v_user_affiliate FROM public.affiliate_partners WHERE user_id = auth.uid();
    IF p_affiliate_id IS NOT NULL THEN
      RETURN v_user_affiliate = p_affiliate_id;
    END IF;
  END IF;

  -- End User
  IF p_user_id IS NOT NULL THEN
    RETURN auth.uid() = p_user_id;
  END IF;

  RETURN false;
END;
$;

-- RLS POLICIES

-- PROFILES
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
DROP POLICY IF EXISTS "merchant_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "franchisee_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "hierarchy_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "hierarchy_profiles_all" ON public.profiles;

CREATE POLICY "hierarchy_profiles_select" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR check_hierarchy_access('profiles', franchise_id, company_id, NULL, id));

CREATE POLICY "hierarchy_profiles_all" ON public.profiles FOR ALL TO authenticated
USING (id = auth.uid() OR check_hierarchy_access('profiles', franchise_id, company_id, NULL, id));

-- FRANCHISES
DROP POLICY IF EXISTS "public_read_franchises" ON public.franchises;
DROP POLICY IF EXISTS "franchisee_own_franchise" ON public.franchises;
DROP POLICY IF EXISTS "admin_all_franchises" ON public.franchises;
DROP POLICY IF EXISTS "admin_all_franchises_override" ON public.franchises;
DROP POLICY IF EXISTS "hierarchy_franchises_select" ON public.franchises;
DROP POLICY IF EXISTS "hierarchy_franchises_all" ON public.franchises;

CREATE POLICY "hierarchy_franchises_select" ON public.franchises FOR SELECT TO authenticated
USING (status = 'active' OR check_hierarchy_access('franchises', id, NULL, NULL, NULL));

CREATE POLICY "hierarchy_franchises_all" ON public.franchises FOR ALL TO authenticated
USING (check_hierarchy_access('franchises', id, NULL, NULL, NULL));

-- MERCHANTS
DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "hierarchy_merchants_select" ON public.merchants;
DROP POLICY IF EXISTS "hierarchy_merchants_all" ON public.merchants;

CREATE POLICY "hierarchy_merchants_select" ON public.merchants FOR SELECT TO authenticated
USING (status = 'active' OR check_hierarchy_access('merchants', franchise_id, id, NULL, NULL));

CREATE POLICY "hierarchy_merchants_all" ON public.merchants FOR ALL TO authenticated
USING (check_hierarchy_access('merchants', franchise_id, id, NULL, NULL));

-- COUPONS
DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;
DROP POLICY IF EXISTS "merchant_own_coupons" ON public.coupons;
DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
DROP POLICY IF EXISTS "admin_all_coupons" ON public.coupons;
DROP POLICY IF EXISTS "hierarchy_coupons_select" ON public.coupons;
DROP POLICY IF EXISTS "hierarchy_coupons_all" ON public.coupons;

CREATE POLICY "hierarchy_coupons_select" ON public.coupons FOR SELECT TO authenticated
USING (status = 'active' OR check_hierarchy_access('coupons', franchise_id, company_id, NULL, user_id));

CREATE POLICY "hierarchy_coupons_all" ON public.coupons FOR ALL TO authenticated
USING (check_hierarchy_access('coupons', franchise_id, company_id, NULL, user_id));

-- AD_CAMPAIGNS
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "select_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "hierarchy_ads_select" ON public.ad_campaigns;
DROP POLICY IF EXISTS "hierarchy_ads_all" ON public.ad_campaigns;

CREATE POLICY "hierarchy_ads_select" ON public.ad_campaigns FOR SELECT TO authenticated
USING (status = 'active' OR check_hierarchy_access('ad_campaigns', franchise_id, company_id, NULL, NULL));

CREATE POLICY "hierarchy_ads_all" ON public.ad_campaigns FOR ALL TO authenticated
USING (check_hierarchy_access('ad_campaigns', franchise_id, company_id, NULL, NULL));

-- AFFILIATE_PARTNERS
DROP POLICY IF EXISTS "auth_read_own_affiliate" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_all" ON public.affiliate_partners;

CREATE POLICY "hierarchy_affiliates_select" ON public.affiliate_partners FOR SELECT TO authenticated
USING (check_hierarchy_access('affiliate_partners', franchise_id, NULL, id, user_id));

CREATE POLICY "hierarchy_affiliates_all" ON public.affiliate_partners FOR ALL TO authenticated
USING (check_hierarchy_access('affiliate_partners', franchise_id, NULL, id, user_id));

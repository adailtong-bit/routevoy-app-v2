-- Ensure admin user exists and profile is configured
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
      '{"name": "Admin Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET role = 'super_admin' WHERE id = new_user_id;
  END IF;
END $$;

-- Create helper functions for RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.get_auth_role() RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_company_id() RETURNS text AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_franchise_id() RETURNS text AS $$
  SELECT franchise_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "auth_delete_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_self" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_all_self" ON public.profiles FOR ALL USING (id = auth.uid());

-- 2. AD CAMPAIGNS POLICIES
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Enable select for all" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
DROP POLICY IF EXISTS "admin_select_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "auth_delete_ad_campaigns_demo" ON public.ad_campaigns;
DROP POLICY IF EXISTS "auth_insert_ad_campaigns_demo" ON public.ad_campaigns;
DROP POLICY IF EXISTS "auth_manage_own_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "auth_update_ad_campaigns_demo" ON public.ad_campaigns;
DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "hierarchy_ads_all" ON public.ad_campaigns;
DROP POLICY IF EXISTS "hierarchy_ads_select" ON public.ad_campaigns;
DROP POLICY IF EXISTS "master_bypass_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "select_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "super_admin_all_ads_override" ON public.ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_select_all" ON public.ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_all_hierarchy" ON public.ad_campaigns;

CREATE POLICY "ad_campaigns_select_all" ON public.ad_campaigns FOR SELECT USING (true);

CREATE POLICY "ad_campaigns_all_hierarchy" ON public.ad_campaigns FOR ALL USING (
  public.get_auth_role() IN ('super_admin', 'admin') OR
  (public.get_auth_role() = 'franchisee' AND franchise_id = public.get_auth_franchise_id()) OR
  (public.get_auth_role() IN ('merchant', 'shopkeeper') AND company_id = public.get_auth_company_id())
);

-- 3. MERCHANTS POLICIES
DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "admin_select_merchants" ON public.merchants;
DROP POLICY IF EXISTS "authenticated_delete_merchants" ON public.merchants;
DROP POLICY IF EXISTS "authenticated_insert_merchants" ON public.merchants;
DROP POLICY IF EXISTS "authenticated_select_merchants" ON public.merchants;
DROP POLICY IF EXISTS "authenticated_update_merchants" ON public.merchants;
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "hierarchy_merchants_all" ON public.merchants;
DROP POLICY IF EXISTS "hierarchy_merchants_select" ON public.merchants;
DROP POLICY IF EXISTS "master_bypass_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchants_delete" ON public.merchants;
DROP POLICY IF EXISTS "merchants_insert" ON public.merchants;
DROP POLICY IF EXISTS "merchants_select" ON public.merchants;
DROP POLICY IF EXISTS "merchants_update" ON public.merchants;
DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;
DROP POLICY IF EXISTS "super_admin_all_merchants_override" ON public.merchants;
DROP POLICY IF EXISTS "merchants_select_all" ON public.merchants;
DROP POLICY IF EXISTS "merchants_all_hierarchy" ON public.merchants;

CREATE POLICY "merchants_select_all" ON public.merchants FOR SELECT USING (true);

CREATE POLICY "merchants_all_hierarchy" ON public.merchants FOR ALL USING (
  public.get_auth_role() IN ('super_admin', 'admin') OR
  (public.get_auth_role() = 'franchisee' AND franchise_id = public.get_auth_franchise_id()) OR
  (public.get_auth_role() IN ('merchant', 'shopkeeper') AND id = public.get_auth_company_id())
);

-- 4. FRANCHISES POLICIES
DROP POLICY IF EXISTS "admin_all_franchises" ON public.franchises;
DROP POLICY IF EXISTS "admin_all_franchises_override" ON public.franchises;
DROP POLICY IF EXISTS "admin_select_franchises" ON public.franchises;
DROP POLICY IF EXISTS "auth_read_franchise_by_profile" ON public.franchises;
DROP POLICY IF EXISTS "ensure_hierarchy_select_franchises" ON public.franchises;
DROP POLICY IF EXISTS "franchisee_own_franchise" ON public.franchises;
DROP POLICY IF EXISTS "hierarchy_franchises_all" ON public.franchises;
DROP POLICY IF EXISTS "hierarchy_franchises_select" ON public.franchises;
DROP POLICY IF EXISTS "master_bypass_franchises" ON public.franchises;
DROP POLICY IF EXISTS "public_read_franchises" ON public.franchises;
DROP POLICY IF EXISTS "franchises_select_all" ON public.franchises;
DROP POLICY IF EXISTS "franchises_all_hierarchy" ON public.franchises;

CREATE POLICY "franchises_select_all" ON public.franchises FOR SELECT USING (true);

CREATE POLICY "franchises_all_hierarchy" ON public.franchises FOR ALL USING (
  public.get_auth_role() IN ('super_admin', 'admin') OR
  (public.get_auth_role() = 'franchisee' AND id = public.get_auth_franchise_id())
);

-- 5. AFFILIATE PARTNERS POLICIES
DROP POLICY IF EXISTS "affiliate_partners_delete" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_insert" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_update" ON public.affiliate_partners;
DROP POLICY IF EXISTS "super_admin_all_affiliates_override" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliates_select_all" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliates_all_hierarchy" ON public.affiliate_partners;

CREATE POLICY "affiliates_select_all" ON public.affiliate_partners FOR SELECT USING (true);

CREATE POLICY "affiliates_all_hierarchy" ON public.affiliate_partners FOR ALL USING (
  public.get_auth_role() IN ('super_admin', 'admin') OR
  (user_id = auth.uid()) OR
  (public.get_auth_role() = 'franchisee' AND franchise_id = public.get_auth_franchise_id())
);

-- 1. Create SECURITY DEFINER function to check admin without recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $func$
DECLARE
  v_role text;
  v_email text;
BEGIN
  v_email := auth.jwt()->>'email';
  IF v_email = 'adailtong@gmail.com' THEN
    RETURN true;
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN v_role IN ('admin', 'super_admin');
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update profiles RLS to prevent recursion
DO $do$
BEGIN
  DROP POLICY IF EXISTS "auth_delete_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "auth_insert_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "auth_read_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "auth_update_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

  CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
  CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY "profiles_update_auth" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_super_admin());
  CREATE POLICY "profiles_delete_auth" ON public.profiles FOR DELETE USING (auth.uid() = id OR public.is_super_admin());
END $do$;

-- 3. Update ad_campaigns RLS for correct hierarchical authorization
DO $do$
BEGIN
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
  
  CREATE POLICY "ad_campaigns_read_all" ON public.ad_campaigns FOR SELECT USING (true);
  
  CREATE POLICY "ad_campaigns_insert_auth" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (
    public.is_super_admin() OR
    (company_id IS NOT NULL AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
    (franchise_id IS NOT NULL AND franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())) OR
    (affiliate_id IS NOT NULL AND affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()))
  );
  
  CREATE POLICY "ad_campaigns_update_auth" ON public.ad_campaigns FOR UPDATE TO authenticated USING (
    public.is_super_admin() OR
    (company_id IS NOT NULL AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
    (franchise_id IS NOT NULL AND franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())) OR
    (affiliate_id IS NOT NULL AND affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()))
  );
  
  CREATE POLICY "ad_campaigns_delete_auth" ON public.ad_campaigns FOR DELETE TO authenticated USING (
    public.is_super_admin() OR
    (company_id IS NOT NULL AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
    (franchise_id IS NOT NULL AND franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())) OR
    (affiliate_id IS NOT NULL AND affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()))
  );
END $do$;

-- 4. Seed user adailtong@gmail.com
DO $do$
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
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $do$;

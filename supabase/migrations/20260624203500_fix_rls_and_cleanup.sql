-- 1. Clean up demo data
DELETE FROM public.ad_campaigns WHERE is_demo = true;
DELETE FROM public.coupons WHERE is_demo = true;
DELETE FROM public.discovered_promotions WHERE is_demo = true;

-- 2. Seed Adailton and ensure super_admin
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE email = 'adailtong@gmail.com';
    
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb
    WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- 3. Fix Profiles RLS Recursion (Code 42P17)
DROP POLICY IF EXISTS "admin_all_profiles_override" ON public.profiles;
DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "auth_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "master_bypass_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Create Safe, Non-Recursive Policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (id = auth.uid());

-- Admin Bypass using auth.jwt() and auth.users (avoids querying profiles itself)
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- 4. Fix Site Settings Read Policy (Ensures Hero settings load perfectly for anonymous users)
DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings FOR SELECT USING (true);

-- 5. Master Bypass for Core Tables
DROP POLICY IF EXISTS "master_bypass_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "master_bypass_ad_campaigns" ON public.ad_campaigns FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "master_bypass_coupons" ON public.coupons;
CREATE POLICY "master_bypass_coupons" ON public.coupons FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "master_bypass_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "master_bypass_discovered_promotions" ON public.discovered_promotions FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "master_bypass_merchants" ON public.merchants;
CREATE POLICY "master_bypass_merchants" ON public.merchants FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "master_bypass_franchises" ON public.franchises;
CREATE POLICY "master_bypass_franchises" ON public.franchises FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "master_bypass_affiliate_partners" ON public.affiliate_partners;
CREATE POLICY "master_bypass_affiliate_partners" ON public.affiliate_partners FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- 6. Clean Public Reads for Feeds
-- Ensures no hidden policy is blocking anonymous viewing or recursing.
DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;
CREATE POLICY "public_read_coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_discovered_promotions_new" ON public.discovered_promotions;
DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
CREATE POLICY "public_read_discovered_promotions" ON public.discovered_promotions FOR SELECT USING (true);

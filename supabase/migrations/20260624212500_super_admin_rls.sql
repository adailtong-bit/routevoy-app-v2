DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert or update user adailtong@gmail.com
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"super_admin"')
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
END $$;

-- 1. Profiles
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "super_admin_all_profiles_override" ON public.profiles;
CREATE POLICY "super_admin_all_profiles_override" ON public.profiles
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- 2. Affiliate Partners
DROP POLICY IF EXISTS "affiliate_partners_auth_select" ON public.affiliate_partners;
CREATE POLICY "affiliate_partners_auth_select" ON public.affiliate_partners
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "super_admin_all_affiliates_override" ON public.affiliate_partners;
CREATE POLICY "super_admin_all_affiliates_override" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- 3. Ad Campaigns
DROP POLICY IF EXISTS "super_admin_all_ads_override" ON public.ad_campaigns;
CREATE POLICY "super_admin_all_ads_override" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- 4. Coupons
DROP POLICY IF EXISTS "admin_all_coupons_override" ON public.coupons;
CREATE POLICY "admin_all_coupons_override" ON public.coupons
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- 5. Merchants
DROP POLICY IF EXISTS "admin_all_merchants_override" ON public.merchants;
CREATE POLICY "admin_all_merchants_override" ON public.merchants
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- 6. Ad Advertisers
DROP POLICY IF EXISTS "admin_all_ad_advertisers_override" ON public.ad_advertisers;
CREATE POLICY "admin_all_ad_advertisers_override" ON public.ad_advertisers
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

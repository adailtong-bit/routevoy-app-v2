DO $$
DECLARE
  v_user_id uuid := '407bd489-a8b3-4b97-b038-bb3d930aa426'::uuid;
BEGIN
  -- 1. Seed auth.users for super_admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
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
      '{"name": "Admin Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Ensure existing user adailtong@gmail.com has empty string tokens instead of NULL
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE email = 'adailtong@gmail.com';

  -- 2. Profile Seed
  -- If the auth user has a different ID because it was created before, we fetch that ID
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    COALESCE((SELECT id FROM auth.users WHERE email = 'adailtong@gmail.com'), v_user_id), 
    'adailtong@gmail.com', 
    'Admin Master', 
    'super_admin'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

END $$;

-- 3. Update RLS Policies for super_admin

-- profiles
DROP POLICY IF EXISTS "super_admin_all_profiles_override" ON public.profiles;
CREATE POLICY "super_admin_all_profiles_override" ON public.profiles 
  FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

-- affiliate_partners
DROP POLICY IF EXISTS "super_admin_all_affiliates_override" ON public.affiliate_partners;
CREATE POLICY "super_admin_all_affiliates_override" ON public.affiliate_partners 
  FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

-- coupons
DROP POLICY IF EXISTS "super_admin_all_coupons_override" ON public.coupons;
CREATE POLICY "super_admin_all_coupons_override" ON public.coupons 
  FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

-- ad_campaigns
DROP POLICY IF EXISTS "super_admin_all_ads_override" ON public.ad_campaigns;
CREATE POLICY "super_admin_all_ads_override" ON public.ad_campaigns 
  FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

-- merchants
DROP POLICY IF EXISTS "super_admin_all_merchants_override" ON public.merchants;
CREATE POLICY "super_admin_all_merchants_override" ON public.merchants 
  FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

-- categories
DROP POLICY IF EXISTS "super_admin_all_categories_override" ON public.categories;
CREATE POLICY "super_admin_all_categories_override" ON public.categories 
  FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

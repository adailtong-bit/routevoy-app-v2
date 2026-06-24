DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Seed Super Admin User in auth.users idempotently
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- Insert corresponding profile
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton G', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET role = 'super_admin' WHERE id = v_user_id;
  END IF;
END $$;

-- 2. Overriding policies to ensure super admin full access, avoiding infinite recursion

-- Profiles: Only rely on JWT email claim to completely avoid recursion while resolving 403s
DROP POLICY IF EXISTS "super_admin_all_profiles_override" ON public.profiles;
CREATE POLICY "super_admin_all_profiles_override" ON public.profiles
  FOR ALL TO authenticated 
  USING ((current_setting('request.jwt.claims', true)::jsonb->>'email') = 'adailtong@gmail.com') 
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'email') = 'adailtong@gmail.com');

-- Affiliate Partners: Can safely check profile role OR email
DROP POLICY IF EXISTS "super_admin_all_affiliates_override" ON public.affiliate_partners;
CREATE POLICY "super_admin_all_affiliates_override" ON public.affiliate_partners
  FOR ALL TO authenticated 
  USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'email') = 'adailtong@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  ) 
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::jsonb->>'email') = 'adailtong@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Ad Campaigns: Can safely check profile role OR email
DROP POLICY IF EXISTS "super_admin_all_ads_override" ON public.ad_campaigns;
CREATE POLICY "super_admin_all_ads_override" ON public.ad_campaigns
  FOR ALL TO authenticated 
  USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'email') = 'adailtong@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  ) 
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::jsonb->>'email') = 'adailtong@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );


-- 1. Idempotent Admin Seed
DO $DO_BLOCK$
DECLARE
  v_user_id uuid;
BEGIN
  -- Try to get existing user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';

  -- If user doesn't exist, create them
  IF v_user_id IS NULL THEN
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
      '{"name": "Adailton Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Upsert the profile to ensure admin status
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton Administrador', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active';
END $DO_BLOCK$;

-- 2. Data Cleanup (Remove Demo Data)
DELETE FROM public.ad_campaigns WHERE is_demo = true;
DELETE FROM public.coupons WHERE is_demo = true;

-- 3. RLS Policy Implementation (Unrestricted Access for Admin)

-- Table: ad_campaigns
DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
CREATE POLICY "admin_all_ad_campaigns_override" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Table: coupons
DROP POLICY IF EXISTS "admin_all_coupons_override" ON public.coupons;
CREATE POLICY "admin_all_coupons_override" ON public.coupons
FOR ALL TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Table: profiles
DROP POLICY IF EXISTS "admin_all_profiles_override" ON public.profiles;
CREATE POLICY "admin_all_profiles_override" ON public.profiles
FOR ALL TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
);

-- Table: ad_advertisers
DROP POLICY IF EXISTS "admin_all_ad_advertisers_override" ON public.ad_advertisers;
CREATE POLICY "admin_all_ad_advertisers_override" ON public.ad_advertisers
FOR ALL TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adailtong@gmail.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

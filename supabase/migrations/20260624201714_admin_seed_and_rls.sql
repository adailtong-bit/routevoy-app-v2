DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed admin user
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
      '{"name": "Admin Routevoy", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin Routevoy', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    -- Ensure role is admin if user already exists
    UPDATE public.profiles SET role = 'admin' WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Admin Routevoy", "role": "admin"}'::jsonb WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Admin Visibility Migration
-- ad_campaigns
DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
CREATE POLICY "admin_all_ad_campaigns_override" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- coupons
DROP POLICY IF EXISTS "admin_all_coupons_override" ON public.coupons;
CREATE POLICY "admin_all_coupons_override" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
  
-- discovered_promotions
DROP POLICY IF EXISTS "admin_all_discovered_promotions_override" ON public.discovered_promotions;
CREATE POLICY "admin_all_discovered_promotions_override" ON public.discovered_promotions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

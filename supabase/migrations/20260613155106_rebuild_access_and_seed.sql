DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id uuid;
  v_franchise_record_id text := 'franchise-test-1';
BEGIN
  -- Super Admin Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Cris_2409', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET encrypted_password = crypt('Cris_2409', gen_salt('bf')) WHERE id = v_admin_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton (Super Admin)', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- Franchise Test Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'teste.franquia@routevoy.com') THEN
    v_franchise_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_franchise_id,
      '00000000-0000-0000-0000-000000000000',
      'teste.franquia@routevoy.com',
      crypt('Routevoy2026!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Franquia Teste", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_franchise_id FROM auth.users WHERE email = 'teste.franquia@routevoy.com';
    UPDATE auth.users SET encrypted_password = crypt('Routevoy2026!', gen_salt('bf')) WHERE id = v_franchise_id;
  END IF;

  -- Create dummy franchise if needed to satisfy constraints
  INSERT INTO public.franchises (id, name, email, status, owner_id)
  VALUES (v_franchise_record_id, 'Franquia Teste', 'teste.franquia@routevoy.com', 'active', v_franchise_id::text)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_franchise_id, 'teste.franquia@routevoy.com', 'Franquia Teste', 'franchisee', v_franchise_record_id)
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee', franchise_id = v_franchise_record_id;

END $$;

-- Reset and recreate RLS for ad_campaigns, coupons, merchants
DO $$
BEGIN
  -- Rebuild Ad Campaigns RLS
  DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "franchisee_manage_ad_campaigns_direct" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "manage_ad_campaigns" ON public.ad_campaigns;

  CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      OR (auth.jwt() ->> 'email' = 'adailtong@gmail.com')
    );

  CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id)
    );

  CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = ad_campaigns.company_id::text)
    );

  CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
    FOR SELECT TO public
    USING (status = 'active');

  -- Rebuild Coupons RLS
  DROP POLICY IF EXISTS "admin_all_coupons" ON public.coupons;
  DROP POLICY IF EXISTS "admin_all_coupons_override" ON public.coupons;
  DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
  DROP POLICY IF EXISTS "franchisee_manage_coupons_direct" ON public.coupons;
  DROP POLICY IF EXISTS "merchant_own_coupons" ON public.coupons;
  DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;

  CREATE POLICY "admin_all_coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      OR (auth.jwt() ->> 'email' = 'adailtong@gmail.com')
    );

  CREATE POLICY "franchisee_all_coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id)
    );

  CREATE POLICY "merchant_own_coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = coupons.company_id::text)
    );

  CREATE POLICY "public_read_coupons" ON public.coupons
    FOR SELECT TO public
    USING (status = 'active');

  -- Rebuild Merchants RLS
  DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
  DROP POLICY IF EXISTS "admin_all_merchants_override" ON public.merchants;
  DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
  DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
  DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;
  DROP POLICY IF EXISTS "ensure_hierarchy_select_merchants" ON public.merchants;

  CREATE POLICY "admin_all_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      OR (auth.jwt() ->> 'email' = 'adailtong@gmail.com')
    );

  CREATE POLICY "franchisee_all_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id)
    );

  CREATE POLICY "merchant_own_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id)
    );

  CREATE POLICY "public_read_merchants" ON public.merchants
    FOR SELECT TO public
    USING (status = 'active');
END $$;

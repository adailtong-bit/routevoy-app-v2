DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id text := 'franchise-1';
  v_merchant_id text := 'merchant-1';
  v_franchisee_user_id uuid := gen_random_uuid();
  v_merchant_user_id uuid := gen_random_uuid();
BEGIN
  -- 1. Clean up test users (delete from auth.users cascades to profiles)
  DELETE FROM auth.users WHERE email != 'adailtong@gmail.com';

  -- Ensure adailtong is super_admin
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- 2. Seed Franchises
  INSERT INTO public.franchises (id, name, email, status)
  VALUES (v_franchise_id, 'Test Franchise', 'test_franqueado@example.com', 'active')
  ON CONFLICT (id) DO UPDATE SET name = 'Test Franchise', status = 'active';

  -- 3. Seed Merchants
  INSERT INTO public.merchants (id, name, email, franchise_id, status)
  VALUES (v_merchant_id, 'Test Merchant', 'test_lojista@example.com', v_franchise_id, 'active')
  ON CONFLICT (id) DO UPDATE SET franchise_id = v_franchise_id, status = 'active';

  -- 4. Seed Franchisee User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_franchisee_user_id, '00000000-0000-0000-0000-000000000000', 'test_franqueado@example.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Test Franchisee", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_franchisee_user_id FROM auth.users WHERE email = 'test_franqueado@example.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_franchisee_user_id, 'test_franqueado@example.com', 'Test Franchisee', 'franchisee', v_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee', franchise_id = v_franchise_id;

  -- 5. Seed Merchant User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_lojista@example.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_merchant_user_id, '00000000-0000-0000-0000-000000000000', 'test_lojista@example.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Test Merchant", "role": "merchant"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_merchant_user_id FROM auth.users WHERE email = 'test_lojista@example.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id, company_id)
  VALUES (v_merchant_user_id, 'test_lojista@example.com', 'Test Merchant', 'merchant', v_franchise_id, v_merchant_id)
  ON CONFLICT (id) DO UPDATE SET role = 'merchant', franchise_id = v_franchise_id, company_id = v_merchant_id;

  -- 6. Enforce proper RLS policies based on Franchise and Merchant matrix
  
  -- RLS for ad_campaigns
  DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id ))
    WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id ));

  DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = ad_campaigns.company_id::text ))
    WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = ad_campaigns.company_id::text ));

  -- RLS for coupons
  DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
  CREATE POLICY "franchisee_all_coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id ))
    WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id ));

  DROP POLICY IF EXISTS "merchant_own_coupons" ON public.coupons;
  CREATE POLICY "merchant_own_coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = coupons.company_id::text ))
    WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = coupons.company_id::text ));

  -- RLS for merchants
  DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
  CREATE POLICY "franchisee_all_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id ))
    WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id ));

  DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
  CREATE POLICY "merchant_own_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id ))
    WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id ));

END $$;

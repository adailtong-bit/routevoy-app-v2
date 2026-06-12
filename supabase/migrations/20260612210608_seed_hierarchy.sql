DO $$
DECLARE
  v_franchise_id text := 'test-franchise-1';
  v_merchant_id text := 'test-merchant-1';
  v_affiliate_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_admin_id uuid := '00000000-0000-0000-0000-000000000002'::uuid;
  v_franchisee_id uuid := '00000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  -- 1. Create Franchise
  INSERT INTO public.franchises (id, name, email, region, status)
  VALUES (v_franchise_id, 'Test Franchise', 'franchise@test.com', 'Test Region', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Merchant
  INSERT INTO public.merchants (id, name, email, franchise_id, status)
  VALUES (v_merchant_id, 'Test Merchant', 'merchant@test.com', v_franchise_id, 'active')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Create Super Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Super Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Super Admin', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- 4. Create Franchisee User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'franchisee@test.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_franchisee_id, '00000000-0000-0000-0000-000000000000', 'franchisee@test.com',
      crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Test Franchisee", "role": "franchisee", "franchise_id": "test-franchise-1"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_franchisee_id FROM auth.users WHERE email = 'franchisee@test.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_franchisee_id, 'franchisee@test.com', 'Test Franchisee', 'franchisee', v_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee', franchise_id = v_franchise_id;

  -- 5. Create Affiliate
  INSERT INTO public.affiliate_partners (id, name, email, user_id, franchise_id, status)
  VALUES (v_affiliate_id, 'Test Affiliate', 'affiliate@test.com', NULL, v_franchise_id, 'active')
  ON CONFLICT (id) DO NOTHING;

END $$;

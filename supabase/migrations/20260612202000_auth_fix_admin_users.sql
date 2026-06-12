DO $$
DECLARE
  v_admin_id uuid;
  v_fran_id uuid;
  v_merch_id uuid;
  v_affil_id uuid;
  v_franchise_record_id text;
  v_merchant_record_id text;
  v_affiliate_record_id uuid;
  v_user record;
BEGIN
  -- 0. Fix NULL tokens globally for auth.users to prevent login crashes
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
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- 1. Ensure adailtong@gmail.com
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
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"super_admin"') WHERE id = v_admin_id;

  -- 2. Ensure test_franqueado@example.com
  SELECT id INTO v_fran_id FROM auth.users WHERE email = 'test_franqueado@example.com';
  IF v_fran_id IS NULL THEN
    v_fran_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_fran_id,
      '00000000-0000-0000-0000-000000000000',
      'test_franqueado@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Franchisee", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  SELECT id INTO v_franchise_record_id FROM public.franchises WHERE email = 'test_franqueado@example.com';
  IF v_franchise_record_id IS NULL THEN
    v_franchise_record_id := gen_random_uuid()::text;
    INSERT INTO public.franchises (id, name, email, status)
    VALUES (v_franchise_record_id, 'Test Franchise', 'test_franqueado@example.com', 'active');
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_fran_id, 'test_franqueado@example.com', 'Test Franchisee', 'franchisee', v_franchise_record_id)
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee', franchise_id = v_franchise_record_id;

  UPDATE auth.users SET raw_user_meta_data = jsonb_set(jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{franchise_id}', to_jsonb(v_franchise_record_id)), '{role}', '"franchisee"') WHERE id = v_fran_id;

  -- 3. Ensure test_lojista@example.com
  SELECT id INTO v_merch_id FROM auth.users WHERE email = 'test_lojista@example.com';
  IF v_merch_id IS NULL THEN
    v_merch_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_merch_id,
      '00000000-0000-0000-0000-000000000000',
      'test_lojista@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Merchant", "role": "merchant"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  SELECT id INTO v_merchant_record_id FROM public.merchants WHERE email = 'test_lojista@example.com';
  IF v_merchant_record_id IS NULL THEN
    v_merchant_record_id := gen_random_uuid()::text;
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_merchant_record_id, 'Test Store', 'test_lojista@example.com', 'active');
  END IF;

  INSERT INTO public.profiles (id, email, name, role, company_id)
  VALUES (v_merch_id, 'test_lojista@example.com', 'Test Merchant', 'merchant', v_merchant_record_id)
  ON CONFLICT (id) DO UPDATE SET role = 'merchant', company_id = v_merchant_record_id;

  UPDATE auth.users SET raw_user_meta_data = jsonb_set(jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{company_id}', to_jsonb(v_merchant_record_id)), '{role}', '"merchant"') WHERE id = v_merch_id;

  -- 4. Ensure test_afiliado@example.com
  SELECT id INTO v_affil_id FROM auth.users WHERE email = 'test_afiliado@example.com';
  IF v_affil_id IS NULL THEN
    v_affil_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_affil_id,
      '00000000-0000-0000-0000-000000000000',
      'test_afiliado@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Affiliate", "role": "affiliate"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  SELECT id INTO v_affiliate_record_id FROM public.affiliate_partners WHERE email = 'test_afiliado@example.com';
  IF v_affiliate_record_id IS NULL THEN
    v_affiliate_record_id := gen_random_uuid();
    INSERT INTO public.affiliate_partners (id, user_id, name, email, status)
    VALUES (v_affiliate_record_id, v_affil_id, 'Test Affiliate', 'test_afiliado@example.com', 'active');
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_affil_id, 'test_afiliado@example.com', 'Test Affiliate', 'affiliate', true)
  ON CONFLICT (id) DO UPDATE SET role = 'affiliate', is_affiliate = true;

  UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"affiliate"') WHERE id = v_affil_id;

  -- 5. Orphan profiles fix (users without a profile)
  FOR v_user IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles) LOOP
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
      v_user.id, 
      v_user.email, 
      COALESCE(v_user.raw_user_meta_data->>'name', split_part(v_user.email, '@', 1)), 
      COALESCE(v_user.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

DO $$
DECLARE
  v_user_id uuid;
  v_franchise_id text := gen_random_uuid()::text;
  v_merchant_id text := gen_random_uuid()::text;
  v_affiliate_id uuid := gen_random_uuid();
  v_existing_franchise_id text;
BEGIN
  -- 1. Create or get user adailtong@gmail.com
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Matriz"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Safety: fix null tokens for existing user due to strict GoTrue parsing rules
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
  WHERE id = v_user_id;

  -- 2. Create or get Franchise (Matriz)
  SELECT id INTO v_existing_franchise_id FROM public.franchises WHERE name = 'Matriz RouteVoy' LIMIT 1;
  
  IF v_existing_franchise_id IS NULL THEN
    INSERT INTO public.franchises (id, name, email, status, coverage_scope)
    VALUES (v_franchise_id, 'Matriz RouteVoy', 'matriz@routevoy.com', 'active', 'national')
    ON CONFLICT DO NOTHING;
  ELSE
    v_franchise_id := v_existing_franchise_id;
  END IF;

  -- 3. Profile Linkage
  INSERT INTO public.profiles (id, email, name, role, franchise_id, is_affiliate)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Admin Matriz', 'admin', v_franchise_id, false)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      franchise_id = v_franchise_id,
      is_affiliate = false;

  -- 4. Merchant (Lojista) Linkage
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE email = 'lojistateste@routevoy.com') THEN
    INSERT INTO public.merchants (id, name, email, franchise_id, status)
    VALUES (v_merchant_id, 'Lojista de Teste', 'lojistateste@routevoy.com', v_franchise_id, 'active');
  END IF;

  -- 5. Affiliate (Afiliado) Linkage
  IF NOT EXISTS (SELECT 1 FROM public.affiliate_partners WHERE email = 'test_affiliate@routevoy.com') THEN
    INSERT INTO public.affiliate_partners (id, name, email, franchise_id, status)
    VALUES (v_affiliate_id, 'Afiliado de Teste', 'test_affiliate@routevoy.com', v_franchise_id, 'active');
  END IF;

END $$;

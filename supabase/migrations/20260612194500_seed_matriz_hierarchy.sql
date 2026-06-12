DO $$
DECLARE
  v_user_id uuid;
  v_franchise_id text := 'franchise-matriz-001';
  v_merchant_id text := 'merchant-matriz-001';
  v_affiliate_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  -- 1. Create or get Master User
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Matriz Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- 2. Create Matriz Franchise
  INSERT INTO public.franchises (id, name, email, status, coverage_scope)
  VALUES (v_franchise_id, 'Franquia Matriz', 'matriz@routevoy.com', 'active', 'national')
  ON CONFLICT (id) DO UPDATE SET status = 'active';

  -- 3. Create Test Merchant linked to Matriz
  INSERT INTO public.merchants (id, name, email, franchise_id, status)
  VALUES (v_merchant_id, 'Lojista Teste Matriz', 'lojista.matriz@routevoy.com', v_franchise_id, 'active')
  ON CONFLICT (id) DO UPDATE SET franchise_id = v_franchise_id;

  -- 4. Create Test Affiliate linked to Matriz
  INSERT INTO public.affiliate_partners (id, name, email, franchise_id, status, user_id)
  VALUES (v_affiliate_id, 'Afiliado Teste Matriz', 'afiliado.matriz@routevoy.com', v_franchise_id, 'active', v_user_id)
  ON CONFLICT (email) DO UPDATE SET franchise_id = v_franchise_id, user_id = v_user_id;

  -- 5. Update Profile
  INSERT INTO public.profiles (id, email, name, role, franchise_id, company_id)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Matriz Admin', 'super_admin', v_franchise_id, v_merchant_id)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', 
      franchise_id = v_franchise_id,
      company_id = v_merchant_id;
END $$;

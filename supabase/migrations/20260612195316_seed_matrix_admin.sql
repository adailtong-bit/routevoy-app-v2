DO $$
DECLARE
  v_user_id uuid;
  v_franchise_id text := 'matriz-routevoy-001';
  v_merchant_id text := 'matriz-merchant-001';
  v_affiliate_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- 1. Insert Master Franchise
  IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE id = v_franchise_id) THEN
    INSERT INTO public.franchises (id, name, email, status, coverage_scope)
    VALUES (v_franchise_id, 'Matriz RouteVoy', 'adailtong@gmail.com', 'active', 'national');
  END IF;

  -- 2. Insert Master Merchant mapped to the Franchise
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE id = v_merchant_id) THEN
    INSERT INTO public.merchants (id, name, email, status, franchise_id)
    VALUES (v_merchant_id, 'Matriz Merchant', 'adailtong@gmail.com', 'active', v_franchise_id);
  END IF;

  -- 3. Ensure Master User exists idempotently
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
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
      '{"name": "Admin RouteVoy", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- 4. Insert Master Affiliate mapping to Master User and Franchise
  INSERT INTO public.affiliate_partners (id, user_id, name, email, status, franchise_id)
  VALUES (v_affiliate_id, v_user_id, 'Matriz Affiliate', 'adailtong@gmail.com', 'active', v_franchise_id)
  ON CONFLICT (email) DO UPDATE SET franchise_id = EXCLUDED.franchise_id, user_id = EXCLUDED.user_id;

  -- 5. Link User Profile to the Franchisee Hierarchy (Franchise + Company)
  INSERT INTO public.profiles (id, email, name, role, franchise_id, company_id)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Admin RouteVoy', 'franchisee', v_franchise_id, v_merchant_id)
  ON CONFLICT (id) DO UPDATE
  SET role = 'franchisee', franchise_id = EXCLUDED.franchise_id, company_id = EXCLUDED.company_id;

END $$;

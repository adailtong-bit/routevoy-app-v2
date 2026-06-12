DO $DO$
DECLARE
  v_admin_user_id uuid;
  v_franchise_id text := 'franchise-admin-test';
  v_merchant_id text := 'merchant-admin-test';
  v_affiliate_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
BEGIN
  -- 1. Create or get super admin user adailtong@gmail.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('RouteVoyAdmin2026!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    
    -- Ensure token columns are not NULL for this user to prevent GoTrue 500 errors
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
    WHERE email = 'adailtong@gmail.com';
  END IF;

  -- 2. Upsert profile for super admin
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- 3. Seed Hierarchy Data
  -- Insert Master Franchise
  INSERT INTO public.franchises (id, name, email, region, status, owner_id, coverage_scope)
  VALUES (
    v_franchise_id,
    'Master Franchise Admin',
    'master@routevoy.com',
    'Global',
    'active',
    v_admin_user_id::text,
    'national'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Merchant linked to Franchise
  INSERT INTO public.merchants (id, name, email, franchise_id, status, region)
  VALUES (
    v_merchant_id,
    'Test Merchant Linked',
    'merchant@routevoy.com',
    v_franchise_id,
    'active',
    'Global'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Affiliate linked to Franchise
  INSERT INTO public.affiliate_partners (id, name, email, franchise_id, status, commission_model, commission_rate)
  VALUES (
    v_affiliate_id,
    'Test Affiliate Linked',
    'affiliate@routevoy.com',
    v_franchise_id,
    'active',
    'percentage',
    30.0
  )
  ON CONFLICT (id) DO NOTHING;

END $DO$;

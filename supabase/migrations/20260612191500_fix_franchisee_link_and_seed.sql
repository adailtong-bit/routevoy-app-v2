DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id text := 'franchise-0002';
  v_merchant_1_id text := 'merchant-0005';
  v_merchant_2_id text := 'merchant-0006';
  v_affiliate_1_id uuid := gen_random_uuid();
  v_affiliate_2_id uuid := gen_random_uuid();
BEGIN
  -- 1. Ensure the user adailtong@gmail.com exists and correctly configured
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    -- Fix nulls in auth.users for existing user to avoid 500 errors
    UPDATE auth.users
    SET
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      phone = NULL
    WHERE id = v_admin_id;
  END IF;

  -- 2. Data Cleanup: Remove inconsistent test records safely
  -- Keep franchise-0002 clear of old cruft
  DELETE FROM public.merchants WHERE franchise_id = v_franchise_id AND id NOT IN (v_merchant_1_id, v_merchant_2_id);
  DELETE FROM public.affiliate_partners WHERE franchise_id = v_franchise_id;
  
  -- 3. Create/Update Franchise 0002
  INSERT INTO public.franchises (id, name, email, status, region)
  VALUES (v_franchise_id, 'Franchise 0002', 'franchise0002@routevoy.com', 'active', 'Global')
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;

  -- 4. Assign profile for adailtong@gmail.com as Franchisee linked to Franchise 0002
  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'franchisee', v_franchise_id)
  ON CONFLICT (id) DO UPDATE
  SET role = 'franchisee',
      franchise_id = v_franchise_id;

  -- 5. Insert Merchant 0005 & 0006 linked to Franchise 0002
  INSERT INTO public.merchants (id, name, email, franchise_id, status)
  VALUES 
    (v_merchant_1_id, 'Merchant 0005', 'merchant0005@routevoy.com', v_franchise_id, 'active'),
    (v_merchant_2_id, 'Merchant 0006', 'merchant0006@routevoy.com', v_franchise_id, 'active')
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    franchise_id = EXCLUDED.franchise_id;

  -- 6. Insert Affiliates 0007 & 0008 linked to Franchise 0002
  INSERT INTO public.affiliate_partners (id, name, email, franchise_id, status)
  VALUES 
    (v_affiliate_1_id, 'Affiliate 0007', 'affiliate0007@routevoy.com', v_franchise_id, 'active'),
    (v_affiliate_2_id, 'Affiliate 0008', 'affiliate0008@routevoy.com', v_franchise_id, 'active')
  ON CONFLICT (email) DO UPDATE SET 
    franchise_id = EXCLUDED.franchise_id,
    name = EXCLUDED.name;

END $$;

DO $block$
DECLARE
  v_user_id uuid;
  v_company_id text := 'company-seed-example';
  v_hash text := 'prelaunch_summer_test_seed';
BEGIN
  -- Insert user securely with ON CONFLICT DO NOTHING using existence check
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
      '{"name": "Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.merchants (id, name, email)
  VALUES (v_company_id, 'Sample Store', 'store@example.com')
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE unique_hash = v_hash) THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, engagement_threshold, reward_type, reward_description, 
      status, environment, promotion_model, company_id, unique_hash
    )
    VALUES (
      gen_random_uuid(),
      'Summer Campaign - Test Example',
      'Refer friends to unlock an exclusive summer treat!',
      10,
      'Free Item',
      'Summer Special Ice Cream',
      'published',
      'production',
      'pre_launch',
      v_company_id,
      v_hash
    );
  END IF;

END $block$;

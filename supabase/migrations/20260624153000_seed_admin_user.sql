DO $$
BEGIN
  -- Insert seed user into auth.users if they don't already exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role, confirmation_token, recovery_token, 
      email_change_token_new, email_change, email_change_token_current, 
      phone_change, phone_change_token, reauthentication_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Adailton"}',
      false,
      'authenticated',
      '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Ensure a corresponding profile exists, updating it if necessary
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES ('00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', 'Adailton', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    status = 'active';
END $$;

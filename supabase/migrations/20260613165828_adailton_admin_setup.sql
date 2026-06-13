DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert or capture adailtong@gmail.com
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  -- Ensure profile exists and is admin
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- Ensure all profiles have a valid role assigned
  UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = '';
END $$;

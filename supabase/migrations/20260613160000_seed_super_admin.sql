DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed Super Admin user (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_vip)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'super_admin', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Ensure existing user has super_admin role
    UPDATE public.profiles 
    SET role = 'super_admin', is_vip = true 
    WHERE email = 'adailtong@gmail.com' AND role != 'super_admin';
    
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"super_admin"')
    WHERE email = 'adailtong@gmail.com' AND raw_user_meta_data->>'role' != 'super_admin';
  END IF;
END $$;

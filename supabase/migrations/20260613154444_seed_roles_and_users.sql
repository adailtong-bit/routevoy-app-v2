DO $$
DECLARE
  super_admin_id uuid;
  franchisee_id uuid;
BEGIN
  -- 1. Create Super Admin: adailtong@gmail.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    super_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      super_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Cris_2409', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO super_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users 
    SET raw_user_meta_data = '{"name": "Adailton", "role": "super_admin"}'::jsonb 
    WHERE id = super_admin_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (super_admin_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- 2. Create Franchisee: teste.franquia@routevoy.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'teste.franquia@routevoy.com') THEN
    franchisee_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      franchisee_id,
      '00000000-0000-0000-0000-000000000000',
      'teste.franquia@routevoy.com',
      crypt('Routevoy2026!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Franquia Teste", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO franchisee_id FROM auth.users WHERE email = 'teste.franquia@routevoy.com';
    UPDATE auth.users 
    SET raw_user_meta_data = '{"name": "Franquia Teste", "role": "franchisee"}'::jsonb 
    WHERE id = franchisee_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (franchisee_id, 'teste.franquia@routevoy.com', 'Franquia Teste', 'franchisee')
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee';

END $$;

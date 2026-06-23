DO $$
BEGIN
  -- Add business size and fixed fee columns to merchants table
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS business_size TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS monthly_fixed_fee NUMERIC(10,2) DEFAULT 0.00;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS fee_valid_from TIMESTAMPTZ;
END $$;

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Seed adailtong@gmail.com user
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton G', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

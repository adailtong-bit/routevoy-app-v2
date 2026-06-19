DO $$
DECLARE
  seed_user_id uuid;
BEGIN
  -- Alter profiles default status
  ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';
  
  -- Insert or ensure adailtong@gmail.com exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    seed_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      seed_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_affiliate, status)
    VALUES (seed_user_id, 'adailtong@gmail.com', 'Adailton G', 'super_admin', false, 'active')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Just update role to super_admin to be sure
    UPDATE public.profiles 
    SET role = 'super_admin', status = 'active' 
    WHERE email = 'adailtong@gmail.com';
  END IF;
  
  -- Recreate RLS on profiles to make sure it's valid
  DROP POLICY IF EXISTS "authenticated_select_profiles" ON public.profiles;
  CREATE POLICY "authenticated_select_profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);
    
END $$;

-- 1. Enable realtime replication for profiles table to allow real-time status updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- 2. Ensure RLS Policy allowing users to view their own profile without restrictions
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);
END $$;

-- 3. Seed test account to verify real-time status toggling
DO $$
DECLARE
  seed_user_id uuid;
BEGIN
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

    INSERT INTO public.profiles (id, email, name, role, is_affiliate, status, city, state, country, phone, tax_id)
    VALUES (seed_user_id, 'adailtong@gmail.com', 'Adailton G', 'affiliate', true, 'approved', 'Orlando', 'Florida', 'USA', '1234567890', '00000000000')
    ON CONFLICT (id) DO UPDATE SET 
      role = 'affiliate', 
      is_affiliate = true, 
      status = 'approved',
      city = COALESCE(public.profiles.city, 'Orlando'),
      state = COALESCE(public.profiles.state, 'Florida'),
      country = COALESCE(public.profiles.country, 'USA'),
      phone = COALESCE(public.profiles.phone, '1234567890'),
      tax_id = COALESCE(public.profiles.tax_id, '00000000000');
  ELSE
    SELECT id INTO seed_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    
    INSERT INTO public.profiles (id, email, name, role, is_affiliate, status, city, state, country, phone, tax_id)
    VALUES (seed_user_id, 'adailtong@gmail.com', 'Adailton G', 'affiliate', true, 'approved', 'Orlando', 'Florida', 'USA', '1234567890', '00000000000')
    ON CONFLICT (id) DO UPDATE SET 
      role = 'affiliate', 
      is_affiliate = true, 
      status = 'approved',
      city = COALESCE(public.profiles.city, 'Orlando'),
      state = COALESCE(public.profiles.state, 'Florida'),
      country = COALESCE(public.profiles.country, 'USA'),
      phone = COALESCE(public.profiles.phone, '1234567890'),
      tax_id = COALESCE(public.profiles.tax_id, '00000000000');
  END IF;
END $$;

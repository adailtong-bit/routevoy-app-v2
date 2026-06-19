-- Seed Master Admin user if not exists
DO $$
DECLARE
  master_id uuid;
BEGIN
  SELECT id INTO master_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  IF master_id IS NULL THEN
    master_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('RouteVoy@Master123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton (Master)"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists and has role 'admin' and status 'active'
  INSERT INTO public.profiles (id, email, name, role, status, is_affiliate)
  VALUES (master_id, 'adailtong@gmail.com', 'Adailton (Master)', 'admin', 'active', false)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', status = 'active';
END $$;

-- Add RLS bypass for Master on core management tables to guarantee zero-block access
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles', 
    'merchants', 
    'franchises', 
    'affiliate_partners', 
    'ad_campaigns', 
    'discovered_promotions', 
    'coupons',
    'categories'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "master_bypass_%I" ON public.%I;', t, t);
    EXECUTE format('
      CREATE POLICY "master_bypass_%I" ON public.%I
      FOR ALL TO authenticated USING (
        auth.jwt() ->> ''email'' = ''adailtong@gmail.com''
      ) WITH CHECK (
        auth.jwt() ->> ''email'' = ''adailtong@gmail.com''
      );
    ', t, t);
  END LOOP;
END $$;

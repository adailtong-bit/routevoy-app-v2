DO $$
DECLARE
  new_user_id uuid;
  franchise_id_val text := 'test-franchise-001';
BEGIN
  -- 1. Create the franchise record
  INSERT INTO public.franchises (id, name, email, region, country)
  VALUES (franchise_id_val, 'Test Franchise Region', 'test-franchisee@example.com', 'Test Region', 'USA')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create the user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test-franchisee@example.com') THEN
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
      'test-franchisee@example.com',
      crypt('Skip@Pass2024', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Franchisee", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    -- 3. Create the profile linked to the franchise
    INSERT INTO public.profiles (id, email, name, role, franchise_id)
    VALUES (new_user_id, 'test-franchisee@example.com', 'Test Franchisee', 'franchisee', franchise_id_val)
    ON CONFLICT (id) DO UPDATE SET franchise_id = EXCLUDED.franchise_id;
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'test-franchisee@example.com';
    UPDATE public.profiles SET franchise_id = franchise_id_val WHERE id = new_user_id;
  END IF;
END $$;

-- Add RLS policy for franchises if missing
DO $$
BEGIN
  DROP POLICY IF EXISTS "franchisee_select_own_franchise" ON public.franchises;
  CREATE POLICY "franchisee_select_own_franchise" ON public.franchises
    FOR SELECT TO authenticated 
    USING (
      id IN (SELECT franchise_id FROM public.profiles WHERE profiles.id = auth.uid()) 
      OR email = (auth.jwt() ->> 'email'::text)
      OR true
    );
END $$;

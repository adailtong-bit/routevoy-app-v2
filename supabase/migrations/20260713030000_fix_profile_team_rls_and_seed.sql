-- Ensure RLS policies on profiles for own-profile SELECT and team visibility
-- Also seed adailtong@gmail.com with Skip@Pass and valid company_id

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "auth_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "team_select_same_company" ON public.profiles;

-- SELECT: users can read their own profile + profiles sharing the same company_id
CREATE POLICY "auth_read_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (
      company_id IS NOT NULL
      AND company_id = (
        SELECT p.company_id FROM public.profiles p
        WHERE p.id = auth.uid() LIMIT 1
      )
    )
  );

-- UPDATE: users can update their own profile
DROP POLICY IF EXISTS "auth_update_own_profile" ON public.profiles;
CREATE POLICY "auth_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Seed user adailtong@gmail.com with Skip@Pass and valid company_id
DO $$
DECLARE
  v_user_id uuid;
  v_merchant_id text;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
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
      '{"name": "Adailton", "role": "manager"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Skip@Pass', gen_salt('bf'))
    WHERE id = v_user_id;
  END IF;

  -- Ensure a merchant record exists for this user
  SELECT id INTO v_merchant_id FROM public.merchants WHERE email = 'adailtong@gmail.com' LIMIT 1;
  IF v_merchant_id IS NULL THEN
    v_merchant_id := gen_random_uuid()::text;
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_merchant_id, 'Routevoy Store', 'adailtong@gmail.com', 'active')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Upsert profile: ensure company_id is set, do not downgrade existing role
  INSERT INTO public.profiles (id, email, name, role, company_id, status)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'manager', v_merchant_id, 'active')
  ON CONFLICT (id) DO UPDATE SET
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id);
END $$;

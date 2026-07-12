-- Ensure RLS policies for team management (profiles + user_invitations)
-- Also seed adailtong@gmail.com with merchant link

DO $$
BEGIN
  -- Profiles SELECT: own profile + same company_id + admins (non-recursive)
  DROP POLICY IF EXISTS "auth_read_profiles" ON public.profiles;
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
      OR (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'super_admin')
        )
      )
    );

  -- Profiles UPDATE: own profile + managers in same company
  DROP POLICY IF EXISTS "auth_update_own_profile" ON public.profiles;
  CREATE POLICY "auth_update_own_profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid()
      OR (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin')
          AND p.company_id IS NOT NULL
          AND p.company_id = profiles.company_id
        )
      )
    )
    WITH CHECK (
      id = auth.uid()
      OR (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin')
          AND p.company_id IS NOT NULL
          AND p.company_id = profiles.company_id
        )
      )
    );

  -- user_invitations SELECT: same company_id + admins
  DROP POLICY IF EXISTS "company_select_invitations" ON public.user_invitations;
  CREATE POLICY "company_select_invitations" ON public.user_invitations
    FOR SELECT TO authenticated
    USING (
      (
        company_id IS NOT NULL
        AND company_id = (
          SELECT p.company_id FROM public.profiles p
          WHERE p.id = auth.uid() LIMIT 1
        )
      )
      OR (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'super_admin')
        )
      )
    );

  -- user_invitations INSERT: same company_id + admins
  DROP POLICY IF EXISTS "company_insert_invitations" ON public.user_invitations;
  CREATE POLICY "company_insert_invitations" ON public.user_invitations
    FOR INSERT TO authenticated
    WITH CHECK (
      (
        company_id IS NOT NULL
        AND company_id = (
          SELECT p.company_id FROM public.profiles p
          WHERE p.id = auth.uid() LIMIT 1
        )
      )
      OR (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'super_admin')
        )
      )
    );
END $$;

-- Seed adailtong@gmail.com with Skip@Pass and merchant link
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
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  SELECT id INTO v_merchant_id FROM public.merchants WHERE email = 'adailtong@gmail.com' LIMIT 1;
  IF v_merchant_id IS NULL THEN
    v_merchant_id := gen_random_uuid()::text;
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_merchant_id, 'Routevoy Store', 'adailtong@gmail.com', 'active')
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, company_id, status)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'admin', v_merchant_id, 'active')
  ON CONFLICT (id) DO UPDATE SET
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    role = CASE
      WHEN public.profiles.role IN ('admin', 'super_admin') THEN public.profiles.role
      ELSE 'admin'
    END,
    status = 'active';
END $$;

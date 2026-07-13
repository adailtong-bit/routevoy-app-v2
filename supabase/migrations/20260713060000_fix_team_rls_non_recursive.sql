-- Create SECURITY DEFINER helper functions to avoid RLS recursion on profiles
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop ALL existing profiles policies to eliminate recursion
DROP POLICY IF EXISTS "auth_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "auth_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_delete_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "merchant_select_company_profiles" ON public.profiles;
DROP POLICY IF EXISTS "merchant_select_team_profiles" ON public.profiles;
DROP POLICY IF EXISTS "merchant_update_company_profiles" ON public.profiles;
DROP POLICY IF EXISTS "merchant_delete_company_profiles" ON public.profiles;

-- Create clean, non-recursive profiles SELECT policy
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: own profile or company managers
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_company" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin')
    AND public.get_my_company_id() IS NOT NULL
    AND company_id = public.get_my_company_id()
  )
  WITH CHECK (
    public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin')
    AND public.get_my_company_id() IS NOT NULL
    AND company_id = public.get_my_company_id()
  );

-- DELETE: company managers can remove profiles from their company
CREATE POLICY "profiles_delete_company" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin')
    AND public.get_my_company_id() IS NOT NULL
    AND company_id = public.get_my_company_id()
  );

-- Drop and recreate user_invitations policies (non-recursive via helper functions)
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Anyone can read pending invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Merchants and Franchisees can insert invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "company_insert_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "company_select_invitations" ON public.user_invitations;

-- SELECT: same company or admin
CREATE POLICY "invitations_select_company" ON public.user_invitations
  FOR SELECT TO authenticated
  USING (
    (company_id IS NOT NULL AND company_id = public.get_my_company_id())
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

-- SELECT: public can read pending invitations (for acceptance flow)
CREATE POLICY "invitations_select_pending_public" ON public.user_invitations
  FOR SELECT TO public
  USING (status = 'pending');

-- INSERT: same company managers or admins
CREATE POLICY "invitations_insert_company" ON public.user_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    (company_id IS NOT NULL AND company_id = public.get_my_company_id()
     AND public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin'))
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

-- DELETE: same company managers or admins
CREATE POLICY "invitations_delete_company" ON public.user_invitations
  FOR DELETE TO authenticated
  USING (
    (company_id IS NOT NULL AND company_id = public.get_my_company_id()
     AND public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin'))
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

-- UPDATE: same company managers or admins
CREATE POLICY "invitations_update_company" ON public.user_invitations
  FOR UPDATE TO authenticated
  USING (
    (company_id IS NOT NULL AND company_id = public.get_my_company_id()
     AND public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin'))
    OR public.get_my_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    (company_id IS NOT NULL AND company_id = public.get_my_company_id()
     AND public.get_my_role() IN ('merchant', 'shopkeeper', 'manager', 'supervisor', 'admin', 'super_admin'))
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

-- Seed: ensure adailtong@gmail.com has role 'merchant' and a valid company_id
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
      '{"name": "Adailton", "role": "merchant"}',
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
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'merchant', v_merchant_id, 'active')
  ON CONFLICT (id) DO UPDATE SET
    company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id),
    role = 'merchant',
    status = 'active';
END $$;

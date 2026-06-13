-- 1. Drop existing recursive policies on profiles dynamically to ensure idempotency
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Create optimized non-recursive policies for profiles relying on auth.uid() and auth.jwt()
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'super_admin' OR
    (auth.jwt() ->> 'role') = 'franchisee'
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = id OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    auth.uid() = id OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'super_admin'
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    auth.uid() = id OR
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() ->> 'role') = 'super_admin'
  );

-- 3. Database Integrity: Add geographic columns to franchises and merchants
ALTER TABLE public.franchises
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS address_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS address_lng NUMERIC;

ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS address_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS address_lng NUMERIC;

-- 4. Seed Data: Ensure admin user exists without NULLs in token columns
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (admin_id, 'adailtong@gmail.com', 'Adailton', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

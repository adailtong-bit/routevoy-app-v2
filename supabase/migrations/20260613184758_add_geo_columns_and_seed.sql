DO $$
DECLARE
  admin_uid UUID := gen_random_uuid();
BEGIN
  -- add to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_street TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_number TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_city TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_state TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_zip TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_country TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude NUMERIC;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude NUMERIC;

  -- add to companies
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_street TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_number TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_city TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_state TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_zip TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address_country TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS latitude NUMERIC;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS longitude NUMERIC;

  -- add to franchises
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_street TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_number TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_city TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_state TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_zip TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_country TEXT;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS latitude NUMERIC;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS longitude NUMERIC;

  -- add to affiliate_partners
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_street TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_number TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_city TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_state TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_zip TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_country TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS latitude NUMERIC;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS longitude NUMERIC;

  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (admin_uid, 'adailtong@gmail.com', 'Admin Master', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

END $$;

-- Ensure RLS is active and correct
DROP POLICY IF EXISTS "authenticated_select_companies" ON public.companies;
CREATE POLICY "authenticated_select_companies" ON public.companies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_companies" ON public.companies;
CREATE POLICY "authenticated_insert_companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_companies" ON public.companies;
CREATE POLICY "authenticated_update_companies" ON public.companies FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_franchises" ON public.franchises;
CREATE POLICY "authenticated_select_franchises" ON public.franchises FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_franchises" ON public.franchises;
CREATE POLICY "authenticated_insert_franchises" ON public.franchises FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_franchises" ON public.franchises;
CREATE POLICY "authenticated_update_franchises" ON public.franchises FOR UPDATE TO authenticated USING (true);

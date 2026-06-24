-- Fix affiliate_partners RLS policies by avoiding queries to auth.users
DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "admin_insert_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_insert_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own_update" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_update_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "auth_read_own_affiliate" ON public.affiliate_partners;
DROP POLICY IF EXISTS "authenticated_insert_affiliate_partners" ON public.affiliate_partners;
DROP POLICY IF EXISTS "authenticated_update_affiliate_partners" ON public.affiliate_partners;
DROP POLICY IF EXISTS "ensure_hierarchy_select_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_all" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "master_bypass_affiliate_partners" ON public.affiliate_partners;

-- Create safe, optimized policies using JWT metadata and profiles, avoiding auth.users join
CREATE POLICY "affiliate_partners_select" ON public.affiliate_partners
FOR SELECT USING (
  user_id = auth.uid() OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'admin') OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'franchisee'))
);

CREATE POLICY "affiliate_partners_insert" ON public.affiliate_partners
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'admin') OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE POLICY "affiliate_partners_update" ON public.affiliate_partners
FOR UPDATE USING (
  user_id = auth.uid() OR
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'admin') OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE POLICY "affiliate_partners_delete" ON public.affiliate_partners
FOR DELETE USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'admin') OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Profiles policies cleanup to ensure it never restricts public visibility if used in joins improperly
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

-- Seed initial super admin user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    -- If user exists, ensure they have the super_admin role in metadata and profile
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb
    WHERE email = 'adailtong@gmail.com';
    
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

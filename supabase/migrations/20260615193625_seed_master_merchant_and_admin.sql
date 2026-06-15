-- Create basic RLS policies for merchants to ensure data access works
DROP POLICY IF EXISTS "authenticated_select_merchants" ON public.merchants;
CREATE POLICY "authenticated_select_merchants" ON public.merchants
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_merchants" ON public.merchants;
CREATE POLICY "authenticated_update_merchants" ON public.merchants
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_merchants" ON public.merchants;
CREATE POLICY "authenticated_insert_merchants" ON public.merchants
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_merchants" ON public.merchants;
CREATE POLICY "authenticated_delete_merchants" ON public.merchants
  FOR DELETE TO authenticated USING (true);

-- Ensure profiles policies allow admins to operate
DROP POLICY IF EXISTS "authenticated_select_profiles" ON public.profiles;
CREATE POLICY "authenticated_select_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_profiles" ON public.profiles;
CREATE POLICY "authenticated_update_profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

DO $$
DECLARE
  admin_uid uuid;
  master_merchant_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  -- Create master merchant if not exists
  INSERT INTO public.merchants (id, name, email, status)
  VALUES (master_merchant_id, 'Master Merchant (Admin)', 'adailtong@gmail.com', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Check if adailtong@gmail.com exists in auth.users
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'adailtong@gmail.com';

  IF admin_uid IS NULL THEN
    admin_uid := gen_random_uuid();
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists and is updated
  INSERT INTO public.profiles (id, email, name, role, company_id)
  VALUES (admin_uid, 'adailtong@gmail.com', 'Adailton', 'super_admin', master_merchant_id)
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin', company_id = master_merchant_id;
END $$;

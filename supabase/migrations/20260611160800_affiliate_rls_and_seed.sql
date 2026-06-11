DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Recreate RLS policies safely
  DROP POLICY IF EXISTS "affiliate_partners_select" ON public.affiliate_partners;
  CREATE POLICY "affiliate_partners_select" ON public.affiliate_partners
    FOR SELECT TO authenticated 
    USING (
      user_id = auth.uid() OR 
      email = (auth.jwt() ->> 'email') OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      )
    );

  DROP POLICY IF EXISTS "affiliate_partners_insert" ON public.affiliate_partners;
  CREATE POLICY "affiliate_partners_insert" ON public.affiliate_partners
    FOR INSERT TO authenticated 
    WITH CHECK (
      user_id = auth.uid() OR 
      email = (auth.jwt() ->> 'email') OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      )
    );

  DROP POLICY IF EXISTS "affiliate_partners_update" ON public.affiliate_partners;
  CREATE POLICY "affiliate_partners_update" ON public.affiliate_partners
    FOR UPDATE TO authenticated 
    USING (
      user_id = auth.uid() OR 
      email = (auth.jwt() ->> 'email') OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      )
    )
    WITH CHECK (
      user_id = auth.uid() OR 
      email = (auth.jwt() ->> 'email') OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      )
    );

  -- Seed data for master user adailtong@gmail.com
  -- 1. Ensure user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  -- 2. Ensure profile exists and is admin
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin', true)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', is_affiliate = true;

  -- 3. Ensure affiliate partner exists and is active
  INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
  VALUES (gen_random_uuid(), v_user_id, 'adailtong@gmail.com', 'Adailton', 'active')
  ON CONFLICT (email) DO UPDATE 
  SET user_id = EXCLUDED.user_id, status = 'active';

END $$;

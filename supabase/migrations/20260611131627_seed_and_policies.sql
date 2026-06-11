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
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Ad campaigns policies fix for public
DROP POLICY IF EXISTS "Public read ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "Public read ad_campaigns" ON public.ad_campaigns
  FOR SELECT USING (true);

-- Ensure ad_invoices can be read by their owners
DROP POLICY IF EXISTS "Ad invoices merchant read" ON public.ad_invoices;
CREATE POLICY "Ad invoices merchant read" ON public.ad_invoices
  FOR SELECT TO authenticated USING (
    advertiser_id::text = auth.uid()::text OR 
    advertiser_id::text IN (SELECT id::text FROM public.merchants WHERE id::text = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()))
  );

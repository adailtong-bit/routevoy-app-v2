DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user for testing (idempotent: skip if email already exists)
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
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton G', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Drop and create policies to ensure merchants can manage their own data securely
DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
CREATE POLICY "merchant_own_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
  );

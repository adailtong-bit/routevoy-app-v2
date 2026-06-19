DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed admin user
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
      '{"name": "Adailton Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE email = 'adailtong@gmail.com';
  END IF;

  -- Seed Categories
  INSERT INTO public.categories (id, name, label, icon, status) VALUES
    (gen_random_uuid(), 'food', 'Alimentação', 'utensils', 'active'),
    (gen_random_uuid(), 'fashion', 'Moda', 'shirt', 'active'),
    (gen_random_uuid(), 'electronics', 'Eletrônicos', 'smartphone', 'active'),
    (gen_random_uuid(), 'beauty', 'Beleza e Saúde', 'scissors', 'active'),
    (gen_random_uuid(), 'services', 'Serviços', 'wrench', 'active'),
    (gen_random_uuid(), 'market', 'Mercado', 'shopping-cart', 'active'),
    (gen_random_uuid(), 'leisure', 'Lazer', 'ticket', 'active')
  ON CONFLICT (name) DO NOTHING;

END $$;

DROP POLICY IF EXISTS "admin_all_coupons" ON public.coupons;
CREATE POLICY "admin_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

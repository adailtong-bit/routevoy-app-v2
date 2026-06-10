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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;

  -- Create storage bucket if missing
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('promotions', 'promotions', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- RLS policies for categories
DROP POLICY IF EXISTS "auth_read_categories" ON public.categories;
CREATE POLICY "auth_read_categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_categories" ON public.categories;
CREATE POLICY "admin_all_categories" ON public.categories
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- RLS policies for discovered_promotions
DROP POLICY IF EXISTS "auth_all_promotions" ON public.discovered_promotions;
CREATE POLICY "auth_all_promotions" ON public.discovered_promotions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
CREATE POLICY "public_read_promotions" ON public.discovered_promotions
  FOR SELECT TO public USING (true);

-- Setup Storage Policies for the promotions bucket
DROP POLICY IF EXISTS "Public Access to promotions bucket" ON storage.objects;
CREATE POLICY "Public Access to promotions bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Auth Insert to promotions bucket" ON storage.objects;
CREATE POLICY "Auth Insert to promotions bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Auth Update to promotions bucket" ON storage.objects;
CREATE POLICY "Auth Update to promotions bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

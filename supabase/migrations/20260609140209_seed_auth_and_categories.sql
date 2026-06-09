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
      '{"name": "Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  END IF;
END $$;

INSERT INTO public.categories (name, label, icon, status)
VALUES 
  ('eletronicos', 'Eletrônicos', 'laptop', 'active'),
  ('moda', 'Moda', 'shirt', 'active'),
  ('alimentacao', 'Alimentação', 'utensils', 'active'),
  ('viagens', 'Viagens', 'plane', 'active'),
  ('beleza', 'Beleza', 'sparkles', 'active')
ON CONFLICT (name) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('promotions', 'promotions', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'promotions');
  
  DROP POLICY IF EXISTS "Auth Uploads" ON storage.objects;
  CREATE POLICY "Auth Uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');
  
  DROP POLICY IF EXISTS "Auth Updates" ON storage.objects;
  CREATE POLICY "Auth Updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'promotions');
END $$;

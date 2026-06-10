DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert categories if table is empty
  IF NOT EXISTS (SELECT 1 FROM public.categories) THEN
    INSERT INTO public.categories (id, name, label, icon, status) VALUES 
      (gen_random_uuid(), 'food', 'Food', 'Utensils', 'active'),
      (gen_random_uuid(), 'fashion', 'Fashion', 'Shirt', 'active'),
      (gen_random_uuid(), 'services', 'Services', 'Briefcase', 'active'),
      (gen_random_uuid(), 'electronics', 'Electronics', 'Smartphone', 'active');
  END IF;

  -- Seed user
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
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create Storage Bucket for promotions if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
DROP POLICY IF EXISTS "Public access to promotions bucket" ON storage.objects;
CREATE POLICY "Public access to promotions bucket" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Auth insert to promotions bucket" ON storage.objects;
CREATE POLICY "Auth insert to promotions bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Auth update to promotions bucket" ON storage.objects;
CREATE POLICY "Auth update to promotions bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

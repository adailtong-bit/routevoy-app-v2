DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent)
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
      NULL,  -- phone MUST be NULL to avoid unique constraint violations
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Create storage bucket for campaigns if not exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('campaigns', 'campaigns', true) 
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Setup storage policies safely for the campaigns bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'campaigns');

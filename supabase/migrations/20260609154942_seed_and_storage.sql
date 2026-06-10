DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  END IF;
END $$;

-- Seed categories idempotently
INSERT INTO public.categories (id, name, label, icon, status) VALUES
  (gen_random_uuid(), 'electronics', 'Electronics', 'Smartphone', 'active'),
  (gen_random_uuid(), 'fashion', 'Fashion', 'Shirt', 'active'),
  (gen_random_uuid(), 'food', 'Food & Dining', 'Utensils', 'active'),
  (gen_random_uuid(), 'travel', 'Travel', 'Briefcase', 'active'),
  (gen_random_uuid(), 'entertainment', 'Entertainment', 'Ticket', 'active'),
  (gen_random_uuid(), 'retail', 'Retail', 'ShoppingCart', 'active'),
  (gen_random_uuid(), 'services', 'Services', 'Sparkles', 'active'),
  (gen_random_uuid(), 'other', 'Other', 'CircleEllipsis', 'active')
ON CONFLICT (name) DO NOTHING;

-- Storage buckets configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate storage policies safely
DROP POLICY IF EXISTS "Public Access Promotions" ON storage.objects;
CREATE POLICY "Public Access Promotions" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Auth Insert Promotions" ON storage.objects;
CREATE POLICY "Auth Insert Promotions" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'promotions' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Promotions" ON storage.objects;
CREATE POLICY "Auth Update Promotions" ON storage.objects
  FOR UPDATE USING (bucket_id = 'promotions' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Promotions" ON storage.objects;
CREATE POLICY "Auth Delete Promotions" ON storage.objects
  FOR DELETE USING (bucket_id = 'promotions' AND auth.role() = 'authenticated');

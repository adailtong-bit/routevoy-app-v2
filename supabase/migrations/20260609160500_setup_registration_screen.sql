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
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Categories Seed
INSERT INTO public.categories (name, label, status) VALUES 
('electronics', 'Electronics', 'active'),
('fashion', 'Fashion', 'active'),
('food', 'Food', 'active'),
('travel', 'Travel', 'active')
ON CONFLICT (name) DO NOTHING;

-- RLS discovered_promotions
DROP POLICY IF EXISTS "authenticated_select_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_select_discovered_promotions" ON public.discovered_promotions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_insert_discovered_promotions" ON public.discovered_promotions
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS categories
DROP POLICY IF EXISTS "authenticated_select_categories" ON public.categories;
CREATE POLICY "authenticated_select_categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_categories" ON public.categories;
CREATE POLICY "authenticated_insert_categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (true);

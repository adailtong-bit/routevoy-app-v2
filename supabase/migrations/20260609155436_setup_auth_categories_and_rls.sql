DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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

-- Insert sample categories if they don't exist
INSERT INTO public.categories (id, name, label, status, icon) VALUES
  (gen_random_uuid(), 'food', 'Food', 'active', 'Utensils'),
  (gen_random_uuid(), 'travel', 'Travel', 'active', 'Briefcase'),
  (gen_random_uuid(), 'fashion', 'Fashion', 'active', 'Shirt'),
  (gen_random_uuid(), 'electronics', 'Electronics', 'active', 'Smartphone')
ON CONFLICT (name) DO NOTHING;

-- Policies for ad_campaigns
DROP POLICY IF EXISTS "auth_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_insert_ad_campaigns" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_update_ad_campaigns" ON public.ad_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns FOR SELECT TO public USING (true);

-- Policies for discovered_promotions
DROP POLICY IF EXISTS "auth_insert_promotions" ON public.discovered_promotions;
CREATE POLICY "auth_insert_promotions" ON public.discovered_promotions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_promotions" ON public.discovered_promotions;
CREATE POLICY "auth_update_promotions" ON public.discovered_promotions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
CREATE POLICY "public_read_promotions" ON public.discovered_promotions FOR SELECT TO public USING (true);

-- Policies for categories
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT TO public USING (true);

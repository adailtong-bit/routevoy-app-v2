DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user 1 (idempotent: skip if email already exists)
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
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Fix RLS for ad_campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_insert_ad_campaigns" ON public.ad_campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "manage_own_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "manage_own_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access on categories" ON public.categories;
CREATE POLICY "Allow authenticated read access on categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories" ON public.categories
  FOR SELECT TO public USING (true);

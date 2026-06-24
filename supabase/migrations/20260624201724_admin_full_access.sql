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
      '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    -- Ensure existing user has admin profile
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE email = 'adailtong@gmail.com';
    
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
    WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Make sure admin policies cover all ops for ad_campaigns
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  );

-- Admin policies for coupons
DROP POLICY IF EXISTS "admin_all_coupons" ON public.coupons;
CREATE POLICY "admin_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  );

-- Admin policies for discovered_promotions
DROP POLICY IF EXISTS "admin_manage_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "admin_manage_discovered_promotions" ON public.discovered_promotions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
    OR auth.jwt()->>'email' = 'adailtong@gmail.com'
  );

-- Replace "Seed Coupon" and grayscale images with better defaults
UPDATE public.ad_campaigns
SET 
  title = REPLACE(title, 'Seed Coupon', 'Featured Offer'),
  image = CASE 
    WHEN image LIKE '%q=deal&color=gray%' THEN 'https://img.usecurling.com/p/400/300?q=shopping'
    ELSE image
  END
WHERE title LIKE 'Seed Coupon%' OR image LIKE '%q=deal&color=gray%';

UPDATE public.coupons
SET 
  title = REPLACE(title, 'Seed Coupon', 'Featured Deal'),
  image_url = CASE 
    WHEN image_url LIKE '%q=deal&color=gray%' THEN 'https://img.usecurling.com/p/400/300?q=discount'
    ELSE image_url
  END
WHERE title LIKE 'Seed Coupon%' OR image_url LIKE '%q=deal&color=gray%';

UPDATE public.discovered_promotions
SET 
  title = REPLACE(title, 'Seed Coupon', 'Local Offer'),
  image_url = CASE 
    WHEN image_url LIKE '%q=deal&color=gray%' THEN 'https://img.usecurling.com/p/400/300?q=retail'
    ELSE image_url
  END
WHERE title LIKE 'Seed Coupon%' OR image_url LIKE '%q=deal&color=gray%';

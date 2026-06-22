-- Seed Test Campaign for Discovered Promotions
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_affiliate_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users (idempotent via unique email check)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test.affiliate@routevoy.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test.affiliate@routevoy.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Affiliate"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, name, role, is_affiliate, status)
    VALUES (v_user_id, 'test.affiliate@routevoy.com', 'Test Affiliate', 'affiliate', true, 'approved')
    ON CONFLICT (id) DO NOTHING;

    -- Insert into affiliate_partners
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
    VALUES (v_affiliate_id, v_user_id, 'test.affiliate@routevoy.com', 'Test Affiliate Partner', 'approved')
    ON CONFLICT (email) DO NOTHING;
  ELSE
    SELECT id INTO v_affiliate_id FROM public.affiliate_partners WHERE email = 'test.affiliate@routevoy.com' LIMIT 1;
  END IF;

  -- Insert Test Campaign into discovered_promotions
  IF v_affiliate_id IS NOT NULL THEN
    INSERT INTO public.discovered_promotions (
      id, title, status, price, original_price, discount_percentage, is_demo, affiliate_id, environment, unique_hash, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(),
      'Test Campaign 2024',
      'captured',
      99.99,
      149.90,
      33,
      true,
      v_affiliate_id,
      'development',
      'test-campaign-2024-hash',
      NOW(),
      NOW()
    )
    ON CONFLICT (unique_hash) DO NOTHING;
  END IF;
END $$;

-- Clean up and update RLS policies for discovered_promotions
DROP POLICY IF EXISTS "auth_select_promotions" ON public.discovered_promotions;
DROP POLICY IF EXISTS "authenticated_select_discovered_promotions" ON public.discovered_promotions;
DROP POLICY IF EXISTS "public_read_discovered_promotions_new" ON public.discovered_promotions;
DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
DROP POLICY IF EXISTS "admin_all_discovered_promotions" ON public.discovered_promotions;

-- 1. Create a policy for public to read approved/active promotions
CREATE POLICY "public_read_discovered_promotions_new" ON public.discovered_promotions
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('active', 'published', 'approved'));

-- 2. Create a policy for authenticated users to read their own or all (if not deleted, unless master admin)
CREATE POLICY "authenticated_select_discovered_promotions" ON public.discovered_promotions
  FOR SELECT
  TO authenticated
  USING (
    status != 'deleted' 
    OR 
    (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()) = 'adailtong@gmail.com'
    OR 
    (SELECT role FROM public.profiles WHERE profiles.id = auth.uid()) IN ('super_admin', 'admin')
  );

-- 3. Create a policy for Admin to have full ALL access to all rows including deleted ones
CREATE POLICY "admin_all_discovered_promotions" ON public.discovered_promotions
  FOR ALL
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()) = 'adailtong@gmail.com'
    OR
    (SELECT role FROM public.profiles WHERE profiles.id = auth.uid()) IN ('super_admin', 'admin')
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()) = 'adailtong@gmail.com'
    OR
    (SELECT role FROM public.profiles WHERE profiles.id = auth.uid()) IN ('super_admin', 'admin')
  );

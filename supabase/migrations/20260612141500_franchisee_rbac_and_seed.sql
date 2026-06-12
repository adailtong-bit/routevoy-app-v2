DO $$
DECLARE
  v_franchise_id text;
  v_user_id uuid;
BEGIN
  -- 1. Create a Franchise if not exists
  v_franchise_id := 'test-franchise-id-123';
  INSERT INTO public.franchises (id, name, email, region, coverage_scope)
  VALUES (v_franchise_id, 'Test Regional Franchise', 'test_franqueado@example.com', 'Test Region', 'regional')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create user test_franqueado@example.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    v_user_id := gen_random_uuid();
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
      'test_franqueado@example.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Franqueado", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role, franchise_id)
    VALUES (v_user_id, 'test_franqueado@example.com', 'Test Franqueado', 'franchisee', v_franchise_id)
    ON CONFLICT (id) DO UPDATE SET franchise_id = v_franchise_id, role = 'franchisee';
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'test_franqueado@example.com';
    UPDATE public.profiles SET franchise_id = v_franchise_id, role = 'franchisee' WHERE id = v_user_id;
  END IF;
END $$;

-- Add franchise_id to ad_campaigns so we can easily scope it via RLS
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS franchise_id text;

-- 3. RLS for merchants
DROP POLICY IF EXISTS "franchisee_manage_merchants" ON public.merchants;
CREATE POLICY "franchisee_manage_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = merchants.franchise_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = merchants.franchise_id
    )
  );

-- 4. RLS for affiliate_partners
DROP POLICY IF EXISTS "franchisee_manage_affiliate_partners" ON public.affiliate_partners;
CREATE POLICY "franchisee_manage_affiliate_partners" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = affiliate_partners.franchise_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = affiliate_partners.franchise_id
    )
  );

-- 5. RLS for coupons
DROP POLICY IF EXISTS "franchisee_manage_coupons_direct" ON public.coupons;
CREATE POLICY "franchisee_manage_coupons_direct" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = coupons.franchise_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = coupons.franchise_id
    )
  );

-- 6. RLS for ad_campaigns
DROP POLICY IF EXISTS "franchisee_manage_ad_campaigns_direct" ON public.ad_campaigns;
CREATE POLICY "franchisee_manage_ad_campaigns_direct" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = ad_campaigns.franchise_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'franchisee' 
      AND profiles.franchise_id = ad_campaigns.franchise_id
    )
  );

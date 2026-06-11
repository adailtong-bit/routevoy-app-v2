DO $$
BEGIN
  -- 1. Add Hierarchical Links
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS franchise_id TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS franchise_id TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS franchise_id TEXT;

  -- Backfill profile franchise_id from franchises table by email if null
  UPDATE public.profiles p
  SET franchise_id = f.id
  FROM public.franchises f
  WHERE p.email = f.email AND p.franchise_id IS NULL;
END $$;

-- 2. Refactor Policies for Merchants
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'merchants' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.merchants', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "public_read_merchants" ON public.merchants FOR SELECT USING (true);

CREATE POLICY "admin_all_merchants" ON public.merchants FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_merchants" ON public.merchants FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (merchants.franchise_id = f.id OR merchants.region_id = f.region_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (merchants.franchise_id = f.id OR merchants.region_id = f.region_id)
));

CREATE POLICY "merchant_own_record" ON public.merchants FOR ALL TO authenticated
USING (id IN (SELECT company_id FROM profiles WHERE profiles.id = auth.uid()))
WITH CHECK (id IN (SELECT company_id FROM profiles WHERE profiles.id = auth.uid()));


-- 3. Refactor Policies for Affiliate Partners
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'affiliate_partners' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.affiliate_partners', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "public_read_affiliates" ON public.affiliate_partners FOR SELECT USING (true);
CREATE POLICY "anon_insert_affiliates" ON public.affiliate_partners FOR INSERT WITH CHECK(true);

CREATE POLICY "admin_all_affiliates" ON public.affiliate_partners FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_affiliates" ON public.affiliate_partners FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (affiliate_partners.franchise_id = f.id OR affiliate_partners.region_id = f.region_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (affiliate_partners.franchise_id = f.id OR affiliate_partners.region_id = f.region_id)
));

CREATE POLICY "affiliate_own_record" ON public.affiliate_partners FOR ALL TO authenticated
USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()))
WITH CHECK (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()));


-- 4. Refactor Policies for Ad Campaigns
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ad_campaigns' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_campaigns', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns FOR SELECT USING (true);

CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (ad_campaigns.company_id::text IN (SELECT m.id FROM merchants m WHERE m.franchise_id = f.id OR m.region_id = f.region_id))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (ad_campaigns.company_id::text IN (SELECT m.id FROM merchants m WHERE m.franchise_id = f.id OR m.region_id = f.region_id))
));

CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns FOR ALL TO authenticated
USING (company_id::text IN (SELECT company_id FROM profiles WHERE profiles.id = auth.uid()) OR company_id::text = auth.uid()::text)
WITH CHECK (company_id::text IN (SELECT company_id FROM profiles WHERE profiles.id = auth.uid()) OR company_id::text = auth.uid()::text);


-- 5. Refactor Policies for Coupons
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'coupons' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.coupons', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "public_read_coupons" ON public.coupons FOR SELECT USING (status = 'active');

CREATE POLICY "admin_all_coupons" ON public.coupons FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_coupons" ON public.coupons FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (coupons.franchise_id = f.id OR coupons.company_id::text IN (SELECT m.id FROM merchants m WHERE m.franchise_id = f.id OR m.region_id = f.region_id))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  LEFT JOIN franchises f ON f.id = p.franchise_id OR f.email = p.email
  WHERE p.id = auth.uid() AND p.role = 'franchisee' 
  AND (coupons.franchise_id = f.id OR coupons.company_id::text IN (SELECT m.id FROM merchants m WHERE m.franchise_id = f.id OR m.region_id = f.region_id))
));

CREATE POLICY "merchant_own_coupons" ON public.coupons FOR ALL TO authenticated
USING (company_id::text IN (SELECT company_id FROM profiles WHERE profiles.id = auth.uid()) OR user_id = auth.uid())
WITH CHECK (company_id::text IN (SELECT company_id FROM profiles WHERE profiles.id = auth.uid()) OR user_id = auth.uid());


-- 6. Seed Data (Super Admin & Hierarchy Samples)
DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id text := 'franchise-sample-123';
  v_merchant_id text := 'merchant-sample-123';
  v_affiliate_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton (Master)", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Adailton (Master)", "role": "super_admin"}' WHERE id = v_admin_id;
  END IF;

  -- Ensure profile
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton (Master)', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- Seed a sample franchise linked to admin for testing
  INSERT INTO public.franchises (id, name, email, region, region_id, coverage_scope)
  VALUES (v_franchise_id, 'Franquia Master SP', 'adailtong@gmail.com', 'São Paulo', 'SP', 'regional')
  ON CONFLICT (id) DO UPDATE SET email = 'adailtong@gmail.com';

  UPDATE public.profiles SET franchise_id = v_franchise_id WHERE id = v_admin_id;

  -- Seed sample merchant
  INSERT INTO public.merchants (id, name, email, region, region_id, franchise_id, status)
  VALUES (v_merchant_id, 'Loja Teste SP', 'loja@testesp.com', 'São Paulo', 'SP', v_franchise_id, 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Seed sample affiliate
  INSERT INTO public.affiliate_partners (id, name, email, region, region_id, franchise_id, status)
  VALUES (v_affiliate_id, 'Afiliado Teste SP', 'afiliado@testesp.com', 'São Paulo', 'SP', v_franchise_id, 'active')
  ON CONFLICT (email) DO NOTHING;

END $$;

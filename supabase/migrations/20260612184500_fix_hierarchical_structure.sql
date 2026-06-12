DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id text := 'franchise-seed-001';
  v_merchant_1_id text := 'merchant-seed-001';
  v_merchant_2_id text := 'merchant-seed-002';
  v_affiliate_1_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_affiliate_2_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  -- 1. Get admin ID
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  -- If adailtong does not exist, seed it
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton Master", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- 2. Cleanup existing test data (cascading bottom-up to avoid FK constraint violations)
  DELETE FROM public.crawler_logs;
  DELETE FROM public.crawler_sources;
  DELETE FROM public.ad_invoices;
  DELETE FROM public.ad_campaigns;
  DELETE FROM public.user_engagements;
  DELETE FROM public.coupons;
  DELETE FROM public.crm_campaigns;
  DELETE FROM public.crm_target_groups;
  DELETE FROM public.affiliate_transactions;
  DELETE FROM public.affiliate_withdrawals;
  DELETE FROM public.discovered_promotions;
  DELETE FROM public.financial_ledger;
  DELETE FROM public.affiliate_partners WHERE email != 'adailtong@gmail.com';
  DELETE FROM public.merchants;
  DELETE FROM public.commission_rules;
  DELETE FROM public.franchises;
  DELETE FROM public.profiles WHERE id != v_admin_id;

  -- 3. Seed Franchise
  INSERT INTO public.franchises (id, name, email, status, coverage_scope)
  VALUES (v_franchise_id, 'Franquia Teste Central', 'franquia@teste.com', 'active', 'national')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Update adailtong profile to link to this franchise
  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin', v_franchise_id)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', franchise_id = v_franchise_id;

  -- 4. Seed Merchants
  INSERT INTO public.merchants (id, name, email, status, franchise_id)
  VALUES 
    (v_merchant_1_id, 'Lojista Teste 1', 'lojista1@teste.com', 'active', v_franchise_id),
    (v_merchant_2_id, 'Lojista Teste 2', 'lojista2@teste.com', 'active', v_franchise_id)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Seed Affiliates
  INSERT INTO public.affiliate_partners (id, name, email, status, franchise_id)
  VALUES
    (v_affiliate_1_id, 'Afiliado Teste 1', 'afiliado1@teste.com', 'active', v_franchise_id),
    (v_affiliate_2_id, 'Afiliado Teste 2', 'afiliado2@teste.com', 'active', v_franchise_id)
  ON CONFLICT (email) DO NOTHING;

END $$;

-- Ensure RLS policies are strict and bottom-up restricted

-- Merchants
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
CREATE POLICY "franchisee_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id)
  );

DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
CREATE POLICY "merchant_own_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id)
  );

-- Affiliate Partners
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
CREATE POLICY "franchisee_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id)
  );

-- Coupons
DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
CREATE POLICY "franchisee_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id)
  );

DROP POLICY IF EXISTS "merchant_own_coupons" ON public.coupons;
CREATE POLICY "merchant_own_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = coupons.company_id::text)
    OR user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = coupons.company_id::text)
    OR user_id = auth.uid()
  );

-- Ad Campaigns
DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id)
  );

DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = ad_campaigns.company_id::text)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = ad_campaigns.company_id::text)
  );

-- Profiles
DROP POLICY IF EXISTS "franchisee_all_profiles" ON public.profiles;
CREATE POLICY "franchisee_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'franchisee' AND p.franchise_id = profiles.franchise_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'franchisee' AND p.franchise_id = profiles.franchise_id)
  );

DROP POLICY IF EXISTS "merchant_all_profiles" ON public.profiles;
CREATE POLICY "merchant_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('merchant', 'shopkeeper') AND p.company_id = profiles.company_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('merchant', 'shopkeeper') AND p.company_id = profiles.company_id)
  );

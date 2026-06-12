DO $$
DECLARE
  v_user_id uuid;
  v_franchise_id text;
  v_merchant_id_1 text;
  v_merchant_id_2 text;
  v_merchant_id_3 text;
BEGIN
  -- Add franchise_id to ad_campaigns and audit_logs if missing
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS franchise_id TEXT REFERENCES public.franchises(id);
  ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS franchise_id TEXT REFERENCES public.franchises(id);

  -- 1. Create a Franchise
  v_franchise_id := 'f0000000-0000-0000-0000-000000000001';
  INSERT INTO public.franchises (id, name, region, country, coverage_scope)
  VALUES (v_franchise_id, 'NY Region Franchise', 'New York', 'USA', 'local')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create the test franchisee user (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'test_franqueado@example.com',
      crypt('Skip@Pass2024', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}', '{"name":"Test Franchisee", "role":"franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, franchise_id)
    VALUES (v_user_id, 'test_franqueado@example.com', 'Test Franchisee', 'franchisee', v_franchise_id)
    ON CONFLICT (id) DO UPDATE SET franchise_id = v_franchise_id, role = 'franchisee';
  END IF;

  -- 3. Seed Merchants for this franchise
  v_merchant_id_1 := 'm0000000-0000-0000-0000-000000000001';
  v_merchant_id_2 := 'm0000000-0000-0000-0000-000000000002';
  v_merchant_id_3 := 'm0000000-0000-0000-0000-000000000003';

  INSERT INTO public.merchants (id, name, email, franchise_id, status, environment)
  VALUES 
    (v_merchant_id_1, 'NY Coffee Shop', 'nycoffee@example.com', v_franchise_id, 'active', 'production'),
    (v_merchant_id_2, 'Manhattan Pizza', 'mpizza@example.com', v_franchise_id, 'active', 'production'),
    (v_merchant_id_3, 'Brooklyn Gym', 'bgym@example.com', v_franchise_id, 'active', 'production')
  ON CONFLICT (id) DO NOTHING;

  -- 4. Seed Coupons for this franchise
  INSERT INTO public.coupons (id, company_id, franchise_id, title, description, discount, status, environment)
  VALUES 
    ('c0000000-0000-0000-0000-000000000001', v_merchant_id_1, v_franchise_id, '50% OFF Coffee', 'Get 50% off on your second coffee', '50%', 'active', 'production'),
    ('c0000000-0000-0000-0000-000000000002', v_merchant_id_2, v_franchise_id, 'Free Slice', 'Buy a pie, get a free slice', '100%', 'active', 'production'),
    ('c0000000-0000-0000-0000-000000000003', v_merchant_id_3, v_franchise_id, 'First Month Free', 'Sign up today and get your first month free', '100%', 'active', 'production'),
    ('c0000000-0000-0000-0000-000000000004', v_merchant_id_1, v_franchise_id, 'Bagel & Coffee', 'Morning combo for $5', 'Fixed', 'active', 'production'),
    ('c0000000-0000-0000-0000-000000000005', v_merchant_id_2, v_franchise_id, 'Family Combo', '2 Large Pizzas + Soda for $25', 'Fixed', 'active', 'production')
  ON CONFLICT (id) DO NOTHING;

  -- Seed an ad campaign and invoice to have revenue
  INSERT INTO public.ad_campaigns (id, company_id, franchise_id, title, budget, price, status, environment)
  VALUES ('a0000000-0000-0000-0000-000000000001', v_merchant_id_1, v_franchise_id, 'NY Coffee Featured Ad', 500, 500, 'active', 'production')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.ad_invoices (id, ad_id, amount, status, due_date, issue_date, reference_number, environment)
  VALUES ('i0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 500, 'paid', NOW(), NOW(), 'REF-NY-001', 'production')
  ON CONFLICT (id) DO NOTHING;

  -- Add some audit logs
  INSERT INTO public.audit_logs (id, franchise_id, action, entity_type, details)
  VALUES 
    (gen_random_uuid(), v_franchise_id, 'Campaign Created', 'coupons', 'Created Bagel & Coffee campaign'),
    (gen_random_uuid(), v_franchise_id, 'Merchant Approved', 'merchants', 'Approved NY Coffee Shop')
  ON CONFLICT DO NOTHING;

END $$;

-- Setup RLS Policies for Franchisee access using DROP/CREATE
-- Merchants
DROP POLICY IF EXISTS "Franchisee select merchants" ON public.merchants;
CREATE POLICY "Franchisee select merchants" ON public.merchants FOR SELECT TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee update merchants" ON public.merchants;
CREATE POLICY "Franchisee update merchants" ON public.merchants FOR UPDATE TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee insert merchants" ON public.merchants;
CREATE POLICY "Franchisee insert merchants" ON public.merchants FOR INSERT TO authenticated WITH CHECK (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee delete merchants" ON public.merchants;
CREATE POLICY "Franchisee delete merchants" ON public.merchants FOR DELETE TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

-- Coupons
DROP POLICY IF EXISTS "Franchisee select coupons" ON public.coupons;
CREATE POLICY "Franchisee select coupons" ON public.coupons FOR SELECT TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee update coupons" ON public.coupons;
CREATE POLICY "Franchisee update coupons" ON public.coupons FOR UPDATE TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee insert coupons" ON public.coupons;
CREATE POLICY "Franchisee insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee delete coupons" ON public.coupons;
CREATE POLICY "Franchisee delete coupons" ON public.coupons FOR DELETE TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

-- Ad Campaigns
DROP POLICY IF EXISTS "Franchisee select ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "Franchisee select ad_campaigns" ON public.ad_campaigns FOR SELECT TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee update ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "Franchisee update ad_campaigns" ON public.ad_campaigns FOR UPDATE TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee insert ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "Franchisee insert ad_campaigns" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

-- Audit Logs
DROP POLICY IF EXISTS "Franchisee select audit_logs" ON public.audit_logs;
CREATE POLICY "Franchisee select audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

-- Crawler Sources
DROP POLICY IF EXISTS "Franchisee select crawler_sources" ON public.crawler_sources;
CREATE POLICY "Franchisee select crawler_sources" ON public.crawler_sources FOR SELECT TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee update crawler_sources" ON public.crawler_sources;
CREATE POLICY "Franchisee update crawler_sources" ON public.crawler_sources FOR UPDATE TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Franchisee insert crawler_sources" ON public.crawler_sources;
CREATE POLICY "Franchisee insert crawler_sources" ON public.crawler_sources FOR INSERT TO authenticated WITH CHECK (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

-- Crawler Logs
DROP POLICY IF EXISTS "Franchisee select crawler_logs" ON public.crawler_logs;
CREATE POLICY "Franchisee select crawler_logs" ON public.crawler_logs FOR SELECT TO authenticated USING (franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()));

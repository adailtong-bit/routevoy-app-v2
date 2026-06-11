DO $$
BEGIN
  -- ==========================================
  -- 1. PROFILES POLICIES
  -- ==========================================
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "auth_update_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "franchisee_read_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "master_all_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "merchants_read_company_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;

  CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

  CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

  CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin'));

  CREATE POLICY "franchisee_read_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'franchisee'
    AND franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())
  );

  CREATE POLICY "public_read_profiles" ON public.profiles
  FOR SELECT TO public USING (true);


  -- ==========================================
  -- 2. MERCHANTS POLICIES
  -- ==========================================
  DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
  DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
  DROP POLICY IF EXISTS "merchant_own_record" ON public.merchants;
  DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;

  CREATE POLICY "admin_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  CREATE POLICY "franchisee_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'franchisee' AND franchise_id = merchants.franchise_id));

  CREATE POLICY "merchant_own_record" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = merchants.id));

  CREATE POLICY "public_read_merchants" ON public.merchants
  FOR SELECT TO public
  USING (true);


  -- ==========================================
  -- 3. AFFILIATE PARTNERS POLICIES
  -- ==========================================
  DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
  DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
  DROP POLICY IF EXISTS "affiliate_own_record" ON public.affiliate_partners;
  DROP POLICY IF EXISTS "anon_insert_affiliates" ON public.affiliate_partners;
  DROP POLICY IF EXISTS "public_read_affiliates" ON public.affiliate_partners;

  CREATE POLICY "admin_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  CREATE POLICY "franchisee_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'franchisee' AND franchise_id = affiliate_partners.franchise_id));

  CREATE POLICY "affiliate_own_record" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

  CREATE POLICY "public_read_affiliates" ON public.affiliate_partners
  FOR SELECT TO public
  USING (true);


  -- ==========================================
  -- 4. COUPONS POLICIES
  -- ==========================================
  DROP POLICY IF EXISTS "admin_all_coupons" ON public.coupons;
  DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
  DROP POLICY IF EXISTS "merchant_own_coupons" ON public.coupons;
  DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;

  CREATE POLICY "admin_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  CREATE POLICY "franchisee_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'franchisee' AND franchise_id = coupons.franchise_id));

  CREATE POLICY "merchant_own_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = coupons.company_id::text) OR user_id = auth.uid());

  CREATE POLICY "public_read_coupons" ON public.coupons
  FOR SELECT TO public
  USING (status = 'active');


  -- ==========================================
  -- 5. AD CAMPAIGNS POLICIES
  -- ==========================================
  DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;

  CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'franchisee' 
    AND ad_campaigns.company_id IN (SELECT id FROM public.merchants WHERE franchise_id = profiles.franchise_id)
  ));

  CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = ad_campaigns.company_id::text));

  CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
  FOR SELECT TO public
  USING (true);


  -- ==========================================
  -- 6. AFFILIATE TRANSACTIONS POLICIES
  -- ==========================================
  DROP POLICY IF EXISTS "auth_all_transactions" ON public.affiliate_transactions;
  DROP POLICY IF EXISTS "admin_all_transactions" ON public.affiliate_transactions;
  DROP POLICY IF EXISTS "franchisee_all_transactions" ON public.affiliate_transactions;
  DROP POLICY IF EXISTS "affiliate_own_transactions" ON public.affiliate_transactions;

  CREATE POLICY "admin_all_transactions" ON public.affiliate_transactions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  CREATE POLICY "franchisee_all_transactions" ON public.affiliate_transactions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'franchisee' 
    AND affiliate_transactions.affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE franchise_id = profiles.franchise_id
    )
  ));

  CREATE POLICY "affiliate_own_transactions" ON public.affiliate_transactions
  FOR ALL TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()));

END $$;

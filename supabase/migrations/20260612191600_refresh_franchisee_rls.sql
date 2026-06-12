-- Ad Campaigns
DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = ad_campaigns.franchise_id));

-- Coupons
DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
CREATE POLICY "franchisee_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = coupons.franchise_id));

-- Merchants
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
CREATE POLICY "franchisee_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id));

-- Affiliate Partners
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
CREATE POLICY "franchisee_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id));

DO $$
BEGIN

  -- Policies for affiliate_partners
  DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
  CREATE POLICY "admin_all_affiliates" ON public.affiliate_partners
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND role IN ('admin', 'super_admin')
      )
    );

  DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
  CREATE POLICY "franchisee_all_affiliates" ON public.affiliate_partners
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND role = 'franchisee' 
        AND profiles.franchise_id::text = affiliate_partners.franchise_id::text
      )
    );

  DROP POLICY IF EXISTS "affiliate_own_record" ON public.affiliate_partners;
  CREATE POLICY "affiliate_own_record" ON public.affiliate_partners
    FOR ALL TO authenticated
    USING (user_id::uuid = auth.uid()::uuid);


  -- Policies for merchants
  DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
  CREATE POLICY "admin_all_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND role IN ('admin', 'super_admin')
      )
    );

  DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
  CREATE POLICY "franchisee_all_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND role = 'franchisee' 
        AND profiles.franchise_id::text = merchants.franchise_id::text
      )
    );

  DROP POLICY IF EXISTS "merchant_own_record" ON public.merchants;
  CREATE POLICY "merchant_own_record" ON public.merchants
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND profiles.company_id::text = merchants.id::text
      )
    );


  -- Policies for ad_campaigns
  DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND role IN ('admin', 'super_admin')
      )
    );

  DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND role = 'franchisee' 
        AND (ad_campaigns.company_id)::text IN (
          SELECT m.id::text 
          FROM public.merchants m
          WHERE m.franchise_id::text = profiles.franchise_id::text
        )
      )
    );

  DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::uuid = auth.uid()::uuid
        AND profiles.company_id::text = (ad_campaigns.company_id)::text
      )
    );

END $$;

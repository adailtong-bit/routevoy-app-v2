DO $$
BEGIN
  -- RLS for coupons based on JWT user_metadata
  DROP POLICY IF EXISTS "franchisee_metadata_select_coupons" ON public.coupons;
  CREATE POLICY "franchisee_metadata_select_coupons" ON public.coupons
    FOR SELECT TO authenticated
    USING (
      franchise_id = (auth.jwt() -> 'user_metadata' ->> 'franchise_id')
    );

  -- RLS for ad_campaigns based on JWT user_metadata
  DROP POLICY IF EXISTS "franchisee_metadata_select_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "franchisee_metadata_select_ad_campaigns" ON public.ad_campaigns
    FOR SELECT TO authenticated
    USING (
      franchise_id = (auth.jwt() -> 'user_metadata' ->> 'franchise_id')
    );
END $$;

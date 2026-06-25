-- Fix FK for ad_invoices
DO $$
BEGIN
  ALTER TABLE public.ad_invoices DROP CONSTRAINT IF EXISTS ad_invoices_ad_id_fkey;
  ALTER TABLE public.ad_invoices ADD CONSTRAINT ad_invoices_ad_id_fkey 
    FOREIGN KEY (ad_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to update ad_invoices constraint: %', SQLERRM;
END $$;

-- Fix FK for user_engagements
DO $$
BEGIN
  ALTER TABLE public.user_engagements DROP CONSTRAINT IF EXISTS user_engagements_campaign_id_fkey;
  ALTER TABLE public.user_engagements ADD CONSTRAINT user_engagements_campaign_id_fkey 
    FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to update user_engagements constraint: %', SQLERRM;
END $$;

-- Create DELETE policies for ad_campaigns
DROP POLICY IF EXISTS "merchant_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "merchant_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated
  USING (
    company_id = public.get_auth_user_company_id()
  );

DROP POLICY IF EXISTS "franchise_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "franchise_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated
  USING (
    franchise_id = public.get_auth_user_franchise_id()
  );

DROP POLICY IF EXISTS "affiliate_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "affiliate_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated
  USING (
    affiliate_id = public.get_auth_user_affiliate_id()
  );

DROP POLICY IF EXISTS "master_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "master_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')
    )
  );

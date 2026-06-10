ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT false;

DROP POLICY IF EXISTS "manage_own_ad_invoices" ON public.ad_invoices;
DROP POLICY IF EXISTS "staff_view_ad_invoices" ON public.ad_invoices;

CREATE POLICY "manage_own_ad_invoices" ON public.ad_invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    )
    OR
    advertiser_id IN (
      SELECT id FROM public.ad_advertisers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    ad_id IN (
      SELECT id FROM public.ad_campaigns WHERE company_id = auth.uid()::text OR company_id IN (
        SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "crm_campaigns_select" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_insert" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_update" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_delete" ON public.crm_campaigns;

CREATE POLICY "crm_campaigns_select" ON public.crm_campaigns
  FOR SELECT TO authenticated
  USING (
    company_id = auth.uid()::text 
    OR franchise_id = auth.uid()::text 
    OR affiliate_id::text = auth.uid()::text 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE POLICY "crm_campaigns_insert" ON public.crm_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "crm_campaigns_update" ON public.crm_campaigns
  FOR UPDATE TO authenticated
  USING (
    company_id = auth.uid()::text 
    OR franchise_id = auth.uid()::text 
    OR affiliate_id::text = auth.uid()::text 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

CREATE POLICY "crm_campaigns_delete" ON public.crm_campaigns
  FOR DELETE TO authenticated
  USING (
    company_id = auth.uid()::text 
    OR franchise_id = auth.uid()::text 
    OR affiliate_id::text = auth.uid()::text 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

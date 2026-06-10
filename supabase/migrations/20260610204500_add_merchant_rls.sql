DO $$
BEGIN
  -- crm_campaigns policies
  DROP POLICY IF EXISTS "crm_campaigns_merchant_select" ON public.crm_campaigns;
  CREATE POLICY "crm_campaigns_merchant_select" ON public.crm_campaigns
    FOR SELECT TO authenticated
    USING (
      company_id::text = auth.uid()::text 
      OR franchise_id::text = auth.uid()::text 
      OR affiliate_id::text = auth.uid()::text 
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
      )
    );

  DROP POLICY IF EXISTS "crm_campaigns_merchant_all" ON public.crm_campaigns;
  CREATE POLICY "crm_campaigns_merchant_all" ON public.crm_campaigns
    FOR ALL TO authenticated
    USING (
      company_id::text = auth.uid()::text 
      OR franchise_id::text = auth.uid()::text 
      OR affiliate_id::text = auth.uid()::text 
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
      )
    )
    WITH CHECK (
      company_id::text = auth.uid()::text 
      OR franchise_id::text = auth.uid()::text 
      OR affiliate_id::text = auth.uid()::text 
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
      )
    );

  -- ad_invoices policies
  DROP POLICY IF EXISTS "ad_invoices_merchant_select" ON public.ad_invoices;
  CREATE POLICY "ad_invoices_merchant_select" ON public.ad_invoices
    FOR SELECT TO authenticated
    USING (
      ad_id IN (
        SELECT id FROM public.ad_campaigns WHERE company_id::text = auth.uid()::text
      )
      OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'franchisee')
      )
    );
END $$;

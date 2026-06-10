DO $$
BEGIN
  -- Allow staff members (who have company_id in profiles) to manage their company's ad_campaigns
  DROP POLICY IF EXISTS "staff_manage_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "staff_manage_ad_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
      company_id::text IN (
        SELECT company_id::text FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
      )
    )
    WITH CHECK (
      company_id::text IN (
        SELECT company_id::text FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
      )
    );

  -- Allow staff members to view invoices related to their company's campaigns
  DROP POLICY IF EXISTS "staff_view_ad_invoices" ON public.ad_invoices;
  CREATE POLICY "staff_view_ad_invoices" ON public.ad_invoices
    FOR SELECT TO authenticated
    USING (
      ad_id IN (
        SELECT id FROM public.ad_campaigns WHERE company_id::text IN (
          SELECT company_id::text FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL
        ) OR company_id::text = auth.uid()::text
      )
    );
END $$;

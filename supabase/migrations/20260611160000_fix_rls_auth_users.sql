-- Replace (SELECT email FROM auth.users WHERE id = auth.uid()) with (auth.jwt() ->> 'email')
-- because authenticated users do not have access to auth.users schema by default, causing RLS failures

DO $DO_BLOCK$
BEGIN
  -- affiliate_partners
  DROP POLICY IF EXISTS "affiliate_own_record" ON public.affiliate_partners;
  DROP POLICY IF EXISTS "affiliate_insert_own_record" ON public.affiliate_partners;

  CREATE POLICY "affiliate_own_record" ON public.affiliate_partners
    FOR ALL TO authenticated
    USING ((user_id = auth.uid()) OR (email = (auth.jwt() ->> 'email')))
    WITH CHECK ((user_id = auth.uid()) OR (email = (auth.jwt() ->> 'email')));

  -- merchants
  DROP POLICY IF EXISTS "merchant_own_record" ON public.merchants;
  CREATE POLICY "merchant_own_record" ON public.merchants
    FOR ALL TO authenticated
    USING (
      (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL))
      OR (email = (auth.jwt() ->> 'email'))
      OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
    WITH CHECK (
      (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL))
      OR (email = (auth.jwt() ->> 'email'))
      OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
    );

  -- ad_invoices
  DROP POLICY IF EXISTS "manage_own_ad_invoices" ON public.ad_invoices;
  CREATE POLICY "manage_own_ad_invoices" ON public.ad_invoices
    FOR ALL TO authenticated
    USING (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee'))) OR
      (advertiser_id IN (SELECT ad_advertisers.id FROM ad_advertisers WHERE ad_advertisers.email = (auth.jwt() ->> 'email'))) OR
      (ad_id IN (SELECT ad_campaigns.id FROM ad_campaigns WHERE ad_campaigns.company_id::text = auth.uid()::text OR ad_campaigns.company_id::text IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid())))
    );

  DROP POLICY IF EXISTS "merchant_manage_invoices" ON public.ad_invoices;
  CREATE POLICY "merchant_manage_invoices" ON public.ad_invoices
    FOR ALL TO authenticated
    USING (
      (ad_id IN (SELECT ad_campaigns.id FROM ad_campaigns WHERE ad_campaigns.company_id::text IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id IS NOT NULL) OR ad_campaigns.company_id::text = auth.uid()::text)) OR
      (advertiser_id IN (SELECT ad_advertisers.id FROM ad_advertisers WHERE ad_advertisers.email = (auth.jwt() ->> 'email')))
    );

  -- ad_pricing
  DROP POLICY IF EXISTS "admin_delete_ad_pricing" ON public.ad_pricing;
  CREATE POLICY "admin_delete_ad_pricing" ON public.ad_pricing
    FOR DELETE TO authenticated
    USING (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );

  DROP POLICY IF EXISTS "admin_insert_ad_pricing" ON public.ad_pricing;
  CREATE POLICY "admin_insert_ad_pricing" ON public.ad_pricing
    FOR INSERT TO authenticated
    WITH CHECK (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );

  DROP POLICY IF EXISTS "admin_update_ad_pricing" ON public.ad_pricing;
  CREATE POLICY "admin_update_ad_pricing" ON public.ad_pricing
    FOR UPDATE TO authenticated
    USING (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );

  -- commission_rules
  DROP POLICY IF EXISTS "admin_delete_commission_rules" ON public.commission_rules;
  CREATE POLICY "admin_delete_commission_rules" ON public.commission_rules
    FOR DELETE TO authenticated
    USING (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );

  DROP POLICY IF EXISTS "admin_insert_commission_rules" ON public.commission_rules;
  CREATE POLICY "admin_insert_commission_rules" ON public.commission_rules
    FOR INSERT TO authenticated
    WITH CHECK (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );

  DROP POLICY IF EXISTS "admin_select_commission_rules" ON public.commission_rules;
  CREATE POLICY "admin_select_commission_rules" ON public.commission_rules
    FOR SELECT TO authenticated
    USING (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );

  DROP POLICY IF EXISTS "admin_update_commission_rules" ON public.commission_rules;
  CREATE POLICY "admin_update_commission_rules" ON public.commission_rules
    FOR UPDATE TO authenticated
    USING (
      (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))) OR
      ((auth.jwt() ->> 'email') = 'adailtong@gmail.com')
    );
END $DO_BLOCK$;

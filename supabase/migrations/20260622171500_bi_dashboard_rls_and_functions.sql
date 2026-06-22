DO $$
BEGIN
  -- RLS for merchant_validations (Allow admins to select all)
  DROP POLICY IF EXISTS "admin_select_merchant_validations" ON public.merchant_validations;
  CREATE POLICY "admin_select_merchant_validations" ON public.merchant_validations
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

  -- RLS for user_engagements (Allow admins to select all)
  DROP POLICY IF EXISTS "admin_select_user_engagements" ON public.user_engagements;
  CREATE POLICY "admin_select_user_engagements" ON public.user_engagements
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

  -- RLS for ad_campaigns (Allow admins to select all)
  DROP POLICY IF EXISTS "admin_select_ad_campaigns" ON public.ad_campaigns;
  CREATE POLICY "admin_select_ad_campaigns" ON public.ad_campaigns
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

  -- RLS for merchants (Allow admins to select all)
  DROP POLICY IF EXISTS "admin_select_merchants" ON public.merchants;
  CREATE POLICY "admin_select_merchants" ON public.merchants
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

  -- RLS for franchises (Allow admins to select all)
  DROP POLICY IF EXISTS "admin_select_franchises" ON public.franchises;
  CREATE POLICY "admin_select_franchises" ON public.franchises
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
END $$;

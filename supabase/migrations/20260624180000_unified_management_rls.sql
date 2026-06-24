DO $$
BEGIN
  -- CRM Campaigns Unified Management
  DROP POLICY IF EXISTS "unified_manage_crm_campaigns" ON public.crm_campaigns;
  CREATE POLICY "unified_manage_crm_campaigns" ON public.crm_campaigns
    FOR ALL TO authenticated
    USING (
      company_id = public.get_auth_user_company_id() OR
      franchise_id = public.get_auth_user_franchise_id() OR
      affiliate_id = public.get_auth_user_affiliate_id() OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  -- CRM Target Groups Unified Management
  DROP POLICY IF EXISTS "unified_manage_crm_target_groups" ON public.crm_target_groups;
  CREATE POLICY "unified_manage_crm_target_groups" ON public.crm_target_groups
    FOR ALL TO authenticated
    USING (
      company_id = public.get_auth_user_company_id() OR
      franchise_id = public.get_auth_user_franchise_id() OR
      affiliate_id = public.get_auth_user_affiliate_id() OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  -- Crawler Sources Unified Management
  DROP POLICY IF EXISTS "unified_manage_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "unified_manage_crawler_sources" ON public.crawler_sources
    FOR ALL TO authenticated
    USING (
      company_id = public.get_auth_user_company_id() OR
      franchise_id = public.get_auth_user_franchise_id() OR
      affiliate_id = public.get_auth_user_affiliate_id() OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  -- Crawler Logs Unified Management
  DROP POLICY IF EXISTS "unified_manage_crawler_logs" ON public.crawler_logs;
  CREATE POLICY "unified_manage_crawler_logs" ON public.crawler_logs
    FOR ALL TO authenticated
    USING (
      company_id = public.get_auth_user_company_id() OR
      franchise_id = public.get_auth_user_franchise_id() OR
      affiliate_id = public.get_auth_user_affiliate_id() OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );
END $$;

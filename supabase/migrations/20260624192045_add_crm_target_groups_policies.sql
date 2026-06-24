DO $$
BEGIN
  -- crm_target_groups policies
  DROP POLICY IF EXISTS "auth_manage_own_crm_target_groups" ON public.crm_target_groups;
  CREATE POLICY "auth_manage_own_crm_target_groups" ON public.crm_target_groups
    FOR ALL TO authenticated
    USING (
      company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
      franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
    );

  DROP POLICY IF EXISTS "unified_manage_crm_target_groups" ON public.crm_target_groups;
  CREATE POLICY "unified_manage_crm_target_groups" ON public.crm_target_groups
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
END $$;

-- Ensure robust RLS policies for CRM tables so merchants can always view their campaigns
DO $$
BEGIN
  -- Ensure policies for crm_campaigns
  DROP POLICY IF EXISTS "crm_campaigns_user_select" ON public.crm_campaigns;
  CREATE POLICY "crm_campaigns_user_select" ON public.crm_campaigns
    FOR SELECT TO authenticated
    USING (
      company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      OR franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())
      OR affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
    );

  -- Ensure policies for crm_target_groups
  DROP POLICY IF EXISTS "crm_target_groups_user_select" ON public.crm_target_groups;
  CREATE POLICY "crm_target_groups_user_select" ON public.crm_target_groups
    FOR SELECT TO authenticated
    USING (
      company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      OR franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())
      OR affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
    );
END $$;

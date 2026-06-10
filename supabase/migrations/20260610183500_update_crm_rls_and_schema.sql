-- Add affiliate_id to CRM tables for Affiliate dashboard unified CRM
ALTER TABLE public.crm_target_groups ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;
ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;

-- Type mismatch explicit fixes (ensure they match the referenced tables)
-- merchants.id is TEXT. crm_campaigns.company_id is TEXT. (Matches)
-- coupons.id is UUID. crm_campaigns.linked_offer_id is UUID. (Matches)
-- Verified indices and constraints for safe relations
CREATE INDEX IF NOT EXISTS idx_crm_target_groups_affiliate_id ON public.crm_target_groups(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_affiliate_id ON public.crm_campaigns(affiliate_id);

-- Drop previous RLS policies
DROP POLICY IF EXISTS "authenticated_all_crm_campaigns" ON public.crm_campaigns;
DROP POLICY IF EXISTS "authenticated_all_target_groups" ON public.crm_target_groups;
DROP POLICY IF EXISTS "crm_campaigns_select" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_insert" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_update" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaigns_delete" ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_target_groups_select" ON public.crm_target_groups;
DROP POLICY IF EXISTS "crm_target_groups_insert" ON public.crm_target_groups;
DROP POLICY IF EXISTS "crm_target_groups_update" ON public.crm_target_groups;
DROP POLICY IF EXISTS "crm_target_groups_delete" ON public.crm_target_groups;

-- Enable RLS (already enabled probably, but safe)
ALTER TABLE public.crm_target_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;

-- Unified CRM Policies for crm_target_groups
CREATE POLICY "crm_target_groups_select" ON public.crm_target_groups
  FOR SELECT TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
    OR (company_id IN (SELECT id FROM public.merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
    OR (franchise_id IN (SELECT id FROM public.franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
    OR (affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()))
  );

CREATE POLICY "crm_target_groups_insert" ON public.crm_target_groups
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "crm_target_groups_update" ON public.crm_target_groups
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_target_groups_delete" ON public.crm_target_groups
  FOR DELETE TO authenticated USING (true);


-- Unified CRM Policies for crm_campaigns
CREATE POLICY "crm_campaigns_select" ON public.crm_campaigns
  FOR SELECT TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
    OR (company_id IN (SELECT id FROM public.merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
    OR (franchise_id IN (SELECT id FROM public.franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
    OR (affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()))
  );

CREATE POLICY "crm_campaigns_insert" ON public.crm_campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "crm_campaigns_update" ON public.crm_campaigns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_campaigns_delete" ON public.crm_campaigns
  FOR DELETE TO authenticated USING (true);

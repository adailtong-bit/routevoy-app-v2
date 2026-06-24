-- Secure ad_campaigns RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- 1. Read policy for active campaigns (Public / Feed)
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
  FOR SELECT USING (status = 'active' OR status = 'published');

-- 2. Master bypass for Admins (Super Admin)
DROP POLICY IF EXISTS "admin_all_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "admin_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin' OR profiles.email = 'adailtong@gmail.com')
    )
  );

-- 3. Merchants manage their own campaigns
DROP POLICY IF EXISTS "merchant_own_ad_campaigns_manage" ON public.ad_campaigns;
CREATE POLICY "merchant_own_ad_campaigns_manage" ON public.ad_campaigns
  FOR ALL TO authenticated USING (
    company_id::text IN (
      SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  ) WITH CHECK (
    company_id::text IN (
      SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  );

-- 4. Franchisees manage their own campaigns
DROP POLICY IF EXISTS "franchisee_own_ad_campaigns_manage" ON public.ad_campaigns;
CREATE POLICY "franchisee_own_ad_campaigns_manage" ON public.ad_campaigns
  FOR ALL TO authenticated USING (
    franchise_id IN (
      SELECT franchise_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  ) WITH CHECK (
    franchise_id IN (
      SELECT franchise_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  );

-- 5. Affiliates manage their own campaigns
DROP POLICY IF EXISTS "affiliate_own_ad_campaigns_manage" ON public.ad_campaigns;
CREATE POLICY "affiliate_own_ad_campaigns_manage" ON public.ad_campaigns
  FOR ALL TO authenticated USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
  );

-- Clean up older overly permissive policies
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Enable select for all" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ad_campaigns;

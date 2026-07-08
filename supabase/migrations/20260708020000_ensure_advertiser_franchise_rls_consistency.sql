-- Ensure RLS policies on ad_advertisers are consistent with franchise-scoped filtering
-- Franchisees should only see/manage advertisers linked to their franchise_id
-- Admins/super_admins should have unrestricted access to all advertisers

-- 1. Franchise-scoped policy: franchisees can only access their own advertisers
DROP POLICY IF EXISTS "franchise_scoped_ad_advertisers" ON public.ad_advertisers;
CREATE POLICY "franchise_scoped_ad_advertisers" ON public.ad_advertisers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
    OR (
      franchise_id IS NOT NULL
      AND franchise_id = (
        SELECT franchise_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
    OR (
      franchise_id IS NOT NULL
      AND franchise_id = (
        SELECT franchise_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- 2. Admin override: admins can manage all advertisers regardless of franchise
DROP POLICY IF EXISTS "admin_all_ad_advertisers_override" ON public.ad_advertisers;
CREATE POLICY "admin_all_ad_advertisers_override" ON public.ad_advertisers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 3. Public read: allow public to read advertiser data (needed for ad display)
DROP POLICY IF EXISTS "public_read_ad_advertisers" ON public.ad_advertisers;
CREATE POLICY "public_read_ad_advertisers" ON public.ad_advertisers
  FOR SELECT TO public USING (true);

-- 4. Ensure ad_campaigns admin override allows global access
DROP POLICY IF EXISTS "admin_all_ad_campaigns_strict" ON public.ad_campaigns;
CREATE POLICY "admin_all_ad_campaigns_strict" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin' OR profiles.email = 'adailtong@gmail.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin' OR profiles.email = 'adailtong@gmail.com')
    )
  );

-- 5. Ensure franchisee-scoped access to ad_campaigns
DROP POLICY IF EXISTS "franchise_own_ad_campaigns_strict" ON public.ad_campaigns;
CREATE POLICY "franchise_own_ad_campaigns_strict" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    franchise_id IN (
      SELECT franchise_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    franchise_id IN (
      SELECT franchise_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  );

-- 6. Ensure public can read active campaigns
DROP POLICY IF EXISTS "public_read_active_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "public_read_active_ad_campaigns" ON public.ad_campaigns
  FOR SELECT USING (status = 'active' OR status = 'published');

DO $do$
DECLARE
  pol record;
BEGIN
  -- Drop any policy on ad_invoices that has the long regex
  FOR pol IN 
    SELECT policyname
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ad_invoices'
      AND qual LIKE '%[0-9a-f]%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_invoices', pol.policyname);
  END LOOP;
END $do$;

CREATE OR REPLACE FUNCTION public.check_ad_invoice_access(p_advertiser_id uuid, p_ad_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $func$
  SELECT 
    (p_advertiser_id = auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id IS NOT NULL 
      AND profiles.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
      AND profiles.company_id::uuid = p_advertiser_id
    ) OR 
    EXISTS (
      SELECT 1 FROM ad_campaigns 
      WHERE ad_campaigns.id = p_ad_id AND ad_campaigns.company_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    );
$func$;

-- Now recreate the standard policies using the function
DROP POLICY IF EXISTS "select_ad_invoices" ON public.ad_invoices;
CREATE POLICY "select_ad_invoices" ON public.ad_invoices
  FOR SELECT TO authenticated USING (
    public.check_ad_invoice_access(advertiser_id, ad_id)
  );

DROP POLICY IF EXISTS "manage_ad_invoices" ON public.ad_invoices;
CREATE POLICY "manage_ad_invoices" ON public.ad_invoices
  FOR ALL TO authenticated USING (
    public.check_ad_invoice_access(advertiser_id, ad_id)
  );

-- Also fix any similar policy on ad_campaigns just in case
DO $do$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ad_campaigns'
      AND qual LIKE '%[0-9a-f]%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_campaigns', pol.policyname);
  END LOOP;
END $do$;

CREATE OR REPLACE FUNCTION public.check_ad_campaign_access(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $func$
  SELECT 
    (p_company_id = auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id IS NOT NULL 
      AND profiles.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
      AND profiles.company_id::uuid = p_company_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    );
$func$;

DROP POLICY IF EXISTS "select_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "select_ad_campaigns" ON public.ad_campaigns
  FOR SELECT TO authenticated USING (
    public.check_ad_campaign_access(company_id)
  );

DROP POLICY IF EXISTS "manage_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "manage_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated USING (
    public.check_ad_campaign_access(company_id)
  );

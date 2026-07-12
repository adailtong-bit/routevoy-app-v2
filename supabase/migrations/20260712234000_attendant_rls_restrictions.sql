CREATE OR REPLACE FUNCTION public.check_ad_invoice_access(p_advertiser_id uuid, p_ad_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $func$
  SELECT 
    (p_advertiser_id = auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role NOT IN ('attendant', 'cashier')
      AND profiles.company_id IS NOT NULL 
      AND profiles.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
      AND profiles.company_id::uuid = p_advertiser_id
    ) OR 
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = p_ad_id AND ad_campaigns.company_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    );
$func$;

DROP POLICY IF EXISTS "merchant_ledger" ON public.financial_ledger;
CREATE POLICY "merchant_ledger" ON public.financial_ledger
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role NOT IN ('attendant', 'cashier')
      AND profiles.company_id = financial_ledger.company_id
    )
  );

DROP POLICY IF EXISTS "financial_ledger_select" ON public.financial_ledger;
CREATE POLICY "financial_ledger_select" ON public.financial_ledger
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role NOT IN ('attendant', 'cashier')
      AND profiles.company_id = financial_ledger.company_id
    )
  );

-- 1. Drop policies that might depend on company_id being a UUID
DROP POLICY IF EXISTS "merchant_own_ad_campaigns_manage" ON public.ad_campaigns;

-- 2. Alter company_id to text so it matches merchants.id
ALTER TABLE public.ad_campaigns ALTER COLUMN company_id TYPE TEXT USING company_id::TEXT;

-- 3. Recreate the policy
CREATE POLICY "merchant_own_ad_campaigns_manage" ON public.ad_campaigns
  FOR ALL TO authenticated USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  ) WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()
    )
  );

-- 4. Try to add a foreign key if there's no conflicting data
DO $$
BEGIN
  -- Set company_id to NULL if it doesn't exist in merchants
  UPDATE public.ad_campaigns 
  SET company_id = NULL 
  WHERE company_id IS NOT NULL 
  AND company_id NOT IN (SELECT id FROM public.merchants);

  -- Now add the foreign key
  ALTER TABLE public.ad_campaigns 
    ADD CONSTRAINT ad_campaigns_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.merchants(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint already exists or other issues
END $$;

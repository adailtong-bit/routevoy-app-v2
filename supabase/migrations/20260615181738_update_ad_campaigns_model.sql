DO $$
BEGIN
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS promotion_model TEXT DEFAULT 'standard';
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS reward_description TEXT;
END $$;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ad_campaigns;
CREATE POLICY "Enable insert for authenticated users" ON public.ad_campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ad_campaigns;
CREATE POLICY "Enable update for authenticated users" ON public.ad_campaigns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for all" ON public.ad_campaigns;
CREATE POLICY "Enable select for all" ON public.ad_campaigns
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.ad_campaigns;
CREATE POLICY "Enable delete for authenticated users" ON public.ad_campaigns
  FOR DELETE TO authenticated USING (true);

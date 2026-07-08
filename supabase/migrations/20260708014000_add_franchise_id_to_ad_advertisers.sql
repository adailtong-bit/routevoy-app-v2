-- Add franchise_id column to ad_advertisers for franchise data isolation
ALTER TABLE public.ad_advertisers
ADD COLUMN IF NOT EXISTS franchise_id TEXT REFERENCES public.franchises(id);

CREATE INDEX IF NOT EXISTS idx_ad_advertisers_franchise_id
ON public.ad_advertisers(franchise_id);

-- Replace overly permissive public policy (was FOR ALL) with read-only
DROP POLICY IF EXISTS "public_all_ad_advertisers" ON public.ad_advertisers;
DROP POLICY IF EXISTS "public_read_ad_advertisers" ON public.ad_advertisers;
CREATE POLICY "public_read_ad_advertisers" ON public.ad_advertisers
  FOR SELECT TO public USING (true);

-- Franchise-scoped write access: franchisees can only manage their own advertisers
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

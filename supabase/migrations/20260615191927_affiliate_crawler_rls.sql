DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE public.crawler_sources ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.crawler_logs ENABLE ROW LEVEL SECURITY;

  -- Add affiliate_id to crawler_sources and crawler_logs if not exists
  ALTER TABLE public.crawler_sources ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;
  ALTER TABLE public.crawler_logs ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;

  -- RLS for crawler_sources
  DROP POLICY IF EXISTS "affiliates_select_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliates_select_crawler_sources" ON public.crawler_sources
    FOR SELECT TO authenticated
    USING (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  DROP POLICY IF EXISTS "affiliates_insert_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliates_insert_crawler_sources" ON public.crawler_sources
    FOR INSERT TO authenticated
    WITH CHECK (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  DROP POLICY IF EXISTS "affiliates_update_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliates_update_crawler_sources" ON public.crawler_sources
    FOR UPDATE TO authenticated
    USING (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    ) WITH CHECK (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  DROP POLICY IF EXISTS "affiliates_delete_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliates_delete_crawler_sources" ON public.crawler_sources
    FOR DELETE TO authenticated
    USING (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  -- RLS for crawler_logs
  DROP POLICY IF EXISTS "affiliates_select_crawler_logs" ON public.crawler_logs;
  CREATE POLICY "affiliates_select_crawler_logs" ON public.crawler_logs
    FOR SELECT TO authenticated
    USING (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

  DROP POLICY IF EXISTS "affiliates_insert_crawler_logs" ON public.crawler_logs;
  CREATE POLICY "affiliates_insert_crawler_logs" ON public.crawler_logs
    FOR INSERT TO authenticated
    WITH CHECK (
      affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
      OR franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text)
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );

END $$;

DO $$
BEGIN
  -- Add franchise_id to related tables if not exists
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES public.franchises(id) ON DELETE SET NULL;
  ALTER TABLE public.crawler_sources ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES public.franchises(id) ON DELETE SET NULL;
  ALTER TABLE public.crawler_logs ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES public.franchises(id) ON DELETE SET NULL;

  -- 1. RLS for discovered_promotions
  DROP POLICY IF EXISTS "affiliate_select_discovered_promotions" ON public.discovered_promotions;
  CREATE POLICY "affiliate_select_discovered_promotions" ON public.discovered_promotions
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND (
          discovered_promotions.franchise_id = profiles.franchise_id OR
          discovered_promotions.company_id IN (
            SELECT id FROM public.companies WHERE franchise_id = profiles.franchise_id
          )
        )
      )
      OR 
      EXISTS (
        SELECT 1 FROM public.affiliate_partners
        WHERE affiliate_partners.user_id = auth.uid()
        AND discovered_promotions.reward_id = affiliate_partners.id
      )
    );

  DROP POLICY IF EXISTS "affiliate_update_discovered_promotions" ON public.discovered_promotions;
  CREATE POLICY "affiliate_update_discovered_promotions" ON public.discovered_promotions
    FOR UPDATE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND (
          discovered_promotions.franchise_id = profiles.franchise_id OR
          discovered_promotions.company_id IN (
            SELECT id FROM public.companies WHERE franchise_id = profiles.franchise_id
          )
        )
      )
      OR 
      EXISTS (
        SELECT 1 FROM public.affiliate_partners
        WHERE affiliate_partners.user_id = auth.uid()
        AND discovered_promotions.reward_id = affiliate_partners.id
      )
    );

  DROP POLICY IF EXISTS "affiliate_delete_discovered_promotions" ON public.discovered_promotions;
  CREATE POLICY "affiliate_delete_discovered_promotions" ON public.discovered_promotions
    FOR DELETE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND (
          discovered_promotions.franchise_id = profiles.franchise_id OR
          discovered_promotions.company_id IN (
            SELECT id FROM public.companies WHERE franchise_id = profiles.franchise_id
          )
        )
      )
      OR 
      EXISTS (
        SELECT 1 FROM public.affiliate_partners
        WHERE affiliate_partners.user_id = auth.uid()
        AND discovered_promotions.reward_id = affiliate_partners.id
      )
    );

  -- 2. RLS for crawler_sources
  DROP POLICY IF EXISTS "affiliate_select_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliate_select_crawler_sources" ON public.crawler_sources
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND crawler_sources.franchise_id = profiles.franchise_id
      )
    );

  DROP POLICY IF EXISTS "affiliate_insert_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliate_insert_crawler_sources" ON public.crawler_sources
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND crawler_sources.franchise_id = profiles.franchise_id
      )
    );

  DROP POLICY IF EXISTS "affiliate_update_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliate_update_crawler_sources" ON public.crawler_sources
    FOR UPDATE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND crawler_sources.franchise_id = profiles.franchise_id
      )
    );

  DROP POLICY IF EXISTS "affiliate_delete_crawler_sources" ON public.crawler_sources;
  CREATE POLICY "affiliate_delete_crawler_sources" ON public.crawler_sources
    FOR DELETE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND crawler_sources.franchise_id = profiles.franchise_id
      )
    );

  -- 3. RLS for crawler_logs
  DROP POLICY IF EXISTS "affiliate_select_crawler_logs" ON public.crawler_logs;
  CREATE POLICY "affiliate_select_crawler_logs" ON public.crawler_logs
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND crawler_logs.franchise_id = profiles.franchise_id
      )
    );

  DROP POLICY IF EXISTS "affiliate_insert_crawler_logs" ON public.crawler_logs;
  CREATE POLICY "affiliate_insert_crawler_logs" ON public.crawler_logs
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'affiliate'
        AND profiles.franchise_id IS NOT NULL
        AND crawler_logs.franchise_id = profiles.franchise_id
      )
    );

END $$;

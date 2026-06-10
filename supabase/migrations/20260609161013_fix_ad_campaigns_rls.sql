-- Fix RLS for ad_campaigns
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_insert_ad_campaigns" ON public.ad_campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_update_ad_campaigns" ON public.ad_campaigns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated USING (true);

-- Fix RLS for categories
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT USING (true);

-- Seed Categories if they don't exist
INSERT INTO public.categories (id, name, label, status) VALUES
  (gen_random_uuid(), 'Eletrônicos', 'Eletrônicos', 'active'),
  (gen_random_uuid(), 'Moda', 'Moda', 'active'),
  (gen_random_uuid(), 'Alimentação', 'Alimentação', 'active'),
  (gen_random_uuid(), 'Viagens', 'Viagens', 'active')
ON CONFLICT (name) DO NOTHING;

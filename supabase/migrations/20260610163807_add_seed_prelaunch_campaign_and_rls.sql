-- Fix RLS for discovered_promotions
ALTER TABLE public.discovered_promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_select_discovered_promotions" ON public.discovered_promotions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_insert_discovered_promotions" ON public.discovered_promotions
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_update_discovered_promotions" ON public.discovered_promotions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_delete_discovered_promotions" ON public.discovered_promotions
  FOR DELETE TO authenticated USING (true);

-- Fix RLS for ad_campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_select_ad_campaigns" ON public.ad_campaigns
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_insert_ad_campaigns" ON public.ad_campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_update_ad_campaigns" ON public.ad_campaigns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_delete_ad_campaigns" ON public.ad_campaigns
  FOR DELETE TO authenticated USING (true);

-- Insert Seed Data for Pre-launch campaign
DO $$
DECLARE
  seed_id uuid := '11111111-2222-3333-4444-555555555555'::uuid;
BEGIN
  INSERT INTO public.discovered_promotions (
    id,
    title,
    description,
    status,
    engagement_threshold,
    reward_description,
    reward_type,
    promotion_model,
    environment,
    category,
    is_featured
  ) VALUES (
    seed_id,
    'Summer Campaign - Test Example',
    'Share with 10 friends and win a Free Tropical Juice!',
    'active',
    10,
    'Free Tropical Juice',
    'Free Item',
    'pre-launch',
    'production',
    'Food',
    true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

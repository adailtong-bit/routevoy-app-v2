-- Migration for Seasonal Agenda

DO $$
BEGIN
  -- Add is_agenda_only column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'discovered_promotions' AND column_name = 'is_agenda_only') THEN
    ALTER TABLE public.discovered_promotions ADD COLUMN is_agenda_only boolean DEFAULT false;
  END IF;
END $$;

-- Ensure RLS allows public select
DO $$
BEGIN
  DROP POLICY IF EXISTS "public_read_discovered_promotions_new" ON public.discovered_promotions;
  CREATE POLICY "public_read_discovered_promotions_new" ON public.discovered_promotions
    FOR SELECT TO public USING (true);
END $$;

-- Seed Data for Seasonal Agenda
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE unique_hash = 'seed_agenda_1') THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, store_name, image_url, start_date, end_date, is_seasonal, is_agenda_only, status, environment, unique_hash
    ) VALUES (
      gen_random_uuid(), 
      'Black Friday Tech Week', 
      'Exclusive discounts on the latest smartphones and laptops. Prepare your wishlist for the biggest tech sale of the year.', 
      'TechCorp Store', 
      'https://img.usecurling.com/p/800/400?q=technology&color=black', 
      '2026-11-20T00:00:00Z', 
      '2026-11-27T23:59:59Z', 
      true, 
      true, 
      'published', 
      'production', 
      'seed_agenda_1'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE unique_hash = 'seed_agenda_2') THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, store_name, image_url, start_date, end_date, is_seasonal, is_agenda_only, status, environment, unique_hash
    ) VALUES (
      gen_random_uuid(), 
      'Christmas Early Bird Specials', 
      'Start your holiday shopping early! Enjoy exclusive perks and festive collections available for a limited time.', 
      'Holiday Treats', 
      'https://img.usecurling.com/p/800/400?q=christmas&color=red', 
      '2026-12-01T00:00:00Z', 
      '2026-12-15T23:59:59Z', 
      true, 
      true, 
      'published', 
      'production', 
      'seed_agenda_2'
    );
  END IF;
END $$;

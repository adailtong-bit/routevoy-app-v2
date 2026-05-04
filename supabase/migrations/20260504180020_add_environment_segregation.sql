DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discovered_promotions' AND column_name = 'environment') THEN
    ALTER TABLE public.discovered_promotions ADD COLUMN environment text NOT NULL DEFAULT 'production';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'environment') THEN
    ALTER TABLE public.coupons ADD COLUMN environment text NOT NULL DEFAULT 'production';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ad_campaigns' AND column_name = 'environment') THEN
    ALTER TABLE public.ad_campaigns ADD COLUMN environment text NOT NULL DEFAULT 'production';
  END IF;

  -- Create indexes for performance on environment filtering
  CREATE INDEX IF NOT EXISTS idx_discovered_promotions_environment ON public.discovered_promotions(environment);
  CREATE INDEX IF NOT EXISTS idx_coupons_environment ON public.coupons(environment);
  CREATE INDEX IF NOT EXISTS idx_ad_campaigns_environment ON public.ad_campaigns(environment);
END $$;

DO $$
BEGIN
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS budget NUMERIC(10,2);
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS cost_per_click NUMERIC(10,2);
END $$;

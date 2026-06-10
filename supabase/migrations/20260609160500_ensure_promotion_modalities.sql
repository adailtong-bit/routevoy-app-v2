DO $$
BEGIN
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS promotion_model TEXT DEFAULT 'standard';
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS reward_description TEXT;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS trigger_threshold NUMERIC;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE;
END $$;

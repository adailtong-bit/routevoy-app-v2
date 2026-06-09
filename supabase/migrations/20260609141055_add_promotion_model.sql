ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS promotion_model text DEFAULT 'standard';
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS promotion_model text DEFAULT 'standard';

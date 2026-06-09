ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS discount_percentage numeric;
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS discount text;
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS is_seasonal boolean DEFAULT false;

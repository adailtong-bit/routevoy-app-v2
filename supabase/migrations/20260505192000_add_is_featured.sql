ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

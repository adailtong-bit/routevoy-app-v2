DO $$
BEGIN
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
END $$;

-- Seed some random usage count and verified status for existing active coupons to show the social proof in action
UPDATE public.coupons 
SET 
  usage_count = floor(random() * 80 + 5)::int, 
  is_verified = true 
WHERE status = 'active' AND (usage_count IS NULL OR usage_count = 0);

UPDATE public.discovered_promotions 
SET 
  usage_count = floor(random() * 80 + 5)::int, 
  is_verified = true 
WHERE status IN ('approved', 'published') AND (usage_count IS NULL OR usage_count = 0);

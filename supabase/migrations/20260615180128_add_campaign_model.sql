ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS promotion_model TEXT DEFAULT 'standard';
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS reward_description TEXT;

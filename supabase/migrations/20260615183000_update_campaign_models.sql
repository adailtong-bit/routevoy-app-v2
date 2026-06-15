ALTER TABLE public.ad_campaigns
ADD COLUMN IF NOT EXISTS promotion_model TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS reward_description TEXT,
ADD COLUMN IF NOT EXISTS trigger_threshold NUMERIC,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;

DO $$
BEGIN
  UPDATE public.ad_campaigns
  SET promotion_model = 'buy_and_get'
  WHERE promotion_model = 'buy_and_win';
END $$;

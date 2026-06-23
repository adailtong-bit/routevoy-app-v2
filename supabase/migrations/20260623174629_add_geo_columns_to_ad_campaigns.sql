ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS alert_radius numeric;
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS longitude numeric;

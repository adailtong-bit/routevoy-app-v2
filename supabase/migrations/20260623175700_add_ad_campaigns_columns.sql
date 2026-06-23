-- Add missing columns to ad_campaigns
ALTER TABLE public.ad_campaigns 
ADD COLUMN IF NOT EXISTS enable_trigger boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_proximity_alerts boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trigger_type text,
ADD COLUMN IF NOT EXISTS limit_type text,
ADD COLUMN IF NOT EXISTS total_limit integer;

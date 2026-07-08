ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;

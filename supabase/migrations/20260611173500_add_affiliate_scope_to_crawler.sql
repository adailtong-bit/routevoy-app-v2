ALTER TABLE public.crawler_sources 
ADD COLUMN IF NOT EXISTS franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;

ALTER TABLE public.crawler_logs 
ADD COLUMN IF NOT EXISTS franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;

ALTER TABLE public.discovered_promotions
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE;

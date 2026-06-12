ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS owner_id TEXT;
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS coverage_scope TEXT;

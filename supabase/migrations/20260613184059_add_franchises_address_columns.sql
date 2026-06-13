DO $$
BEGIN
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_street text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_number text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_neighborhood text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_city text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_state text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_zip text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS address_complement text;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS latitude numeric;
  ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS longitude numeric;
END $$;

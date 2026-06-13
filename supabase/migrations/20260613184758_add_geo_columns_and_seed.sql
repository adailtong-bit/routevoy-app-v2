-- Replaced public.companies with public.merchants as per investigation findings
DO $$
BEGIN
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_street TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_number TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_complement TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_city TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_state TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_zip TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address_country TEXT;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS latitude NUMERIC;
  ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS longitude NUMERIC;
END $$;

-- Ensure RLS policies exist on public.merchants
DROP POLICY IF EXISTS "merchants_select" ON public.merchants;
CREATE POLICY "merchants_select" ON public.merchants FOR SELECT USING (true);

DROP POLICY IF EXISTS "merchants_insert" ON public.merchants;
CREATE POLICY "merchants_insert" ON public.merchants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "merchants_update" ON public.merchants;
CREATE POLICY "merchants_update" ON public.merchants FOR UPDATE USING (true);

DROP POLICY IF EXISTS "merchants_delete" ON public.merchants;
CREATE POLICY "merchants_delete" ON public.merchants FOR DELETE USING (true);

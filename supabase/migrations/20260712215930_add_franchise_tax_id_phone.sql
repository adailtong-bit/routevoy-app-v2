-- Add tax_id and phone columns to franchises table
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS phone text;

-- Ensure RLS policies allow authenticated users to manage franchises
DROP POLICY IF EXISTS "authenticated_all_franchises" ON public.franchises;
CREATE POLICY "authenticated_all_franchises" ON public.franchises
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

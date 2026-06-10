ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id text REFERENCES public.merchants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

DO $$
BEGIN
  -- Safe RLS update for profiles
  DROP POLICY IF EXISTS "merchants_read_company_profiles" ON public.profiles;
  CREATE POLICY "merchants_read_company_profiles" ON public.profiles
    FOR SELECT TO authenticated 
    USING (
      company_id IS NOT NULL AND company_id IN (
        SELECT p2.company_id FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role IN ('merchant', 'shopkeeper')
      )
    );
END $$;

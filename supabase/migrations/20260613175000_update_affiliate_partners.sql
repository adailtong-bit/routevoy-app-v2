DO $$
BEGIN
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_country TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_state TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS address_city TEXT;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS coverage_scope TEXT DEFAULT 'national';
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS coverage_states JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS coverage_cities JSONB DEFAULT '[]'::jsonb;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "admin_insert_affiliates" ON public.affiliate_partners;
  CREATE POLICY "admin_insert_affiliates" ON public.affiliate_partners
    FOR INSERT TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
      ) OR 
      (auth.jwt() ->> 'email') = 'adailtong@gmail.com'
    );
END $$;

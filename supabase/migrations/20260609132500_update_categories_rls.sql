DO $$
BEGIN
  -- Drop existing policies if they exist to maintain idempotency
  DROP POLICY IF EXISTS "authenticated_select_categories" ON public.categories;
  DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
  
  -- Create safe RLS policies for reading categories
  CREATE POLICY "authenticated_select_categories" ON public.categories
    FOR SELECT TO authenticated USING (true);
    
  CREATE POLICY "public_read_categories" ON public.categories
    FOR SELECT TO public USING (true);
END $$;

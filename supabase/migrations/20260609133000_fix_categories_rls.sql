DO $$
BEGIN
  -- Drop existing policies if needed for idempotency
  DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
  DROP POLICY IF EXISTS "Allow authenticated read access on categories" ON public.categories;

  -- Create SELECT policy for public
  CREATE POLICY "Allow public read access on categories" ON public.categories
    FOR SELECT TO public USING (true);

  -- Create SELECT policy for authenticated
  CREATE POLICY "Allow authenticated read access on categories" ON public.categories
    FOR SELECT TO authenticated USING (true);
END $$;

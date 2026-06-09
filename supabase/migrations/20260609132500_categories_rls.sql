DO $$
BEGIN
  -- Ensure RLS is enabled for categories table
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  
  -- Create policy for authenticated users to select from categories
  DROP POLICY IF EXISTS "authenticated_select_categories" ON public.categories;
  CREATE POLICY "authenticated_select_categories" ON public.categories
    FOR SELECT TO authenticated USING (true);
END $$;

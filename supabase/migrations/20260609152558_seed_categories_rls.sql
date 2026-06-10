DO $$
BEGIN
  INSERT INTO public.categories (id, name, label, status) VALUES
    (gen_random_uuid(), 'electronics', 'Electronics', 'active'),
    (gen_random_uuid(), 'fashion', 'Fashion', 'active'),
    (gen_random_uuid(), 'food', 'Food & Dining', 'active'),
    (gen_random_uuid(), 'travel', 'Travel & Tourism', 'active'),
    (gen_random_uuid(), 'entertainment', 'Entertainment', 'active'),
    (gen_random_uuid(), 'services', 'Services', 'active'),
    (gen_random_uuid(), 'retail', 'Retail', 'active')
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Ensure RLS policy exists and allows public read
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT USING (true);

-- Explicitly allow authenticated and anon to read categories in case 'public' doesn't cover everything
DROP POLICY IF EXISTS "Allow authenticated read access on categories" ON public.categories;
CREATE POLICY "Allow authenticated read access on categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories" ON public.categories
  FOR SELECT TO anon USING (true);

-- Enable RLS just in case it wasn't
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read categories
DROP POLICY IF EXISTS "authenticated_select_categories" ON public.categories;
CREATE POLICY "authenticated_select_categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

DO $$
BEGIN
  -- Insert categories safely using DO NOTHING
  INSERT INTO public.categories (id, name, label, status) VALUES
    (gen_random_uuid(), 'food', 'Alimentação', 'active'),
    (gen_random_uuid(), 'travel', 'Viagens', 'active'),
    (gen_random_uuid(), 'hospitality', 'Hospedagem', 'active'),
    (gen_random_uuid(), 'services', 'Serviços', 'active'),
    (gen_random_uuid(), 'leisure', 'Lazer', 'active')
  ON CONFLICT (name) DO NOTHING;
END $$;

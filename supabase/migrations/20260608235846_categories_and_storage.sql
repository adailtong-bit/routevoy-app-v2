DO $$
BEGIN
  -- Create categories table
  CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    label text NOT NULL,
    icon text,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
  );

  -- RLS for categories
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
  CREATE POLICY "public_read_categories" ON public.categories
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "admin_manage_categories" ON public.categories;
  CREATE POLICY "admin_manage_categories" ON public.categories
    FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
    );

  -- Seed data
  INSERT INTO public.categories (name, label, icon) VALUES 
  ('food', 'Food & Dining', 'Utensils'),
  ('electronics', 'Electronics', 'Laptop'),
  ('fashion', 'Fashion & Clothing', 'Shirt'),
  ('travel', 'Travel & Hotels', 'Plane'),
  ('services', 'Services', 'Wrench'),
  ('entertainment', 'Entertainment', 'Ticket'),
  ('health', 'Health & Beauty', 'Heart')
  ON CONFLICT (name) DO NOTHING;

  -- Create storage bucket if not exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('promotions', 'promotions', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

  -- Storage policies
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'promotions');

  DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
  CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

  DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
  CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

  DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
  CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'promotions');

END $$;

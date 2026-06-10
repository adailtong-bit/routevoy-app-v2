DO $$
BEGIN
  -- Ensure images bucket exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('images', 'images', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "auth_insert_images" ON storage.objects;
CREATE POLICY "auth_insert_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('ad-campaigns', 'ad-campaigns', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Public access to ad-campaigns bucket" ON storage.objects;
CREATE POLICY "Public access to ad-campaigns bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'ad-campaigns');

DROP POLICY IF EXISTS "Authenticated users can upload to ad-campaigns bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to ad-campaigns bucket" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ad-campaigns');

DROP POLICY IF EXISTS "Authenticated users can update ad-campaigns bucket" ON storage.objects;
CREATE POLICY "Authenticated users can update ad-campaigns bucket" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'ad-campaigns');

DROP POLICY IF EXISTS "Authenticated users can delete from ad-campaigns bucket" ON storage.objects;
CREATE POLICY "Authenticated users can delete from ad-campaigns bucket" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'ad-campaigns');

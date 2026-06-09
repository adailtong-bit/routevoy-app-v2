DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('promotions', 'promotions', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Authenticated inserts" ON storage.objects;
CREATE POLICY "Authenticated inserts" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('promotions', 'promotions', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Make sure to allow public reads
DROP POLICY IF EXISTS "public_read_promotions" ON storage.objects;
CREATE POLICY "public_read_promotions" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'promotions');

-- Allow authenticated users to insert
DROP POLICY IF EXISTS "auth_insert_promotions" ON storage.objects;
CREATE POLICY "auth_insert_promotions" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

-- Allow authenticated users to update
DROP POLICY IF EXISTS "auth_update_promotions" ON storage.objects;
CREATE POLICY "auth_update_promotions" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "auth_delete_promotions" ON storage.objects;
CREATE POLICY "auth_delete_promotions" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'promotions');

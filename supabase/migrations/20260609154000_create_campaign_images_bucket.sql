DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('campaign_images', 'campaign_images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

DROP POLICY IF EXISTS "public_read_campaign_images" ON storage.objects;
CREATE POLICY "public_read_campaign_images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'campaign_images');

DROP POLICY IF EXISTS "auth_insert_campaign_images" ON storage.objects;
CREATE POLICY "auth_insert_campaign_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'campaign_images');

DROP POLICY IF EXISTS "auth_update_campaign_images" ON storage.objects;
CREATE POLICY "auth_update_campaign_images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'campaign_images');

DROP POLICY IF EXISTS "auth_delete_campaign_images" ON storage.objects;
CREATE POLICY "auth_delete_campaign_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'campaign_images');

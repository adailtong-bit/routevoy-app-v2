DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('campaigns', 'campaigns', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "auth_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_insert_ad_campaigns" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_update_ad_campaigns" ON public.ad_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_delete_ad_campaigns" ON public.ad_campaigns FOR DELETE TO authenticated USING (true);

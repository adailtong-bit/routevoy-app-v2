DO $$
BEGIN
  -- Insert bucket if not exists
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('promotions', 'promotions', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Policies for storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Authenticated Users can upload media" ON storage.objects;
CREATE POLICY "Authenticated Users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Authenticated Users can update media" ON storage.objects;
CREATE POLICY "Authenticated Users can update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Authenticated Users can delete media" ON storage.objects;
CREATE POLICY "Authenticated Users can delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'promotions');

-- Ensure RLS on ad_campaigns
DROP POLICY IF EXISTS "auth_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_insert_ad_campaigns" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_update_ad_campaigns" ON public.ad_campaigns FOR UPDATE TO authenticated USING (true);

-- Ensure RLS on coupons
DROP POLICY IF EXISTS "auth_insert_coupons" ON public.coupons;
CREATE POLICY "auth_insert_coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_coupons" ON public.coupons;
CREATE POLICY "auth_update_coupons" ON public.coupons FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_delete_coupons" ON public.coupons;
CREATE POLICY "auth_delete_coupons" ON public.coupons FOR DELETE TO authenticated USING (true);

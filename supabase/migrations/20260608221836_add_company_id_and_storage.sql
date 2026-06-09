-- Add company_id and franchise_id to coupons if missing
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS company_id TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS franchise_id TEXT;

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-images', 'campaign-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign-images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-images');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'campaign-images');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'campaign-images');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'campaign-images');

-- Ensure coupons RLS allows authenticated insert
DROP POLICY IF EXISTS "auth_insert_coupons" ON public.coupons;
CREATE POLICY "auth_insert_coupons" ON public.coupons
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'merchant', 'shopkeeper', 'franchisee')
    )
  );

DROP POLICY IF EXISTS "auth_update_coupons" ON public.coupons;
CREATE POLICY "auth_update_coupons" ON public.coupons
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    )
  );

DROP POLICY IF EXISTS "auth_delete_coupons" ON public.coupons;
CREATE POLICY "auth_delete_coupons" ON public.coupons
  FOR DELETE TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'franchisee')
    )
  );

DROP POLICY IF EXISTS "auth_select_coupons" ON public.coupons;
CREATE POLICY "auth_select_coupons" ON public.coupons
  FOR SELECT TO authenticated USING (true);

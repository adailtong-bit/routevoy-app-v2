-- Add image_url to affiliate_partners
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create affiliates bucket if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('affiliates', 'affiliates', true) 
ON CONFLICT (id) DO NOTHING;

-- RLS policies for affiliates bucket
DROP POLICY IF EXISTS "Allow public read affiliates" ON storage.objects;
CREATE POLICY "Allow public read affiliates" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'affiliates');

DROP POLICY IF EXISTS "Allow authenticated uploads affiliates" ON storage.objects;
CREATE POLICY "Allow authenticated uploads affiliates" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'affiliates');

DROP POLICY IF EXISTS "Allow authenticated updates affiliates" ON storage.objects;
CREATE POLICY "Allow authenticated updates affiliates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'affiliates');

DROP POLICY IF EXISTS "Allow authenticated deletes affiliates" ON storage.objects;
CREATE POLICY "Allow authenticated deletes affiliates" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'affiliates');

-- Check RLS for affiliate_partners table
DROP POLICY IF EXISTS "authenticated_insert_affiliate_partners" ON public.affiliate_partners;
CREATE POLICY "authenticated_insert_affiliate_partners" ON public.affiliate_partners
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_affiliate_partners" ON public.affiliate_partners;
CREATE POLICY "authenticated_update_affiliate_partners" ON public.affiliate_partners
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

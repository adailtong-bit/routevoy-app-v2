-- Ensure required columns exist for the Campaign Form
ALTER TABLE public.discovered_promotions 
ADD COLUMN IF NOT EXISTS promotion_model text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS is_seasonal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS category text;

-- Create promotions bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('promotions', 'promotions', true) 
ON CONFLICT (id) DO NOTHING;

-- Setup Storage Policies idempotently
DO $$
BEGIN
  -- Allow public read access to the promotions bucket
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id = 'promotions');

  -- Allow authenticated users to upload to the promotions bucket
  DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
  CREATE POLICY "Auth Upload" ON storage.objects 
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');
END $$;

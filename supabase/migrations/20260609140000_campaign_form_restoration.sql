-- Make sure the categories table can be read by everyone
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT TO public USING (true);

-- Ensure code column exists in ad_campaigns to maintain Voucher/Code Integrity
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS code text;

-- Add index on status for fast filtering
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);

-- Fix public read policy to filter inactive/deleted
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;

CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
FOR SELECT USING (
  status = 'active' 
  OR status = 'published'
);

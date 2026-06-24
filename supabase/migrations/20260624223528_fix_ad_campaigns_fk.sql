DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'ad_campaigns_advertiser_id_fkey'
  ) THEN
    ALTER TABLE public.ad_campaigns DROP CONSTRAINT ad_campaigns_advertiser_id_fkey;
  END IF;
END $$;

-- Safely recreate the foreign key to explicitly link ad_campaigns to ad_advertisers
ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT ad_campaigns_advertiser_id_fkey
  FOREIGN KEY (advertiser_id) REFERENCES public.ad_advertisers(id) ON DELETE SET NULL;

-- Reload PostgREST schema cache to ensure HTTP 400 (PGRST200) relationship errors are resolved
NOTIFY pgrst, 'reload schema';

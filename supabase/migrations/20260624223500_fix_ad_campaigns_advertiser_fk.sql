-- Clean invalid or empty text values before casting
UPDATE public.ad_campaigns 
SET advertiser_id = NULL 
WHERE advertiser_id IS NOT NULL 
  AND advertiser_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- Change column type safely
ALTER TABLE public.ad_campaigns 
  ALTER COLUMN advertiser_id TYPE UUID USING advertiser_id::UUID;

-- Add the Foreign Key constraint idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ad_campaigns_advertiser_id_fkey'
  ) THEN
    ALTER TABLE public.ad_campaigns
      ADD CONSTRAINT ad_campaigns_advertiser_id_fkey
      FOREIGN KEY (advertiser_id) REFERENCES public.ad_advertisers(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  -- Add environment to ad_advertisers
  ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production';

  -- Add environment to ad_invoices
  ALTER TABLE public.ad_invoices ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production';

  -- Add environment to ad_pricing
  ALTER TABLE public.ad_pricing ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production';
END $$;

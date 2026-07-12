-- Add latitude and longitude columns to affiliate_partners table
-- These columns support the unified geolocation schema for all entity types

ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS longitude numeric;

-- RLS is already enabled on affiliate_partners with existing policies:
-- affiliate_partners_select, affiliate_partners_insert,
-- affiliate_partners_update, affiliate_partners_delete
-- These table-level policies automatically cover the new columns.
-- No additional column-level policies are needed.

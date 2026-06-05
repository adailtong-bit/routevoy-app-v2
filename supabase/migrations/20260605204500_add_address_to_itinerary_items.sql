DO $$
BEGIN
  ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS address TEXT;
END $$;

DO $$
BEGIN
  -- Enforce TIMESTAMPTZ for start_time and end_time (Idempotent operation)
  ALTER TABLE public.itinerary_items ALTER COLUMN start_time TYPE TIMESTAMPTZ USING start_time::TIMESTAMPTZ;
  ALTER TABLE public.itinerary_items ALTER COLUMN end_time TYPE TIMESTAMPTZ USING end_time::TIMESTAMPTZ;
  
  -- Create index to optimize sorting and grouping by start_time
  CREATE INDEX IF NOT EXISTS idx_itinerary_items_start_time ON public.itinerary_items USING btree(start_time);
END $$;

DO $$
BEGIN
  -- Remove any pending, invalid or zero-priced promotions to sanitize the database.
  DELETE FROM public.discovered_promotions 
  WHERE status = 'pending' 
     OR price = 0 
     OR price IS NULL;
END $$;

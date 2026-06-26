DO $$
BEGIN
  UPDATE public.ad_campaigns 
  SET environment = 'production' 
  WHERE environment IS NULL OR environment = '';
END $$;

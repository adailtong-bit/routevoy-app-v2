DO $$
BEGIN
  -- Update ad_campaigns
  UPDATE public.ad_campaigns 
  SET environment = 'production' 
  WHERE environment IS NULL;

  -- Update discovered_promotions
  UPDATE public.discovered_promotions 
  SET environment = 'production' 
  WHERE environment IS NULL;
  
  -- Update coupons
  UPDATE public.coupons 
  SET environment = 'production' 
  WHERE environment IS NULL;
END $$;

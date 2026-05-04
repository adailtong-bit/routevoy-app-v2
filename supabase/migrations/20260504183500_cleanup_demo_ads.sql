DO $$
BEGIN
  -- Clean up campaigns that are linked to demo advertisers
  DELETE FROM public.ad_campaigns
  WHERE advertiser_id IN (
    SELECT id FROM public.ad_advertisers WHERE company_name ILIKE '%demonstra%'
  );

  -- Ensure any existing test data is moved to development environment
  UPDATE public.ad_campaigns
  SET environment = 'development'
  WHERE title ILIKE '%teste%' OR title ILIKE '%test%';
  
  UPDATE public.ad_advertisers
  SET environment = 'development'
  WHERE company_name ILIKE '%teste%' OR company_name ILIKE '%demonstra%';
END $$;

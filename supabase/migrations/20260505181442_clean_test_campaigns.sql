DO $$
BEGIN
  -- Remove campanhas e anúncios de teste da produção
  DELETE FROM public.ad_campaigns 
  WHERE title ILIKE '%teste%' 
     OR title ILIKE '%test %' 
     OR title ILIKE 'test' 
     OR title ILIKE 'cars'
     OR title ILIKE '%test campaign%';

  -- Remove cupons de teste da produção
  DELETE FROM public.coupons 
  WHERE title ILIKE '%teste%' 
     OR title ILIKE '%test %' 
     OR title ILIKE 'test' 
     OR title ILIKE 'cars'
     OR title ILIKE '%test campaign%';

  -- Remove promoções de teste da produção
  DELETE FROM public.discovered_promotions 
  WHERE title ILIKE '%teste%' 
     OR title ILIKE '%test %' 
     OR title ILIKE 'test' 
     OR title ILIKE 'cars'
     OR title ILIKE '%test campaign%'
     OR store_name ILIKE '%teste%';
END $$;

DO $DO$
BEGIN
  -- Mover campanhas de teste vazadas para o ambiente de desenvolvimento
  
  UPDATE public.coupons 
  SET environment = 'development'
  WHERE environment = 'production' 
  AND (
    title ILIKE '%teste%' OR 
    title ILIKE '%test%' OR 
    title ILIKE '%cars%' OR 
    store_name ILIKE '%teste%' OR
    store_name ILIKE '%test%'
  );

  UPDATE public.discovered_promotions 
  SET environment = 'development'
  WHERE environment = 'production' 
  AND (
    title ILIKE '%teste%' OR 
    title ILIKE '%test%' OR 
    title ILIKE '%cars%' OR 
    store_name ILIKE '%teste%' OR
    store_name ILIKE '%test%'
  );

  UPDATE public.ad_campaigns 
  SET environment = 'development'
  WHERE environment = 'production' 
  AND (
    title ILIKE '%teste%' OR 
    title ILIKE '%test%' OR 
    title ILIKE '%cars%' OR
    category ILIKE '%teste%'
  );

END $DO$;

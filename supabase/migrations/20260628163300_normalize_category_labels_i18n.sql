DO $$
BEGIN
  -- Normalize category labels from Portuguese to English
  UPDATE public.categories SET label = 'Food' WHERE label ILIKE '%Alimentação%';
  UPDATE public.categories SET label = 'Fashion' WHERE label ILIKE '%Moda%';
  UPDATE public.categories SET label = 'Services' WHERE label ILIKE '%Serviços%';
  UPDATE public.categories SET label = 'Electronics' WHERE label ILIKE '%Eletrônicos%';
  UPDATE public.categories SET label = 'Leisure' WHERE label ILIKE '%Lazer%';
  UPDATE public.categories SET label = 'Market' WHERE label ILIKE '%Mercado%';
  UPDATE public.categories SET label = 'Beauty' WHERE label ILIKE '%Beleza%';
  UPDATE public.categories SET label = 'Hotels' WHERE label ILIKE '%Hotéis%';
  UPDATE public.categories SET label = 'Travel' WHERE label ILIKE '%Viagens%';

  -- Normalize category names from Portuguese to English
  -- Only update if the English name does not already exist (unique constraint on name)
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'food') THEN
    UPDATE public.categories SET name = 'food' WHERE name ILIKE 'Alimentação';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'fashion') THEN
    UPDATE public.categories SET name = 'fashion' WHERE name ILIKE 'Moda';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'services') THEN
    UPDATE public.categories SET name = 'services' WHERE name ILIKE 'Serviços';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'electronics') THEN
    UPDATE public.categories SET name = 'electronics' WHERE name ILIKE 'Eletrônicos';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'leisure') THEN
    UPDATE public.categories SET name = 'leisure' WHERE name ILIKE 'Lazer';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'market') THEN
    UPDATE public.categories SET name = 'market' WHERE name ILIKE 'Mercado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'beauty') THEN
    UPDATE public.categories SET name = 'beauty' WHERE name ILIKE 'Beleza';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'hotels') THEN
    UPDATE public.categories SET name = 'hotels' WHERE name ILIKE 'Hotéis';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'travel') THEN
    UPDATE public.categories SET name = 'travel' WHERE name ILIKE 'Viagens';
  END IF;
END $$;

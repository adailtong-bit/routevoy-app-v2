DO $$
BEGIN
  -- Insert mock data for development environment
  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE unique_hash = 'dev-test-1') THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, store_name, discount, discount_percentage, status, environment, start_date, end_date, category, unique_hash, captured_at
    ) VALUES (
      gen_random_uuid(), 'Campanha de Teste - Burger King', '50% Off Burger', 'Burger King', '50%', 50, 'published', 'development', NOW(), NOW() + INTERVAL '30 days', 'Alimentação', 'dev-test-1', NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE unique_hash = 'dev-test-2') THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, store_name, discount, discount_percentage, status, environment, start_date, end_date, category, unique_hash, captured_at
    ) VALUES (
      gen_random_uuid(), 'Campanha de Teste - Tech Store', '10% Off Electronics', 'Tech Store', '10%', 10, 'published', 'development', NOW(), NOW() + INTERVAL '30 days', 'Eletrônicos', 'dev-test-2', NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE unique_hash = 'dev-test-3') THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, store_name, discount, discount_percentage, status, environment, start_date, end_date, category, unique_hash, captured_at
    ) VALUES (
      gen_random_uuid(), 'Campanha de Teste - Shoe Store', 'Buy 1 Get 1 Free Shoes', 'Shoe Store', '2 por 1', null, 'published', 'development', NOW(), NOW() + INTERVAL '30 days', 'Moda', 'dev-test-3', NOW()
    );
  END IF;
END $$;

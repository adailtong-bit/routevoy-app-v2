DO $$
BEGIN
  -- Insert seed categories if they don't already exist.
  -- This ensures the Bulk Generator and other dependent features have real data.
  INSERT INTO public.categories (id, name, label, status) VALUES
    (gen_random_uuid(), 'food', 'Alimentação', 'active'),
    (gen_random_uuid(), 'fashion', 'Moda', 'active'),
    (gen_random_uuid(), 'electronics', 'Eletrônicos', 'active'),
    (gen_random_uuid(), 'beauty', 'Beleza e Estética', 'active'),
    (gen_random_uuid(), 'services', 'Serviços', 'active'),
    (gen_random_uuid(), 'market', 'Mercados', 'active'),
    (gen_random_uuid(), 'leisure', 'Lazer e Diversão', 'active')
  ON CONFLICT (name) DO NOTHING;
END $$;

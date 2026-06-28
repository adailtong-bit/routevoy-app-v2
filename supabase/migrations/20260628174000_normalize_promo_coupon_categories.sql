DO $$
BEGIN
  -- Normalize discovered_promotions.category to English keys
  UPDATE discovered_promotions SET category = 'food' WHERE category ILIKE 'Alimentação' OR category ILIKE 'Alimentacion' OR category ILIKE 'Food % Dining' OR category ILIKE 'Food';
  UPDATE discovered_promotions SET category = 'general' WHERE category ILIKE 'Geral' OR category ILIKE 'General' OR category IS NULL OR category = '';
  UPDATE discovered_promotions SET category = 'fashion' WHERE category ILIKE 'Moda' OR category ILIKE 'Fashion';
  UPDATE discovered_promotions SET category = 'services' WHERE category ILIKE 'Serviços' OR category ILIKE 'Servicios' OR category ILIKE 'Services';
  UPDATE discovered_promotions SET category = 'electronics' WHERE category ILIKE 'Eletrônicos' OR category ILIKE 'Electrónica' OR category ILIKE 'Electronics';
  UPDATE discovered_promotions SET category = 'leisure' WHERE category ILIKE 'Lazer' OR category ILIKE 'Ocio' OR category ILIKE 'Leisure' OR category ILIKE 'Entretenimento' OR category ILIKE 'Entretenimiento' OR category ILIKE 'Entertainment';
  UPDATE discovered_promotions SET category = 'market' WHERE category ILIKE 'Mercado' OR category ILIKE 'Market';
  UPDATE discovered_promotions SET category = 'beauty' WHERE category ILIKE 'Beleza' OR category ILIKE 'Belleza' OR category ILIKE 'Beauty';
  UPDATE discovered_promotions SET category = 'health' WHERE category ILIKE 'Saúde' OR category ILIKE 'Salud' OR category ILIKE 'Health';
  UPDATE discovered_promotions SET category = 'education' WHERE category ILIKE 'Educação' OR category ILIKE 'Educación' OR category ILIKE 'Education';
  UPDATE discovered_promotions SET category = 'travel' WHERE category ILIKE 'Viagens' OR category ILIKE 'Viajes' OR category ILIKE 'Travel' OR category ILIKE 'Hotéis' OR category ILIKE 'Hoteles' OR category ILIKE 'Hotels';
  UPDATE discovered_promotions SET category = 'others' WHERE category ILIKE 'Outros' OR category ILIKE 'Otros' OR category ILIKE 'Others';
  UPDATE discovered_promotions SET category = 'retail' WHERE category ILIKE 'Varejo' OR category ILIKE 'Retail';

  -- Normalize coupons.category to English keys
  UPDATE coupons SET category = 'food' WHERE category ILIKE 'Alimentação' OR category ILIKE 'Alimentacion' OR category ILIKE 'Food % Dining' OR category ILIKE 'Food';
  UPDATE coupons SET category = 'general' WHERE category ILIKE 'Geral' OR category ILIKE 'General' OR category IS NULL OR category = '';
  UPDATE coupons SET category = 'fashion' WHERE category ILIKE 'Moda' OR category ILIKE 'Fashion';
  UPDATE coupons SET category = 'services' WHERE category ILIKE 'Serviços' OR category ILIKE 'Servicios' OR category ILIKE 'Services';
  UPDATE coupons SET category = 'electronics' WHERE category ILIKE 'Eletrônicos' OR category ILIKE 'Electrónica' OR category ILIKE 'Electronics';
  UPDATE coupons SET category = 'leisure' WHERE category ILIKE 'Lazer' OR category ILIKE 'Ocio' OR category ILIKE 'Leisure' OR category ILIKE 'Entretenimento' OR category ILIKE 'Entretenimiento' OR category ILIKE 'Entertainment';
  UPDATE coupons SET category = 'market' WHERE category ILIKE 'Mercado' OR category ILIKE 'Market';
  UPDATE coupons SET category = 'beauty' WHERE category ILIKE 'Beleza' OR category ILIKE 'Belleza' OR category ILIKE 'Beauty';
  UPDATE coupons SET category = 'health' WHERE category ILIKE 'Saúde' OR category ILIKE 'Salud' OR category ILIKE 'Health';
  UPDATE coupons SET category = 'education' WHERE category ILIKE 'Educação' OR category ILIKE 'Educación' OR category ILIKE 'Education';
  UPDATE coupons SET category = 'travel' WHERE category ILIKE 'Viagens' OR category ILIKE 'Viajes' OR category ILIKE 'Travel' OR category ILIKE 'Hotéis' OR category ILIKE 'Hoteles' OR category ILIKE 'Hotels';
  UPDATE coupons SET category = 'others' WHERE category ILIKE 'Outros' OR category ILIKE 'Otros' OR category ILIKE 'Others';
  UPDATE coupons SET category = 'retail' WHERE category ILIKE 'Varejo' OR category ILIKE 'Retail';
END $$;

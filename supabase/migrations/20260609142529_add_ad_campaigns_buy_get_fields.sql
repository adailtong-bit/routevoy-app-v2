DO $$
BEGIN
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS trigger_threshold NUMERIC;
  ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS reward_value NUMERIC;

  -- Seed data for testing the 3 promotion models correctly
  INSERT INTO public.discovered_promotions (
    id, title, description, promotion_model, discount_percentage,
    original_price, price, trigger_threshold, reward_value, is_seasonal,
    environment, status, unique_hash
  ) VALUES (
    '50000000-0000-0000-0000-000000000001'::uuid,
    'Standard Voucher Promo',
    'Get a fixed percentage off your entire order!',
    'standard',
    15,
    NULL, NULL, NULL, NULL, false,
    'production', 'active', 'seed_hash_1'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.discovered_promotions (
    id, title, description, promotion_model, discount_percentage,
    original_price, price, trigger_threshold, reward_value, is_seasonal,
    environment, status, unique_hash
  ) VALUES (
    '50000000-0000-0000-0000-000000000002'::uuid,
    'Pure Discount iPhone',
    'Massive discount on the new iPhone.',
    'pure_discount',
    200,
    1000, 800, NULL, NULL, true,
    'production', 'active', 'seed_hash_2'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.discovered_promotions (
    id, title, description, promotion_model, discount_percentage,
    original_price, price, trigger_threshold, reward_value, is_seasonal,
    environment, status, unique_hash
  ) VALUES (
    '50000000-0000-0000-0000-000000000003'::uuid,
    'Buy 2 Coffees Get 1 Free',
    'Spend $10 and get a $5 reward.',
    'buy_x_get_y',
    NULL,
    NULL, NULL, 10, 5, false,
    'production', 'active', 'seed_hash_3'
  ) ON CONFLICT (id) DO NOTHING;
END $$;

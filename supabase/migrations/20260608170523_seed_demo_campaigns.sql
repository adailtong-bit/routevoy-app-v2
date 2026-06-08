-- 1. Add missing geographic columns to discovered_promotions if they don't exist
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS location_name text;

DO $$
DECLARE
  v_hotel_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_museum_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  v_car_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  v_coupon_id uuid := '44444444-4444-4444-4444-444444444444'::uuid;
BEGIN
  -- Insert Hotel into discovered_promotions
  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE id = v_hotel_id) THEN
    INSERT INTO public.discovered_promotions (
      id, title, category, description, status, environment, 
      latitude, longitude, location_name,
      start_date, end_date, price, original_price, currency, store_name, image_url
    ) VALUES (
      v_hotel_id, 
      'Grand Luxury Hotel & Spa', 
      'hotel', 
      'Special 30% discount for itinerary testing.', 
      'active', 
      'development',
      40.7644, -73.9745, 'New York, NY',
      now(), now() + interval '30 days',
      299.00, 420.00, 'USD', 'Grand Luxury Hotels', 'https://img.usecurling.com/p/800/600?q=luxury%20hotel'
    );
  END IF;

  -- Insert Museum into discovered_promotions
  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE id = v_museum_id) THEN
    INSERT INTO public.discovered_promotions (
      id, title, category, description, status, environment, 
      latitude, longitude, location_name,
      start_date, end_date, price, original_price, currency, store_name, image_url
    ) VALUES (
      v_museum_id, 
      'Metropolitan Museum of Art - Fast Pass', 
      'museum', 
      'Skip-the-line experience for demo users.', 
      'active', 
      'development',
      40.7794, -73.9632, 'New York, NY',
      now(), now() + interval '30 days',
      25.00, 35.00, 'USD', 'The Met', 'https://img.usecurling.com/p/800/600?q=museum'
    );
  END IF;

  -- Insert Car Rental into discovered_promotions
  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE id = v_car_id) THEN
    INSERT INTO public.discovered_promotions (
      id, title, category, description, status, environment, 
      latitude, longitude, location_name,
      start_date, end_date, price, original_price, currency, store_name, image_url
    ) VALUES (
      v_car_id, 
      'Elite Car Rental - Convertible Special', 
      'car_rental', 
      'Exclusive weekend rate for trip testing.', 
      'active', 
      'development',
      40.6413, -73.7781, 'JFK Airport, NY',
      now(), now() + interval '30 days',
      89.00, 150.00, 'USD', 'Elite Car Rental', 'https://img.usecurling.com/p/800/600?q=convertible%20car'
    );
  END IF;

  -- Insert Coupon into coupons
  IF NOT EXISTS (SELECT 1 FROM public.coupons WHERE id = v_coupon_id) THEN
    INSERT INTO public.coupons (
      id, title, store_name, code, discount, environment, status,
      category, description, latitude, longitude, location_name, image_url,
      start_date, end_date
    ) VALUES (
      v_coupon_id,
      'Fashion Mall 20% Off',
      'Global Brands Store',
      'DEMO2024',
      '20% OFF',
      'development',
      'active',
      'shopping',
      'Get 20% off your entire purchase at Global Brands Store.',
      40.7580, -73.9855, 'Times Square, NY',
      'https://img.usecurling.com/p/800/600?q=fashion%20store',
      now(), now() + interval '30 days'
    );
  END IF;
END $$;

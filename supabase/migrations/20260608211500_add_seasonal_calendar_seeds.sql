DO $$
BEGIN
  -- Insert a mock seasonal campaign active now
  INSERT INTO public.discovered_promotions (
    id, title, description, is_seasonal, start_date, end_date, 
    status, store_name, image_url, environment, limit_type
  ) VALUES (
    'b73eb001-c817-48f8-8bb3-455b9e078ea5'::uuid,
    'Summer Clearance Sale',
    'Huge discounts on all summer items! Grab them before they are gone.',
    true,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'Mock Store',
    'https://img.usecurling.com/p/800/400?q=summer%20sale',
    'production',
    'unlimited'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert a mock seasonal campaign in the future
  INSERT INTO public.discovered_promotions (
    id, title, description, is_seasonal, start_date, end_date, 
    status, store_name, image_url, environment, limit_type
  ) VALUES (
    'e71957c5-555e-49b0-9db0-5a3962dc21d5'::uuid,
    'Black Friday Early Access',
    'Get early access to our Black Friday deals. Exclusive for registered users.',
    true,
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '70 days',
    'active',
    'Mock Store',
    'https://img.usecurling.com/p/800/400?q=black%20friday',
    'production',
    'unlimited'
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

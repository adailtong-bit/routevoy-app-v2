DO $$
BEGIN
  -- Insert some ad_campaigns for travel items to properly test categories
  INSERT INTO public.ad_campaigns (id, title, category, environment, status, image)
  VALUES 
    ('c1111111-1111-1111-1111-111111111111'::uuid, 'Localiza Rent a Car', 'Car Rental', 'production', 'active', 'https://img.usecurling.com/p/200/200?q=suv&color=green'),
    ('c2222222-2222-2222-2222-222222222222'::uuid, 'Hertz Car Rental', 'Transport', 'production', 'active', 'https://img.usecurling.com/p/200/200?q=car&color=blue'),
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'Louvre Museum Entry', 'Museum', 'production', 'active', 'https://img.usecurling.com/p/200/200?q=museum&color=gray'),
    ('e1111111-1111-1111-1111-111111111111'::uuid, 'Hilton Paris Opera', 'Hotel', 'production', 'active', 'https://img.usecurling.com/p/200/200?q=hotel&color=blue')
  ON CONFLICT (id) DO NOTHING;
END $$;

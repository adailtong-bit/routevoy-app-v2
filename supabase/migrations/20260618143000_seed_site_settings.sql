DO $$
BEGIN
  INSERT INTO public.site_settings (key, value)
  VALUES 
    ('system_config', '{"default_country": "United States", "default_currency": "USD", "default_language": "en"}'::jsonb),
    ('geo_hierarchy', '{"supported_countries": "US, BR", "default_radius": 50, "levels": "Country > State > City > Neighborhood"}'::jsonb),
    ('hero_content', '{"title": "Discover the Best Local Deals", "subtitle": "Find the best local offers right at your fingertips.", "cta_text": "Explore Offers"}'::jsonb),
    ('footer_content', '{"about": "", "company": "RouteVoy is your ultimate guide to finding local opportunities and seasonal events.", "mission": "Finding the best local deals and experiences near you.", "contact": "Email: contato@routevoy.com\nLocation: Global"}'::jsonb)
  ON CONFLICT (key) DO NOTHING;
END $$;

-- Add priority_score to ad_campaigns
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0;

-- Add last_search_context to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_search_context jsonb DEFAULT '{}'::jsonb;

-- Seed Ad Pricing
INSERT INTO public.ad_pricing (id, placement, billing_type, duration_days, price, environment)
VALUES 
  (gen_random_uuid(), 'home_hero', 'fixed', 7, 50.00, 'production'),
  (gen_random_uuid(), 'search_top', 'cpc', null, 0.50, 'production'),
  (gen_random_uuid(), 'category_top', 'fixed', 30, 150.00, 'production')
ON CONFLICT DO NOTHING;

-- Seed Admin User
DO $$
DECLARE
  admin_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (admin_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Seed Site Settings
INSERT INTO public.site_settings (key, value)
VALUES 
  ('ad_refresh_interval', '{"value": 300}'),
  ('admin_commission_rate', '{"value": 10}'),
  ('base_boost_price', '{"value": 25.00}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Orlando and Miami Campaigns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ad_campaigns WHERE title = 'Orlando Theme Park Deals') THEN
    INSERT INTO public.ad_campaigns (id, title, description, region, category, status, environment, priority_score, price)
    VALUES (gen_random_uuid(), 'Orlando Theme Park Deals', 'Best discounts for Orlando parks', 'Orlando', 'Travel', 'active', 'production', 10, 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ad_campaigns WHERE title = 'Miami Beach Resort Specials') THEN
    INSERT INTO public.ad_campaigns (id, title, description, region, category, status, environment, priority_score, price)
    VALUES (gen_random_uuid(), 'Miami Beach Resort Specials', 'Luxury stays in Miami', 'Miami', 'Hotels', 'active', 'production', 15, 200);
  END IF;
END $$;

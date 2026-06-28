-- Idempotent: Normalize remaining Portuguese category names to English equivalents
UPDATE public.categories SET name = 'food', label = 'Food' WHERE name ILIKE 'Alimentação' OR name ILIKE 'Alimentacion';
UPDATE public.categories SET name = 'hotels', label = 'Hotels' WHERE name ILIKE 'Hotéis' OR name ILIKE 'Hoteis';
UPDATE public.categories SET name = 'leisure', label = 'Leisure' WHERE name ILIKE 'Lazer';
UPDATE public.categories SET name = 'services', label = 'Services' WHERE name ILIKE 'Serviços' OR name ILIKE 'Servicios';
UPDATE public.categories SET name = 'retail', label = 'Retail' WHERE name ILIKE 'Varejo';

-- Also normalize category references in ad_campaigns for consistency
UPDATE ad_campaigns SET category = 'food' WHERE category ILIKE 'Alimentação' OR category ILIKE 'Alimentacion';
UPDATE ad_campaigns SET category = 'hotels' WHERE category ILIKE 'Hotéis' OR category ILIKE 'Hoteis';
UPDATE ad_campaigns SET category = 'leisure' WHERE category ILIKE 'Lazer';
UPDATE ad_campaigns SET category = 'services' WHERE category ILIKE 'Serviços' OR category ILIKE 'Servicios';
UPDATE ad_campaigns SET category = 'retail' WHERE category ILIKE 'Varejo';

-- Also normalize category references in discovered_promotions for consistency
UPDATE discovered_promotions SET category = 'food' WHERE category ILIKE 'Alimentação' OR category ILIKE 'Alimentacion';
UPDATE discovered_promotions SET category = 'hotels' WHERE category ILIKE 'Hotéis' OR category ILIKE 'Hoteis';
UPDATE discovered_promotions SET category = 'leisure' WHERE category ILIKE 'Lazer';
UPDATE discovered_promotions SET category = 'services' WHERE category ILIKE 'Serviços' OR category ILIKE 'Servicios';
UPDATE discovered_promotions SET category = 'retail' WHERE category ILIKE 'Varejo';

-- Also normalize category references in coupons for consistency
UPDATE coupons SET category = 'food' WHERE category ILIKE 'Alimentação' OR category ILIKE 'Alimentacion';
UPDATE coupons SET category = 'hotels' WHERE category ILIKE 'Hotéis' OR category ILIKE 'Hoteis';
UPDATE coupons SET category = 'leisure' WHERE category ILIKE 'Lazer';
UPDATE coupons SET category = 'services' WHERE category ILIKE 'Serviços' OR category ILIKE 'Servicios';
UPDATE coupons SET category = 'retail' WHERE category ILIKE 'Varejo';

-- Auth seed: Ensure adailtong@gmail.com exists with password Skip@Pass
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

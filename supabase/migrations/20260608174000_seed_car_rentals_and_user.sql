DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Seed Master User (Idempotent)
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
      '{"name": "Adailton Master", "role": "super_admin"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Seed Car Rental Ads
  INSERT INTO public.ad_campaigns (id, title, category, description, placement, status, image, link, price, currency, environment)
  VALUES
    (gen_random_uuid(), 'AutoVia Rent - Compact', 'car_rental', 'Aluguel de carro compacto perfeito para a cidade. Economize combustível e viaje tranquilo.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=compact%20car', 'https://routevoy.com/cars', 89.90, 'BRL', 'production'),
    (gen_random_uuid(), 'CityDrive - SUV', 'car_rental', 'Espaço e conforto para toda a família. Alugue um SUV para sua próxima aventura.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=suv%20car', 'https://routevoy.com/cars', 150.00, 'BRL', 'production'),
    (gen_random_uuid(), 'LuxoMotors - Premium', 'car_rental', 'Chegue com estilo. Veículos de luxo com seguro incluso e quilometragem livre.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=luxury%20car', 'https://routevoy.com/cars', 300.00, 'BRL', 'production'),
    (gen_random_uuid(), 'EcoRent - Elétrico', 'car_rental', 'Sustentabilidade e tecnologia. Alugue um carro 100% elétrico.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=electric%20car', 'https://routevoy.com/cars', 200.00, 'BRL', 'production'),
    (gen_random_uuid(), 'VanGo - Minivan 7 Lugares', 'car_rental', 'Viajando em grupo? Nossa minivan acomoda todos com conforto.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=minivan', 'https://routevoy.com/cars', 250.00, 'BRL', 'production'),
    
    (gen_random_uuid(), 'AutoVia Rent - Compact (Dev)', 'car_rental', 'Aluguel de carro compacto.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=compact%20car', 'https://routevoy.com/cars', 89.90, 'BRL', 'development'),
    (gen_random_uuid(), 'CityDrive - SUV (Dev)', 'car_rental', 'SUV espaçoso.', 'feed', 'active', 'https://img.usecurling.com/p/400/300?q=suv%20car', 'https://routevoy.com/cars', 150.00, 'BRL', 'development')
  ON CONFLICT (id) DO NOTHING;
END $$;

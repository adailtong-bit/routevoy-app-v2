DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed adailtong@gmail.com if not exists
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;

  -- Insert or update footer_content in site_settings
  INSERT INTO public.site_settings (key, value)
  VALUES (
    'footer_content',
    '{
      "en": {
        "about": "We are a platform dedicated to bringing the best deals and opportunities to our users through geolocation.",
        "company": "Routevoy Inc. is a technology company focused on connecting local businesses with consumers.",
        "mission": "Our mission is to empower local commerce and help users save money on their everyday purchases.",
        "contact": "Email: contact@routevoy.com\nPhone: +1 234 567 8900\nAddress: 123 Tech Street, Suite 456, City, Country"
      },
      "pt": {
        "about": "Somos uma plataforma dedicada a trazer as melhores ofertas e oportunidades aos nossos usuários através da geolocalização.",
        "company": "Routevoy Inc. é uma empresa de tecnologia focada em conectar empresas locais aos consumidores.",
        "mission": "Nossa missão é fortalecer o comércio local e ajudar os usuários a economizar em suas compras diárias.",
        "contact": "Email: contact@routevoy.com\nTelefone: +1 234 567 8900\nEndereço: 123 Tech Street, Suite 456, City, Country"
      }
    }'::jsonb
  )
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value;
END $$;

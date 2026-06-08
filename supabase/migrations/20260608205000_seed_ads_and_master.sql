DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user adailtong@gmail.com
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
      '{"name": "Adailton Master", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE email = 'adailtong@gmail.com';
  END IF;

  -- Seed Ad Pricing: "Top Ranking" / "Impulsionamento Interno (Cupom)" price 20.00, 30 dias
  IF NOT EXISTS (
    SELECT 1 FROM public.ad_pricing 
    WHERE placement = 'top_ranking' 
      AND billing_type = 'internal_boost' 
      AND environment = 'global'
  ) THEN
    INSERT INTO public.ad_pricing (id, placement, billing_type, price, duration_days, environment)
    VALUES (
      gen_random_uuid(),
      'top_ranking',
      'internal_boost',
      20.00,
      30,
      'global'
    );
  END IF;
  
END $$;

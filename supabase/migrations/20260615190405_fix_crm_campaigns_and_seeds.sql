DO $$
DECLARE
  new_user_id uuid;
  company_uuid uuid;
  ad_campaign_uuid uuid;
BEGIN
  -- Seed user
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Ensure profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new_user_id) THEN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin');
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE id = new_user_id;
  END IF;

  -- Create a dummy company for testing "Linked Offer"
  SELECT id INTO company_uuid FROM public.companies WHERE name = 'Dummy Company' LIMIT 1;
  IF company_uuid IS NULL THEN
    company_uuid := gen_random_uuid();
    INSERT INTO public.companies (id, name, email, region, status)
    VALUES (company_uuid, 'Dummy Company', 'dummy@example.com', 'BR', 'active');
  END IF;

  SELECT id INTO ad_campaign_uuid FROM public.ad_campaigns WHERE title = 'Dummy Active Campaign' LIMIT 1;
  IF ad_campaign_uuid IS NULL THEN
    ad_campaign_uuid := gen_random_uuid();
    INSERT INTO public.ad_campaigns (id, company_id, title, region, category, billing_type, placement, status, start_date, end_date, image, link)
    VALUES (ad_campaign_uuid, company_uuid, 'Dummy Active Campaign', 'BR', 'general', 'fixed', 'home_hero', 'active', NOW(), NOW() + INTERVAL '30 days', 'https://img.usecurling.com/p/400/200?q=campaign', 'https://example.com');
  END IF;
END $$;

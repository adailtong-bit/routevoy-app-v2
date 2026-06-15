DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  -- Add columns if missing
  ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS geographic_scope TEXT DEFAULT 'local';
  ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS randomization_type TEXT;
  ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS randomization_value NUMERIC;
  ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
  ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT true;
  ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

  -- Ensure test user adailtong@gmail.com exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Ensure company exists
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE owner_id = v_user_id LIMIT 1) THEN
    v_company_id := gen_random_uuid();
    INSERT INTO public.companies (
      id, name, owner_id, email, status, region, enable_loyalty, registration_date
    ) VALUES (
      v_company_id, 'Test Company', v_user_id, 'test@company.com', 'active', 'BR', false, NOW()
    );
  ELSE
    SELECT id INTO v_company_id FROM public.companies WHERE owner_id = v_user_id LIMIT 1;
  END IF;

  -- Create a standard ad_campaign to link to CRM campaigns
  INSERT INTO public.ad_campaigns (
    id, title, description, category, company_id, status, environment, promotion_model
  )
  SELECT 
    gen_random_uuid(),
    'Standard Public Campaign',
    'A public campaign to test Link Offer functionality.',
    'General',
    v_company_id,
    'active',
    'production',
    'standard'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ad_campaigns WHERE company_id = v_company_id LIMIT 1
  );

END $$;

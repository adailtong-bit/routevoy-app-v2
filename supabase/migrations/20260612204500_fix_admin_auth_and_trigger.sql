DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Fix any nulls in auth.users tokens first to avoid GoTrue bug (error 500)
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- Check if user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  
  IF v_user_id IS NULL THEN
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    -- Reset password just in case it's wrong, and set meta data
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
      raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
    WHERE id = v_user_id;
  END IF;

  -- Insert or update profile ensuring it has 'admin' role
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Admin', 'admin', false)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', name = 'Admin';

END $$;

-- Fix the trigger function to use ON CONFLICT (id) DO UPDATE properly
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
  v_name text;
  v_is_affiliate boolean;
  v_tax_id text;
  v_company_id text := NULL;
  v_merchant_id text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_is_affiliate := (v_role = 'affiliate');
  v_tax_id := NEW.raw_user_meta_data->>'tax_id';

  -- Handle merchant
  IF v_role IN ('merchant', 'shopkeeper') THEN
    SELECT id::text INTO v_merchant_id FROM public.merchants WHERE email = NEW.email LIMIT 1;
    IF v_merchant_id IS NULL THEN
      v_merchant_id := gen_random_uuid()::text;
      INSERT INTO public.merchants (id, name, email, status)
      VALUES (v_merchant_id, v_name || ' Store', NEW.email, 'active')
      ON CONFLICT (id) DO NOTHING;
    END IF;
    v_company_id := v_merchant_id;
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    v_is_affiliate,
    v_tax_id,
    v_company_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    is_affiliate = COALESCE(public.profiles.is_affiliate, EXCLUDED.is_affiliate),
    tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id),
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id);

  -- Handle affiliate
  IF v_role = 'affiliate' THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      v_name,
      'active',
      v_tax_id
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        tax_id = COALESCE(public.affiliate_partners.tax_id, EXCLUDED.tax_id);
  END IF;

  -- Handle franchisee
  IF v_role = 'franchisee' THEN
    IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = NEW.email) THEN
      INSERT INTO public.franchises (id, name, email)
      VALUES (gen_random_uuid()::text, v_name || ' Franchise', NEW.email);
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

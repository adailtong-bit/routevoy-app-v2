-- Fix auth tokens containing NULL which causes Supabase GoTrue crashes
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

-- Ensure triggers logic maps to corresponding tables robustly
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
  v_franchise_id text := NULL;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_is_affiliate := (v_role = 'affiliate');
  v_tax_id := NEW.raw_user_meta_data->>'tax_id';

  -- Auto-link existing company by email
  SELECT id::text INTO v_merchant_id FROM public.merchants WHERE email = NEW.email LIMIT 1;
  IF v_merchant_id IS NOT NULL THEN
    v_company_id := v_merchant_id;
    IF v_role = 'user' THEN v_role := 'merchant'; END IF;
  END IF;

  -- Auto-link existing franchise by email
  SELECT id INTO v_franchise_id FROM public.franchises WHERE email = NEW.email LIMIT 1;
  IF v_franchise_id IS NOT NULL THEN
    IF v_role = 'user' THEN v_role := 'franchisee'; END IF;
  END IF;

  -- Create merchant if requested and doesn't exist
  IF v_role IN ('merchant', 'shopkeeper') AND v_company_id IS NULL THEN
    v_merchant_id := gen_random_uuid()::text;
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_merchant_id, v_name || ' Store', NEW.email, 'active')
    ON CONFLICT (id) DO NOTHING;
    v_company_id := v_merchant_id;
  END IF;

  -- Create franchise if requested and doesn't exist
  IF v_role = 'franchisee' AND v_franchise_id IS NULL THEN
    v_franchise_id := gen_random_uuid()::text;
    INSERT INTO public.franchises (id, name, email, status)
    VALUES (v_franchise_id, v_name || ' Franchise', NEW.email, 'active');
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id, company_id, franchise_id)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    v_is_affiliate,
    v_tax_id,
    v_company_id,
    v_franchise_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = CASE WHEN public.profiles.name IS NULL OR public.profiles.name = '' THEN EXCLUDED.name ELSE public.profiles.name END,
    role = EXCLUDED.role,
    is_affiliate = EXCLUDED.is_affiliate,
    tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id),
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    franchise_id = COALESCE(public.profiles.franchise_id, EXCLUDED.franchise_id);

  -- Handle affiliate partner
  IF v_role = 'affiliate' OR v_is_affiliate THEN
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

  RETURN NEW;
END;
$function$;

-- Seed the system with reliable test users
DO $BODY$
DECLARE
  v_admin_id uuid;
  v_merchant_id uuid;
  v_franchisee_id uuid;
  v_affiliate_id uuid;
  v_company_id text;
  v_franchise_id text;
  v_affiliate_partner_id uuid := gen_random_uuid();
BEGIN
  
  -- 1. Master Admin Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- 2. Test Merchant Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'merchant-test@example.com') THEN
    v_merchant_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_merchant_id, '00000000-0000-0000-0000-000000000000', 'merchant-test@example.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Test Merchant", "role": "merchant"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_merchant_id FROM auth.users WHERE email = 'merchant-test@example.com';
  END IF;

  SELECT id INTO v_company_id FROM public.merchants WHERE email = 'merchant-test@example.com';
  IF v_company_id IS NULL THEN
    v_company_id := gen_random_uuid()::text;
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_company_id, 'Test Merchant Store', 'merchant-test@example.com', 'active');
  END IF;

  INSERT INTO public.profiles (id, email, name, role, company_id)
  VALUES (v_merchant_id, 'merchant-test@example.com', 'Test Merchant', 'merchant', v_company_id)
  ON CONFLICT (id) DO UPDATE SET role = 'merchant', company_id = v_company_id;

  -- 3. Test Franchisee Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'franchisee-test@example.com') THEN
    v_franchisee_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_franchisee_id, '00000000-0000-0000-0000-000000000000', 'franchisee-test@example.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Test Franchisee", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_franchisee_id FROM auth.users WHERE email = 'franchisee-test@example.com';
  END IF;

  SELECT id INTO v_franchise_id FROM public.franchises WHERE email = 'franchisee-test@example.com';
  IF v_franchise_id IS NULL THEN
    v_franchise_id := gen_random_uuid()::text;
    INSERT INTO public.franchises (id, name, email, status)
    VALUES (v_franchise_id, 'Test Franchise Region', 'franchisee-test@example.com', 'active');
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_franchisee_id, 'franchisee-test@example.com', 'Test Franchisee', 'franchisee', v_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee', franchise_id = v_franchise_id;

  -- 4. Test Affiliate Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'affiliate-test@example.com') THEN
    v_affiliate_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_affiliate_id, '00000000-0000-0000-0000-000000000000', 'affiliate-test@example.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Test Affiliate", "role": "affiliate"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_affiliate_id FROM auth.users WHERE email = 'affiliate-test@example.com';
  END IF;

  INSERT INTO public.affiliate_partners (id, name, email, user_id, status)
  VALUES (v_affiliate_partner_id, 'Test Affiliate Partner', 'affiliate-test@example.com', v_affiliate_id, 'active')
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_affiliate_id, 'affiliate-test@example.com', 'Test Affiliate', 'affiliate', true)
  ON CONFLICT (id) DO UPDATE SET role = 'affiliate', is_affiliate = true;

  -- 5. Retroactive Linkage
  UPDATE public.profiles p
  SET company_id = m.id::text,
      role = CASE WHEN p.role = 'user' THEN 'merchant' ELSE p.role END
  FROM public.merchants m
  WHERE p.email = m.email AND p.company_id IS NULL;

  UPDATE public.profiles p
  SET franchise_id = f.id,
      role = CASE WHEN p.role = 'user' THEN 'franchisee' ELSE p.role END
  FROM public.franchises f
  WHERE p.email = f.email AND p.franchise_id IS NULL;

  UPDATE public.affiliate_partners a
  SET user_id = p.id
  FROM public.profiles p
  WHERE a.email = p.email AND a.user_id IS NULL;

  UPDATE public.profiles p
  SET is_affiliate = true,
      role = CASE WHEN p.role = 'user' THEN 'affiliate' ELSE p.role END
  FROM public.affiliate_partners a
  WHERE p.email = a.email AND (p.is_affiliate IS FALSE OR p.is_affiliate IS NULL);

END $BODY$;

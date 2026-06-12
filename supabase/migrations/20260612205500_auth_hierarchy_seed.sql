DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id text := 'franchise-test-01';
  v_merchant_id text := 'merchant-test-01';
  v_affiliate_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  -- 1. Insert into auth.users (if not exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Super Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- 2. Create Franchise
  INSERT INTO public.franchises (id, name, email, status, region)
  VALUES (v_franchise_id, 'Franquia Mestra Teste', 'adailtong@gmail.com', 'active', 'Nacional')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Create Merchant
  INSERT INTO public.merchants (id, name, email, status, franchise_id, region)
  VALUES (v_merchant_id, 'Lojista Teste', 'merchant@teste.com', 'active', v_franchise_id, 'Nacional')
  ON CONFLICT (id) DO NOTHING;

  -- 4. Create Affiliate
  INSERT INTO public.affiliate_partners (id, name, email, status, franchise_id, user_id)
  VALUES (v_affiliate_id, 'Afiliado Teste', 'afiliado@teste.com', 'active', v_franchise_id, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Update profiles for super_admin
  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton Super Admin', 'super_admin', v_franchise_id)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', franchise_id = v_franchise_id;

END $$;

-- Trigger correction for handling hierarchy links
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_name text;
  v_is_affiliate boolean;
  v_tax_id text;
  v_company_id text := NULL;
  v_merchant_id text;
  v_franchise_id text := NULL;
  v_email_lower text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_is_affiliate := (v_role = 'affiliate');
  v_tax_id := NEW.raw_user_meta_data->>'tax_id';
  v_email_lower := lower(NEW.email);

  -- Admin Override for specific email
  IF v_email_lower = 'adailtong@gmail.com' THEN
    v_role := 'super_admin';
  END IF;

  -- Auto-link existing company by email (case-insensitive)
  SELECT id::text INTO v_merchant_id FROM public.merchants WHERE lower(email) = v_email_lower LIMIT 1;
  IF v_merchant_id IS NOT NULL THEN
    v_company_id := v_merchant_id;
    IF v_role = 'user' THEN v_role := 'merchant'; END IF;
  END IF;

  -- Auto-link existing franchise by email (case-insensitive)
  SELECT id INTO v_franchise_id FROM public.franchises WHERE lower(email) = v_email_lower LIMIT 1;
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
    role = CASE WHEN EXCLUDED.role IN ('super_admin', 'admin', 'franchisee', 'merchant', 'shopkeeper', 'affiliate') THEN EXCLUDED.role ELSE public.profiles.role END,
    is_affiliate = EXCLUDED.is_affiliate,
    tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id),
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    franchise_id = COALESCE(public.profiles.franchise_id, EXCLUDED.franchise_id);

  -- Handle affiliate partner
  IF v_role = 'affiliate' OR v_is_affiliate THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id, franchise_id)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      v_name,
      'active',
      v_tax_id,
      v_franchise_id
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        tax_id = COALESCE(public.affiliate_partners.tax_id, EXCLUDED.tax_id),
        franchise_id = COALESCE(public.affiliate_partners.franchise_id, EXCLUDED.franchise_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

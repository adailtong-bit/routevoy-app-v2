-- 1. Optimize handle_new_user_after function
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

-- 2. Ensure robust admin access policies explicitly using email check fallback
DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
CREATE POLICY "admin_all_ad_campaigns_override" ON public.ad_campaigns FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) OR auth.jwt()->>'email' = 'adailtong@gmail.com');

DROP POLICY IF EXISTS "admin_all_coupons_override" ON public.coupons;
CREATE POLICY "admin_all_coupons_override" ON public.coupons FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) OR auth.jwt()->>'email' = 'adailtong@gmail.com');

DROP POLICY IF EXISTS "admin_all_merchants_override" ON public.merchants;
CREATE POLICY "admin_all_merchants_override" ON public.merchants FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) OR auth.jwt()->>'email' = 'adailtong@gmail.com');

DROP POLICY IF EXISTS "admin_all_franchises_override" ON public.franchises;
CREATE POLICY "admin_all_franchises_override" ON public.franchises FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) OR auth.jwt()->>'email' = 'adailtong@gmail.com');

-- 3. Seed Hierarchy Data
DO $$
DECLARE
  v_admin_id uuid;
  v_fran_user_id uuid;
  v_merch_user_id uuid;
  v_aff_user_id uuid;
  v_franchise_id text := 'fran-modelo-001';
  v_merchant_id text := 'merch-modelo-001';
  v_affiliate_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
BEGIN
  -- Insert Master Admin (idempotent via email)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton Master", "role": "super_admin"}', true, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- Create Franchise
  INSERT INTO public.franchises (id, name, email, region, status)
  VALUES (v_franchise_id, 'Franquia Modelo', 'franqueado_teste@example.com', 'São Paulo', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Create Merchant linked to Franchise
  INSERT INTO public.merchants (id, name, email, franchise_id, status)
  VALUES (v_merchant_id, 'Loja Modelo', 'lojista_teste@example.com', v_franchise_id, 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Franchisee User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'franqueado_teste@example.com') THEN
    v_fran_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_fran_user_id, '00000000-0000-0000-0000-000000000000', 'franqueado_teste@example.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Franqueado Teste", "role": "franchisee", "franchise_id": "fran-modelo-001"}', false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Insert Merchant User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lojista_teste@example.com') THEN
    v_merch_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_merch_user_id, '00000000-0000-0000-0000-000000000000', 'lojista_teste@example.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista Teste", "role": "merchant", "company_id": "merch-modelo-001"}', false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Insert Affiliate User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'afiliado_teste@example.com') THEN
    v_aff_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_aff_user_id, '00000000-0000-0000-0000-000000000000', 'afiliado_teste@example.com', crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Afiliado Teste", "role": "affiliate"}', false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_aff_user_id FROM auth.users WHERE email = 'afiliado_teste@example.com';
  END IF;
  
  -- Create Affiliate Partner linked to Franchise
  INSERT INTO public.affiliate_partners (id, user_id, name, email, franchise_id, status)
  VALUES (v_affiliate_id, v_aff_user_id, 'Afiliado Teste', 'afiliado_teste@example.com', v_franchise_id, 'active')
  ON CONFLICT (email) DO UPDATE SET franchise_id = EXCLUDED.franchise_id, user_id = EXCLUDED.user_id;

END $$;

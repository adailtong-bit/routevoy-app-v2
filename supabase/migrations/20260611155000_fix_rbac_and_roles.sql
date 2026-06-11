DO $$
BEGIN

-- Drop existing policies that might need fixing
DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "affiliate_own_record" ON public.affiliate_partners;
DROP POLICY IF EXISTS "merchant_own_record" ON public.merchants;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;

-- Recreate with explicit type casting and improved checks
CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.company_id = (ad_campaigns.company_id)::text
));

CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'franchisee' 
  AND (ad_campaigns.company_id)::text IN (
    SELECT m.id::text FROM public.merchants m WHERE m.franchise_id = profiles.franchise_id
  )
));

CREATE POLICY "affiliate_own_record" ON public.affiliate_partners
FOR ALL TO authenticated
USING (
  user_id = auth.uid() OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid() OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "merchant_own_record" ON public.merchants
FOR ALL TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.company_id = merchants.id::text
  ))
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.company_id = merchants.id::text
  ))
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "admin_all_profiles" ON public.profiles
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() 
  AND p.role IN ('admin', 'super_admin')
));

END $$;

-- Fix handle_new_user_after trigger to be more robust
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
      VALUES (v_merchant_id, v_name || ' Store', NEW.email, 'active');
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
$;

-- Fix test users missing properties and seed them correctly
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Test Affiliate
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_afiliado@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'test_afiliado@example.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Test Affiliate", "role": "affiliate"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Test Merchant
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_lojista@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'test_lojista@example.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Test Merchant", "role": "merchant"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
  
  -- Test Franchisee
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'test_franqueado@example.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Test Franchisee", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

-- Run a backfill for existing affiliate users to ensure they have an affiliate_partners record
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN 
    SELECT p.id, p.email, p.name 
    FROM public.profiles p 
    LEFT JOIN public.affiliate_partners ap ON p.id = ap.user_id 
    WHERE (p.role = 'affiliate' OR p.is_affiliate = true) AND ap.id IS NULL
  LOOP
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
    VALUES (gen_random_uuid(), rec.id, rec.email, COALESCE(rec.name, 'Afiliado ' || split_part(rec.email, '@', 1)), 'active')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
  END LOOP;
END $$;

-- Ensure merchants exist for profiles with 'merchant' role without company_id
DO $$
DECLARE
  rec record;
  v_merchant_id text;
BEGIN
  FOR rec IN 
    SELECT p.id, p.email, p.name 
    FROM public.profiles p 
    WHERE p.role IN ('merchant', 'shopkeeper') AND p.company_id IS NULL
  LOOP
    v_merchant_id := gen_random_uuid()::text;
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_merchant_id, COALESCE(rec.name, 'Lojista') || ' Store', rec.email, 'active')
    ON CONFLICT DO NOTHING;
    
    UPDATE public.profiles SET company_id = v_merchant_id WHERE id = rec.id;
  END LOOP;
END $$;

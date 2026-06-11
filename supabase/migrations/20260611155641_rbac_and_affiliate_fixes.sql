DO $DO_BLOCK$
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Administrador', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    -- If user exists, ensure profile role is super_admin
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $DO_BLOCK$;

-- Update policies for affiliate_partners
DROP POLICY IF EXISTS "affiliate_own_record" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_insert_own_record" ON public.affiliate_partners;

CREATE POLICY "affiliate_own_record" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING ((user_id = auth.uid()) OR (email = (SELECT email FROM auth.users WHERE id = auth.uid())))
  WITH CHECK ((user_id = auth.uid()) OR (email = (SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "affiliate_insert_own_record" ON public.affiliate_partners
  FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()) OR (email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Update policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Update policies for merchants
DROP POLICY IF EXISTS "merchant_own_record" ON public.merchants;

CREATE POLICY "merchant_own_record" ON public.merchants
  FOR ALL TO authenticated
  USING (
    (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL))
    OR (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
  )
  WITH CHECK (
    (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL))
    OR (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
  );

-- Fix trigger handle_new_user_after
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
$function$;

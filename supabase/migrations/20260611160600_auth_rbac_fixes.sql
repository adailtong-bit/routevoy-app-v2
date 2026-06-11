DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed adailtong@gmail.com
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin', true)
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_affiliate = true;

  -- Ensure affiliate partner exists
  INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
  VALUES (gen_random_uuid(), v_user_id, 'adailtong@gmail.com', 'Adailton Affiliate', 'active')
  ON CONFLICT (email) DO UPDATE SET user_id = v_user_id, status = 'active';

END $$;

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "franchisee_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own_record" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "public_read_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_update" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_insert" ON public.affiliate_partners;

DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchant_own_record" ON public.merchants;
DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchants_select" ON public.merchants;
DROP POLICY IF EXISTS "merchants_update" ON public.merchants;
DROP POLICY IF EXISTS "merchants_insert" ON public.merchants;

-- Recreate Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR role IN ('admin', 'super_admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Recreate Affiliate Partners Policies
CREATE POLICY "affiliate_partners_select" ON public.affiliate_partners FOR SELECT TO authenticated USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email') OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "affiliate_partners_update" ON public.affiliate_partners FOR UPDATE TO authenticated USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email')) WITH CHECK (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'));
CREATE POLICY "affiliate_partners_insert" ON public.affiliate_partners FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'));

-- Recreate Merchants Policies
CREATE POLICY "merchants_select" ON public.merchants FOR SELECT TO authenticated USING (
  email = (auth.jwt() ->> 'email') 
  OR id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "merchants_update" ON public.merchants FOR UPDATE TO authenticated USING (
  email = (auth.jwt() ->> 'email') 
  OR id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL)
) WITH CHECK (
  email = (auth.jwt() ->> 'email') 
  OR id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND company_id IS NOT NULL)
);
CREATE POLICY "merchants_insert" ON public.merchants FOR INSERT TO authenticated WITH CHECK (true);

-- Ensure the trigger handle_new_user_after is correctly installed
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

DROP TRIGGER IF EXISTS on_auth_user_created_after ON auth.users;
CREATE TRIGGER on_auth_user_created_after
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_after();

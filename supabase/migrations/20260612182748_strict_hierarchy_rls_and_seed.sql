-- Standardize RLS for merchants
DROP POLICY IF EXISTS "admin_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
DROP POLICY IF EXISTS "franchisee_manage_merchants" ON public.merchants;
DROP POLICY IF EXISTS "merchants_insert" ON public.merchants;
DROP POLICY IF EXISTS "merchants_select" ON public.merchants;
DROP POLICY IF EXISTS "merchants_update" ON public.merchants;
DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;

CREATE POLICY "admin_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = merchants.franchise_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND (profiles.franchise_id = merchants.franchise_id OR merchants.franchise_id IS NULL)));

CREATE POLICY "merchant_own_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id::text))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = merchants.id::text));

CREATE POLICY "public_read_merchants" ON public.merchants
  FOR SELECT TO public
  USING (status = 'active');


-- Standardize RLS for affiliate_partners
DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_insert" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_update" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_manage_affiliate_partners" ON public.affiliate_partners;

CREATE POLICY "admin_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND (profiles.franchise_id = affiliate_partners.franchise_id OR affiliate_partners.franchise_id IS NULL)));

CREATE POLICY "affiliate_own" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- Standardize RLS for profiles
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "franchisee_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "merchant_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;

CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'franchisee' AND p.franchise_id = profiles.franchise_id));

CREATE POLICY "merchant_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('merchant', 'shopkeeper') AND p.company_id = profiles.company_id));

CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Standardize RLS for franchises
DROP POLICY IF EXISTS "auth_all_franchises" ON public.franchises;
DROP POLICY IF EXISTS "authenticated_select_own_franchise" ON public.franchises;
DROP POLICY IF EXISTS "franchisee_select_own_franchise" ON public.franchises;
DROP POLICY IF EXISTS "public_read_franchises" ON public.franchises;
DROP POLICY IF EXISTS "admin_all_franchises" ON public.franchises;
DROP POLICY IF EXISTS "franchisee_own_franchise" ON public.franchises;

CREATE POLICY "admin_all_franchises" ON public.franchises
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY "franchisee_own_franchise" ON public.franchises
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' AND profiles.franchise_id = franchises.id));

CREATE POLICY "public_read_franchises" ON public.franchises
  FOR SELECT TO public
  USING (true);

-- Add status to franchises if missing
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Seed Data using DO block for idempotent inserts
DO $DO_BLOCK$
DECLARE
  admin_id uuid := gen_random_uuid();
  franchisee_id uuid := gen_random_uuid();
  merchant_id uuid := gen_random_uuid();
  affiliate_id uuid := gen_random_uuid();
  new_franchise_id text := gen_random_uuid()::text;
  new_company_id text := gen_random_uuid()::text;
BEGIN
  -- Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Master", "role": "super_admin"}',
      '','','','','','','','');
      
    INSERT INTO public.profiles (id, email, name, role) VALUES (admin_id, 'adailtong@gmail.com', 'Admin Master', 'super_admin') ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Franchisee User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'franchisee@routevoy.com') THEN
    INSERT INTO public.franchises (id, name, email, status) VALUES (new_franchise_id, 'Franquia SP Capital', 'franchisee@routevoy.com', 'active') ON CONFLICT DO NOTHING;

    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (franchisee_id, '00000000-0000-0000-0000-000000000000', 'franchisee@routevoy.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{"name": "Franqueado SP", "role": "franchisee"}',
      '','','','','','','','');
      
    INSERT INTO public.profiles (id, email, name, role, franchise_id) VALUES (franchisee_id, 'franchisee@routevoy.com', 'Franqueado SP', 'franchisee', new_franchise_id) ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT franchise_id INTO new_franchise_id FROM public.profiles WHERE email = 'franchisee@routevoy.com' LIMIT 1;
  END IF;

  -- Merchant User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'merchant@routevoy.com') THEN
    INSERT INTO public.merchants (id, name, email, status, franchise_id) VALUES (new_company_id, 'Loja Exemplo SP', 'merchant@routevoy.com', 'active', new_franchise_id) ON CONFLICT DO NOTHING;

    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (merchant_id, '00000000-0000-0000-0000-000000000000', 'merchant@routevoy.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista SP", "role": "merchant"}',
      '','','','','','','','');
      
    INSERT INTO public.profiles (id, email, name, role, franchise_id, company_id) VALUES (merchant_id, 'merchant@routevoy.com', 'Lojista SP', 'merchant', new_franchise_id, new_company_id) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Affiliate User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'affiliate@routevoy.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (affiliate_id, '00000000-0000-0000-0000-000000000000', 'affiliate@routevoy.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{"name": "Afiliado SP", "role": "affiliate"}',
      '','','','','','','','');
      
    INSERT INTO public.profiles (id, email, name, role, franchise_id, is_affiliate) VALUES (affiliate_id, 'affiliate@routevoy.com', 'Afiliado SP', 'affiliate', new_franchise_id, true) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, franchise_id) VALUES (gen_random_uuid(), affiliate_id, 'affiliate@routevoy.com', 'Afiliado SP', 'active', new_franchise_id) ON CONFLICT DO NOTHING;
  END IF;

END $DO_BLOCK$;

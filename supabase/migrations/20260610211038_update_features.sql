DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token)
    VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin", "role": "super_admin"}', false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', '');
    INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin') ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Merchant
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_lojista@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token)
    VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'test_lojista@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista Teste", "role": "merchant"}', false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', '');
    INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'test_lojista@example.com', 'Lojista Teste', 'merchant') ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Franchisee
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token)
    VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'test_franqueado@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Franqueado Teste", "role": "franchisee"}', false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', '');
    INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'test_franqueado@example.com', 'Franqueado Teste', 'franchisee') ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Affiliate
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_afiliado@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token)
    VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'test_afiliado@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Afiliado Teste", "role": "affiliate"}', false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', '');
    INSERT INTO public.profiles (id, email, name, role, is_affiliate) VALUES (new_user_id, 'test_afiliado@example.com', 'Afiliado Teste', 'affiliate', true) ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status) VALUES (gen_random_uuid(), new_user_id, 'test_afiliado@example.com', 'Afiliado Teste', 'active') ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb;

-- RLS Updates
DROP POLICY IF EXISTS "ad_invoices_merchant_select_new" ON public.ad_invoices;
CREATE POLICY "ad_invoices_merchant_select_new" ON public.ad_invoices
  FOR SELECT TO authenticated USING (
    advertiser_id::text = (auth.uid())::text OR
    advertiser_id IN (SELECT company_id::uuid FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL) OR
    ad_id IN (SELECT id FROM ad_campaigns WHERE company_id::text = (auth.uid())::text) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee'))
  );

DROP POLICY IF EXISTS "crm_target_groups_insert" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_insert" ON public.crm_target_groups
  FOR INSERT TO authenticated WITH CHECK (
    company_id::text = (auth.uid())::text OR
    affiliate_id::text = (auth.uid())::text OR
    franchise_id::text = (auth.uid())::text OR
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee'))
  );

DROP POLICY IF EXISTS "crm_target_groups_select" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_select" ON public.crm_target_groups
  FOR SELECT TO authenticated USING (
    company_id::text = (auth.uid())::text OR
    affiliate_id::text = (auth.uid())::text OR
    franchise_id::text = (auth.uid())::text OR
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee'))
  );

DROP POLICY IF EXISTS "merchant_update_settings" ON public.merchants;
CREATE POLICY "merchant_update_settings" ON public.merchants
  FOR UPDATE TO authenticated USING (
    id::text = (auth.uid())::text OR
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  ) WITH CHECK (
    id::text = (auth.uid())::text OR
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

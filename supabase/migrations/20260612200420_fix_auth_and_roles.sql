DO $$
DECLARE
  v_admin_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_merchant_id uuid := '00000000-0000-0000-0000-000000000002'::uuid;
  v_franchisee_id uuid := '00000000-0000-0000-0000-000000000003'::uuid;
  v_affiliate_id uuid := '00000000-0000-0000-0000-000000000004'::uuid;
  v_master_franchise_id text := 'master-franchise-id-001';
  v_test_merchant_id text := 'test-merchant-id-001';
  v_test_affiliate_id uuid := '00000000-0000-0000-0000-000000000005'::uuid;
BEGIN
  -- Insert Master Franchise
  INSERT INTO public.franchises (id, name, email, status)
  VALUES (v_master_franchise_id, 'Master Franchise Routevoy', 'adailtong@gmail.com', 'active')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- Insert Test Merchant
  INSERT INTO public.merchants (id, name, email, status, franchise_id)
  VALUES (v_test_merchant_id, 'Test Merchant Store', 'test_lojista@example.com', 'active', v_master_franchise_id)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- 1. Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Routevoy", "role": "super_admin"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')) WHERE id = v_admin_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Admin Routevoy', 'super_admin', v_master_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', franchise_id = v_master_franchise_id;

  -- 2. Merchant
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_lojista@example.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (v_merchant_id, '00000000-0000-0000-0000-000000000000', 'test_lojista@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Test Lojista", "role": "merchant"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
  ELSE
    SELECT id INTO v_merchant_id FROM auth.users WHERE email = 'test_lojista@example.com';
    UPDATE auth.users SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')) WHERE id = v_merchant_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, company_id)
  VALUES (v_merchant_id, 'test_lojista@example.com', 'Test Lojista', 'merchant', v_test_merchant_id)
  ON CONFLICT (id) DO UPDATE SET role = 'merchant', company_id = v_test_merchant_id;

  -- 3. Franchisee
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (v_franchisee_id, '00000000-0000-0000-0000-000000000000', 'test_franqueado@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Test Franqueado", "role": "franchisee"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
  ELSE
    SELECT id INTO v_franchisee_id FROM auth.users WHERE email = 'test_franqueado@example.com';
    UPDATE auth.users SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')) WHERE id = v_franchisee_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, franchise_id)
  VALUES (v_franchisee_id, 'test_franqueado@example.com', 'Test Franqueado', 'franchisee', v_master_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee', franchise_id = v_master_franchise_id;

  -- 4. Affiliate
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_afiliado@example.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (v_affiliate_id, '00000000-0000-0000-0000-000000000000', 'test_afiliado@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Test Afiliado", "role": "affiliate"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
  ELSE
    SELECT id INTO v_affiliate_id FROM auth.users WHERE email = 'test_afiliado@example.com';
    UPDATE auth.users SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')) WHERE id = v_affiliate_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_affiliate, franchise_id)
  VALUES (v_affiliate_id, 'test_afiliado@example.com', 'Test Afiliado', 'affiliate', true, v_master_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'affiliate', is_affiliate = true, franchise_id = v_master_franchise_id;

  INSERT INTO public.affiliate_partners (id, user_id, email, name, status, franchise_id)
  VALUES (v_test_affiliate_id, v_affiliate_id, 'test_afiliado@example.com', 'Test Afiliado', 'active', v_master_franchise_id)
  ON CONFLICT (email) DO UPDATE SET user_id = v_affiliate_id, franchise_id = v_master_franchise_id;

  -- Ensure phone column is NULL to avoid UNIQUE constraint violation if multiple empty strings
  UPDATE auth.users SET phone = NULL WHERE phone = '';

END $$;

-- Safely add RLS policies
DROP POLICY IF EXISTS "auth_read_franchise_by_profile" ON public.franchises;
CREATE POLICY "auth_read_franchise_by_profile" ON public.franchises
  FOR SELECT TO authenticated USING (
    id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_read_own_affiliate" ON public.affiliate_partners;
CREATE POLICY "auth_read_own_affiliate" ON public.affiliate_partners
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())
  );

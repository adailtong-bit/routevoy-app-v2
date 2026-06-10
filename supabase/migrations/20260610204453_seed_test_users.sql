DO $$
DECLARE
  v_admin_id uuid;
  v_merchant_id uuid;
  v_franchisee_id uuid;
  v_affiliate_id uuid;
  v_company_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  -- Insert a mock company for the merchant test
  INSERT INTO public.merchants (id, name, email, status)
  VALUES (v_company_id::text, 'Loja Teste', 'lojista@test.com', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- 1. Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_admin_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Merchant User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lojista@test.com') THEN
    v_merchant_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_merchant_id, '00000000-0000-0000-0000-000000000000', 'lojista@test.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista", "role": "merchant"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, company_id)
    VALUES (v_merchant_id, 'lojista@test.com', 'Lojista Teste', 'merchant', v_company_id::text)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 3. Franchisee User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'franqueado@test.com') THEN
    v_franchisee_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_franchisee_id, '00000000-0000-0000-0000-000000000000', 'franqueado@test.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Franqueado", "role": "franchisee"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_franchisee_id, 'franqueado@test.com', 'Franqueado Teste', 'franchisee')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 4. Affiliate User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'afiliado@test.com') THEN
    v_affiliate_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_affiliate_id, '00000000-0000-0000-0000-000000000000', 'afiliado@test.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Afiliado", "role": "affiliate"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (v_affiliate_id, 'afiliado@test.com', 'Afiliado Teste', 'affiliate', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

END $$;

-- Ensure RLS policies allow merchants to view/manage their campaigns and financials
DROP POLICY IF EXISTS "merchant_manage_campaigns" ON public.ad_campaigns;
CREATE POLICY "merchant_manage_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    company_id::text IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL) OR
    company_id::text = auth.uid()::text
  )
  WITH CHECK (
    company_id::text IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL) OR
    company_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS "merchant_manage_invoices" ON public.ad_invoices;
CREATE POLICY "merchant_manage_invoices" ON public.ad_invoices
  FOR ALL TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM public.ad_campaigns 
      WHERE company_id::text IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL) 
         OR company_id::text = auth.uid()::text
    )
    OR
    advertiser_id IN (
       SELECT id FROM public.ad_advertisers
       WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "merchant_manage_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "merchant_manage_crm_campaigns" ON public.crm_campaigns
  FOR ALL TO authenticated
  USING (
    company_id::text IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL) OR
    company_id::text = auth.uid()::text
  )
  WITH CHECK (
    company_id::text IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL) OR
    company_id::text = auth.uid()::text
  );

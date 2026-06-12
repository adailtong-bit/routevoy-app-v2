DO $$
DECLARE
  v_user_id uuid;
  v_franchise_id text := 'franchise-matriz-123';
  v_merchant_id text := 'merchant-matriz-123';
  v_affiliate_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
BEGIN
  -- 1. Create or get Auth User
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- 2. Seed Franchise
  INSERT INTO public.franchises (id, name, email, status)
  VALUES (v_franchise_id, 'Franquia Matriz', 'matriz@routevoy.com', 'active')
  ON CONFLICT (id) DO UPDATE SET name = 'Franquia Matriz', status = 'active';

  -- 3. Seed Merchant
  INSERT INTO public.merchants (id, name, email, franchise_id, status)
  VALUES (v_merchant_id, 'Lojista Exemplo Matriz', 'lojista@matriz.com', v_franchise_id, 'active')
  ON CONFLICT (id) DO UPDATE SET franchise_id = v_franchise_id, status = 'active';

  -- 4. Seed Affiliate (Using email for conflict because it's UNIQUE)
  INSERT INTO public.affiliate_partners (id, name, email, franchise_id, status, user_id)
  VALUES (v_affiliate_id, 'Afiliado Exemplo Matriz', 'afiliado@matriz.com', v_franchise_id, 'active', v_user_id)
  ON CONFLICT (email) DO UPDATE SET franchise_id = v_franchise_id, status = 'active', user_id = v_user_id;

  -- 5. Update Profile
  INSERT INTO public.profiles (id, email, name, role, franchise_id, company_id)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin', v_franchise_id, v_merchant_id)
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      franchise_id = v_franchise_id,
      company_id = v_merchant_id;

END $$;

-- Ensure RLS policies are applied securely
DROP POLICY IF EXISTS "ensure_hierarchy_select_profiles" ON public.profiles;
CREATE POLICY "ensure_hierarchy_select_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'franchisee' AND p.franchise_id = profiles.franchise_id)
  );

DROP POLICY IF EXISTS "ensure_hierarchy_select_franchises" ON public.franchises;
CREATE POLICY "ensure_hierarchy_select_franchises" ON public.franchises
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.franchise_id = franchises.id)
  );

DROP POLICY IF EXISTS "ensure_hierarchy_select_merchants" ON public.merchants;
CREATE POLICY "ensure_hierarchy_select_merchants" ON public.merchants
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'franchisee' AND p.franchise_id = merchants.franchise_id) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id = merchants.id)
  );

DROP POLICY IF EXISTS "ensure_hierarchy_select_affiliates" ON public.affiliate_partners;
CREATE POLICY "ensure_hierarchy_select_affiliates" ON public.affiliate_partners
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'franchisee' AND p.franchise_id = affiliate_partners.franchise_id) OR
    user_id = auth.uid()
  );

DO $$
BEGIN
    -- Fix ad_campaigns
    DROP POLICY IF EXISTS "auth_manage_own_campaigns" ON public.ad_campaigns;
    CREATE POLICY "auth_manage_own_campaigns" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (
        (company_id IS NOT NULL AND company_id::text = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id()) OR
        (affiliate_id IS NOT NULL AND affiliate_id::uuid = public.get_auth_user_affiliate_id())
    ) WITH CHECK (
        (company_id IS NOT NULL AND company_id::text = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id()) OR
        (affiliate_id IS NOT NULL AND affiliate_id::uuid = public.get_auth_user_affiliate_id())
    );

    -- Fix crm_campaigns
    DROP POLICY IF EXISTS "auth_manage_own_crm_campaigns" ON public.crm_campaigns;
    CREATE POLICY "auth_manage_own_crm_campaigns" ON public.crm_campaigns
    FOR ALL TO authenticated
    USING (
        (company_id IS NOT NULL AND company_id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id()) OR
        (affiliate_id IS NOT NULL AND affiliate_id::uuid = public.get_auth_user_affiliate_id())
    ) WITH CHECK (
        (company_id IS NOT NULL AND company_id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id()) OR
        (affiliate_id IS NOT NULL AND affiliate_id::uuid = public.get_auth_user_affiliate_id())
    );

    -- Fix crm_target_groups
    DROP POLICY IF EXISTS "auth_manage_own_crm_target_groups" ON public.crm_target_groups;
    CREATE POLICY "auth_manage_own_crm_target_groups" ON public.crm_target_groups
    FOR ALL TO authenticated
    USING (
        (company_id IS NOT NULL AND company_id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id()) OR
        (affiliate_id IS NOT NULL AND affiliate_id::uuid = public.get_auth_user_affiliate_id())
    ) WITH CHECK (
        (company_id IS NOT NULL AND company_id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id()) OR
        (affiliate_id IS NOT NULL AND affiliate_id::uuid = public.get_auth_user_affiliate_id())
    );

    -- Fix merchants
    DROP POLICY IF EXISTS "merchant_own_merchants" ON public.merchants;
    CREATE POLICY "merchant_own_merchants" ON public.merchants
    FOR ALL TO authenticated
    USING (
        (id IS NOT NULL AND id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id())
    ) WITH CHECK (
        (id IS NOT NULL AND id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id())
    );

    -- Fix profiles
    DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
    CREATE POLICY "auth_read_own_profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid() OR
        (company_id IS NOT NULL AND company_id = public.get_auth_user_company_id()) OR
        (franchise_id IS NOT NULL AND franchise_id = public.get_auth_user_franchise_id())
    );

END $$;

-- Seed testing user adailtong@gmail.com
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"name": "Admin Tester", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin Tester', 'admin')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Ensure the user has the correct role
    UPDATE public.profiles SET role = 'admin' WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Admin Tester", "role": "admin"}'::jsonb WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

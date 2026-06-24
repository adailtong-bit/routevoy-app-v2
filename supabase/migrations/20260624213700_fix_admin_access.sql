DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Fix profiles RLS recursive policies
  DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
  DROP POLICY IF EXISTS "super_admin_all_profiles_override" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

  -- Create non-recursive policies for profiles
  CREATE POLICY "auth_read_profiles" ON public.profiles 
    FOR SELECT TO authenticated USING (true);
  
  CREATE POLICY "auth_insert_profiles" ON public.profiles 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
  
  CREATE POLICY "auth_update_profiles" ON public.profiles 
    FOR UPDATE TO authenticated USING (
      auth.uid() = id OR 
      (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
    );
  
  CREATE POLICY "auth_delete_profiles" ON public.profiles 
    FOR DELETE TO authenticated USING (
      auth.uid() = id OR 
      (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
    );

  -- Override policies for major tables to give full admin access
  DROP POLICY IF EXISTS "admin_all_coupons_override" ON public.coupons;
  CREATE POLICY "admin_all_coupons_override" ON public.coupons 
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  DROP POLICY IF EXISTS "admin_all_ad_campaigns_override" ON public.ad_campaigns;
  CREATE POLICY "admin_all_ad_campaigns_override" ON public.ad_campaigns 
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  DROP POLICY IF EXISTS "super_admin_all_affiliates_override" ON public.affiliate_partners;
  CREATE POLICY "super_admin_all_affiliates_override" ON public.affiliate_partners 
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  DROP POLICY IF EXISTS "super_admin_all_merchants_override" ON public.merchants;
  CREATE POLICY "super_admin_all_merchants_override" ON public.merchants 
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  DROP POLICY IF EXISTS "admin_all_franchises_override" ON public.franchises;
  CREATE POLICY "admin_all_franchises_override" ON public.franchises 
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  DROP POLICY IF EXISTS "admin_all_ad_advertisers_override" ON public.ad_advertisers;
  CREATE POLICY "admin_all_ad_advertisers_override" ON public.ad_advertisers 
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

  -- Seed Master Admin user
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
      '{"name": "Admin Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    INSERT INTO public.profiles (id, email, name, role, is_vip, status)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin Master', 'admin', true, 'active');
  ELSE
    UPDATE public.profiles SET role = 'admin', is_vip = true, status = 'active' WHERE id = v_user_id;
  END IF;

END $$;

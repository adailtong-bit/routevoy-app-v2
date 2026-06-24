-- Set RLS policies for CRM tables
DROP POLICY IF EXISTS "merchant_select_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "merchant_select_crm_campaigns" ON public.crm_campaigns
  FOR SELECT TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "merchant_manage_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "merchant_manage_crm_campaigns" ON public.crm_campaigns
  FOR ALL TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "merchant_select_crm_target_groups" ON public.crm_target_groups;
CREATE POLICY "merchant_select_crm_target_groups" ON public.crm_target_groups
  FOR SELECT TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "merchant_manage_crm_target_groups" ON public.crm_target_groups;
CREATE POLICY "merchant_manage_crm_target_groups" ON public.crm_target_groups
  FOR ALL TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
  );

-- Create a dummy merchant company if needed
DO $$
DECLARE
  v_user_id uuid;
  v_company_id text := 'dummy-merchant-1';
BEGIN
  -- Insert into merchants
  INSERT INTO public.merchants (id, name, status)
  VALUES (v_company_id, 'Test Merchant Store', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Create user adailtong@gmail.com
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
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role, company_id)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'merchant', v_company_id)
    ON CONFLICT (id) DO UPDATE SET role = 'merchant', company_id = v_company_id;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET role = 'merchant', company_id = v_company_id WHERE id = v_user_id;
  END IF;

  -- Create some target groups and campaigns so they don't see empty list
  INSERT INTO public.crm_target_groups (id, company_id, name, description, lead_count)
  VALUES 
    ('tg-1'::uuid, v_company_id, 'All Customers', 'All active customers', 150),
    ('tg-2'::uuid, v_company_id, 'High Spenders', 'Spent more than $100', 45)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.crm_campaigns (id, company_id, name, target_group_id, channel, geographic_scope, status, content)
  VALUES
    ('camp-1'::uuid, v_company_id, 'Summer Sale Notice', 'tg-1'::uuid, 'email', 'local', 'active', 'Come visit us this summer!'),
    ('camp-2'::uuid, v_company_id, 'VIP Exclusive', 'tg-2'::uuid, 'push', 'local', 'scheduled', 'Exclusive deals for you!')
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Ensure idempotent policy creation
DO $$
BEGIN
  -- Drop conflicting policies on ad_campaigns
  DROP POLICY IF EXISTS "auth_hierarchy_ad_campaigns_all" ON public.ad_campaigns;
  DROP POLICY IF EXISTS "merchant_manage_ad_campaigns" ON public.ad_campaigns;

  -- Drop conflicting policies on crm_campaigns
  DROP POLICY IF EXISTS "auth_hierarchy_crm_campaigns_all" ON public.crm_campaigns;
  DROP POLICY IF EXISTS "merchant_manage_crm_campaigns" ON public.crm_campaigns;

  -- Drop conflicting policies on crawler_sources
  DROP POLICY IF EXISTS "auth_hierarchy_crawler_sources_all" ON public.crawler_sources;
  DROP POLICY IF EXISTS "auth_manage_own_crawler_sources" ON public.crawler_sources;
END $$;

-- AD CAMPAIGNS
CREATE POLICY "auth_hierarchy_ad_campaigns_all" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
  affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
)
WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
  affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- CRM CAMPAIGNS
CREATE POLICY "auth_hierarchy_crm_campaigns_all" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
  affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
)
WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
  affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- CRAWLER SOURCES
CREATE POLICY "auth_hierarchy_crawler_sources_all" ON public.crawler_sources
FOR ALL TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
  affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
)
WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
  affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Seed Data for Testing Empty States
DO $$
DECLARE
  v_user_id uuid;
  v_company_id text := 'seed-merchant-1';
BEGIN
  -- Ensure the seed merchant exists
  INSERT INTO public.merchants (id, name, email, status)
  VALUES (v_company_id, 'Seed Merchant Test', 'adailtong@gmail.com', 'active')
  ON CONFLICT (id) DO UPDATE SET status = 'active';

  -- Check if user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';

  IF v_user_id IS NULL THEN
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Create or update profile to ensure it has the correct role and company_id
  INSERT INTO public.profiles (id, email, name, role, company_id)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton G', 'merchant', v_company_id)
  ON CONFLICT (id) DO UPDATE
  SET role = 'merchant', company_id = v_company_id;
END $$;

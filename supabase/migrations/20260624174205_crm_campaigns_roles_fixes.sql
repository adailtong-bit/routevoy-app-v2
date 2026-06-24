DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Provide Idempotent Seed Data for QA
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'merchant', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'merchant', status = 'active';
  END IF;
END $$;

-- Ensure helper functions exist
CREATE OR REPLACE FUNCTION public.get_auth_user_company_id() RETURNS text AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_franchise_id() RETURNS text AS $$
BEGIN
  RETURN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_affiliate_id() RETURNS uuid AS $$
BEGIN
  RETURN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS for ad_campaigns
DROP POLICY IF EXISTS "auth_manage_own_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_manage_own_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    company_id = public.get_auth_user_company_id() OR
    franchise_id = public.get_auth_user_franchise_id() OR
    affiliate_id = public.get_auth_user_affiliate_id()
  )
  WITH CHECK (
    company_id = public.get_auth_user_company_id() OR
    franchise_id = public.get_auth_user_franchise_id() OR
    affiliate_id = public.get_auth_user_affiliate_id()
  );

-- Update RLS for crm_campaigns
DROP POLICY IF EXISTS "auth_manage_own_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "auth_manage_own_crm_campaigns" ON public.crm_campaigns
  FOR ALL TO authenticated
  USING (
    company_id = public.get_auth_user_company_id() OR
    franchise_id = public.get_auth_user_franchise_id() OR
    affiliate_id = public.get_auth_user_affiliate_id()
  )
  WITH CHECK (
    company_id = public.get_auth_user_company_id() OR
    franchise_id = public.get_auth_user_franchise_id() OR
    affiliate_id = public.get_auth_user_affiliate_id()
  );

-- Update RLS for crm_target_groups
DROP POLICY IF EXISTS "auth_manage_own_crm_target_groups" ON public.crm_target_groups;
CREATE POLICY "auth_manage_own_crm_target_groups" ON public.crm_target_groups
  FOR ALL TO authenticated
  USING (
    company_id = public.get_auth_user_company_id() OR
    franchise_id = public.get_auth_user_franchise_id() OR
    affiliate_id = public.get_auth_user_affiliate_id()
  )
  WITH CHECK (
    company_id = public.get_auth_user_company_id() OR
    franchise_id = public.get_auth_user_franchise_id() OR
    affiliate_id = public.get_auth_user_affiliate_id()
  );

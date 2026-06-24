-- Set up RLS for crm_campaigns and crm_target_groups

ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_target_groups ENABLE ROW LEVEL SECURITY;

-- crm_campaigns policies
DROP POLICY IF EXISTS "auth_manage_own_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "auth_manage_own_crm_campaigns" ON public.crm_campaigns
  FOR ALL TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- crm_target_groups policies
DROP POLICY IF EXISTS "auth_manage_own_crm_target_groups" ON public.crm_target_groups;
CREATE POLICY "auth_manage_own_crm_target_groups" ON public.crm_target_groups
  FOR ALL TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    franchise_id IN (SELECT franchise_id FROM public.profiles WHERE id = auth.uid()) OR
    affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Fix token columns if nulls exist
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Seed user adailtong@gmail.com
DO $$
DECLARE
  new_user_id uuid;
  new_merchant_id text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    new_merchant_id := 'merch-' || substring(new_user_id::text from 1 for 8);

    -- 1. Insert User
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
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- 2. Insert Merchant
    INSERT INTO public.merchants (
      id, name, email, status, created_at, updated_at
    ) VALUES (
      new_merchant_id, 'Adailton Store', 'adailtong@gmail.com', 'active', NOW(), NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Profile
    INSERT INTO public.profiles (
      id, email, name, role, company_id, status, created_at
    ) VALUES (
      new_user_id, 'adailtong@gmail.com', 'Adailton G', 'merchant', new_merchant_id, 'approved', NOW()
    ) ON CONFLICT (id) DO UPDATE SET role = 'merchant', company_id = new_merchant_id;

  END IF;
END $$;

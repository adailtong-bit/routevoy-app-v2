-- Ensure adailtong@gmail.com seed exists and tokens are correctly set
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Drop all existing conflicting or permissive policies on campaigns safely
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ad_campaigns' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_campaigns', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'crm_campaigns' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.crm_campaigns', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;

-- 1. ad_campaigns strict hierarchical policies
CREATE POLICY "merchant_own_ad_campaigns_strict" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  company_id IS NOT NULL AND company_id::text = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id IS NOT NULL AND company_id::text = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "franchise_own_ad_campaigns_strict" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  franchise_id IS NOT NULL AND franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  franchise_id IS NOT NULL AND franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "affiliate_own_ad_campaigns_strict" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  affiliate_id IS NOT NULL AND affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid() LIMIT 1)
)
WITH CHECK (
  affiliate_id IS NOT NULL AND affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "admin_all_ad_campaigns_strict" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
);

CREATE POLICY "public_read_active_ad_campaigns" ON public.ad_campaigns
FOR SELECT
USING (status = 'active' AND environment = 'production');

-- 2. crm_campaigns strict hierarchical policies
CREATE POLICY "merchant_own_crm_campaigns_strict" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  company_id IS NOT NULL AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id IS NOT NULL AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "franchise_own_crm_campaigns_strict" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  franchise_id IS NOT NULL AND franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  franchise_id IS NOT NULL AND franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "affiliate_own_crm_campaigns_strict" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  affiliate_id IS NOT NULL AND affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid() LIMIT 1)
)
WITH CHECK (
  affiliate_id IS NOT NULL AND affiliate_id = (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "admin_all_crm_campaigns_strict" ON public.crm_campaigns
FOR ALL TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
);

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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Setup RLS
ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_invoices ENABLE ROW LEVEL SECURITY;

-- ad_pricing
DROP POLICY IF EXISTS "public_read_ad_pricing" ON public.ad_pricing;
DROP POLICY IF EXISTS "admin_all_ad_pricing" ON public.ad_pricing;

CREATE POLICY "public_read_ad_pricing" ON public.ad_pricing FOR SELECT USING (true);
CREATE POLICY "admin_all_ad_pricing" ON public.ad_pricing FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id::uuid = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- ad_campaigns
DROP POLICY IF EXISTS "public_all_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
DROP POLICY IF EXISTS "manage_own_ad_campaigns" ON public.ad_campaigns;

CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns FOR SELECT USING (true);
CREATE POLICY "manage_own_ad_campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id::uuid = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee'))
  OR company_id::text IN (SELECT id::text FROM public.merchants WHERE email::text = (SELECT email::text FROM auth.users WHERE id = auth.uid()))
  OR advertiser_id::text IN (SELECT id::text FROM public.ad_advertisers WHERE email::text = (SELECT email::text FROM auth.users WHERE id = auth.uid()))
);

-- ad_invoices
DROP POLICY IF EXISTS "public_all_ad_invoices" ON public.ad_invoices;
DROP POLICY IF EXISTS "manage_own_ad_invoices" ON public.ad_invoices;

CREATE POLICY "manage_own_ad_invoices" ON public.ad_invoices FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id::uuid = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee'))
  OR advertiser_id::text IN (SELECT id::text FROM public.ad_advertisers WHERE email::text = (SELECT email::text FROM auth.users WHERE id = auth.uid()))
);

-- Seed ad_pricing
INSERT INTO public.ad_pricing (id, placement, billing_type, duration_days, price, environment)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Destaque Home - 7 dias', 'fixed', 7, 100.00, 'production'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Busca Global - 15 dias', 'fixed', 15, 150.00, 'production'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Top Ranking - 30 dias', 'fixed', 30, 300.00, 'production')
ON CONFLICT (id) DO NOTHING;

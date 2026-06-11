DO $$
DECLARE
  v_user_id uuid;
BEGIN
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Master", "role": "super_admin"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_vip)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin', true)
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

END $$;

-- Fix RLS policies
DROP POLICY IF EXISTS "merchant_own_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "merchant_own_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = ad_campaigns.company_id::text ));

DROP POLICY IF EXISTS "merchant_manage_invoices" ON public.ad_invoices;
CREATE POLICY "merchant_manage_invoices" ON public.ad_invoices
  FOR ALL TO authenticated
  USING (
    ad_id IN ( SELECT ad_campaigns.id FROM ad_campaigns WHERE ad_campaigns.company_id::text IN ( SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id IS NOT NULL ) OR ad_campaigns.company_id::text = auth.uid()::text )
    OR advertiser_id IN ( SELECT ad_advertisers.id FROM ad_advertisers WHERE ad_advertisers.email = ( SELECT users.email FROM auth.users WHERE users.id = auth.uid() )::text )
  );

DROP POLICY IF EXISTS "manage_own_ad_invoices" ON public.ad_invoices;
CREATE POLICY "manage_own_ad_invoices" ON public.ad_invoices
  FOR ALL TO authenticated
  USING (
    EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee') )
    OR advertiser_id IN ( SELECT ad_advertisers.id FROM ad_advertisers WHERE ad_advertisers.email = ( SELECT users.email FROM auth.users WHERE users.id = auth.uid() )::text )
    OR ad_id IN ( SELECT ad_campaigns.id FROM ad_campaigns WHERE ad_campaigns.company_id::text = auth.uid()::text OR ad_campaigns.company_id::text IN ( SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid() ) )
  );

DROP POLICY IF EXISTS "ad_invoices_merchant_select" ON public.ad_invoices;
CREATE POLICY "ad_invoices_merchant_select" ON public.ad_invoices
  FOR SELECT TO authenticated
  USING (
    ad_id IN ( SELECT ad_campaigns.id FROM ad_campaigns WHERE ad_campaigns.company_id::text = auth.uid()::text )
    OR EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee') )
  );

DROP POLICY IF EXISTS "ad_invoices_merchant_select_new" ON public.ad_invoices;
CREATE POLICY "ad_invoices_merchant_select_new" ON public.ad_invoices
  FOR SELECT TO authenticated
  USING (
    advertiser_id::text = auth.uid()::text
    OR advertiser_id IN ( SELECT profiles.company_id::uuid FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id IS NOT NULL AND profiles.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' )
    OR ad_id IN ( SELECT ad_campaigns.id FROM ad_campaigns WHERE ad_campaigns.company_id::text = auth.uid()::text )
    OR EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee') )
  );

DROP POLICY IF EXISTS "affiliate_own_transactions" ON public.affiliate_transactions;
CREATE POLICY "affiliate_own_transactions" ON public.affiliate_transactions
  FOR ALL TO authenticated
  USING (affiliate_id IN ( SELECT affiliate_partners.id FROM affiliate_partners WHERE affiliate_partners.user_id = auth.uid() ));

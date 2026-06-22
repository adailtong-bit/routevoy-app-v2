DO $$
DECLARE
  v_admin_id uuid;
  v_franchise_id text := 'franchise-seed';
  v_company_id text := 'company-seed';
  v_affiliate_id uuid;
BEGIN
  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Ensure a franchise
  INSERT INTO public.franchises (id, name, owner_id)
  VALUES (v_franchise_id, 'Master Franchise Seed', v_admin_id::text)
  ON CONFLICT (id) DO NOTHING;

  -- Ensure a company
  INSERT INTO public.merchants (id, name, email, status)
  VALUES (v_company_id, 'Demo Merchant Seed', 'merchantseed@demo.com', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Ensure an affiliate user and partner
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'affiliateseed@demo.com') THEN
    v_affiliate_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_affiliate_id,
      '00000000-0000-0000-0000-000000000000',
      'affiliateseed@demo.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Demo Affiliate Seed"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (v_affiliate_id, 'affiliateseed@demo.com', 'Demo Affiliate Seed', 'affiliate', true)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
    VALUES (v_affiliate_id, v_affiliate_id, 'affiliateseed@demo.com', 'Demo Affiliate Partner', 'active')
    ON CONFLICT (email) DO NOTHING;
  ELSE
    SELECT id INTO v_affiliate_id FROM auth.users WHERE email = 'affiliateseed@demo.com' LIMIT 1;
  END IF;

  -- Seed financial_ledger
  INSERT INTO public.financial_ledger (id, user_id, franchise_id, company_id, affiliate_id, transaction_date, description, category, amount, type, status, reference_type)
  VALUES
    (gen_random_uuid(), v_admin_id, v_franchise_id, NULL, NULL, NOW() - INTERVAL '1 day', 'Initial Deposit', 'Deposit', 1000.00, 'credit', 'completed', 'deposit'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, v_company_id, NULL, NOW() - INTERVAL '2 days', 'Ad Campaign Purchase', 'Sales', 500.00, 'credit', 'completed', 'ad_campaign'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, NULL, v_affiliate_id, NOW() - INTERVAL '3 days', 'Affiliate Commission Payout', 'Commission', 150.00, 'debit', 'completed', 'affiliate_payout'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, NULL, NULL, NOW() - INTERVAL '4 days', 'Platform Royalty', 'Royalties', 75.00, 'credit', 'completed', 'royalty'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, v_company_id, NULL, NOW() - INTERVAL '5 days', 'Ad Campaign Purchase', 'Sales', 300.00, 'credit', 'completed', 'ad_campaign'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, NULL, NULL, NOW() - INTERVAL '6 days', 'Monthly Software Fee', 'Fees', 99.00, 'credit', 'completed', 'subscription'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, NULL, NULL, NOW() - INTERVAL '7 days', 'Platform Fee Payout', 'Fees', 45.00, 'debit', 'completed', 'platform_fee'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, v_company_id, NULL, NOW() - INTERVAL '8 days', 'Sponsored Campaign', 'Sales', 200.00, 'credit', 'completed', 'ad_campaign'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, NULL, v_affiliate_id, NOW() - INTERVAL '9 days', 'Affiliate Commission', 'Commission', 80.00, 'debit', 'completed', 'affiliate_payout'),
    (gen_random_uuid(), v_admin_id, v_franchise_id, v_company_id, NULL, NOW() - INTERVAL '10 days', 'Setup Fee', 'Deposit', 150.00, 'credit', 'completed', 'setup_fee')
  ON CONFLICT (id) DO NOTHING;

  -- Seed affiliate_transactions
  INSERT INTO public.affiliate_transactions (id, affiliate_id, product_name, sale_amount, total_commission, platform_fee, affiliate_earnings, status, created_at)
  VALUES
    (gen_random_uuid(), v_affiliate_id, 'Premium Plan Sale', 100.00, 30.00, 5.00, 25.00, 'completed', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_affiliate_id, 'Ad Campaign Sale', 200.00, 60.00, 10.00, 50.00, 'completed', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), v_affiliate_id, 'Subscription Renewal', 50.00, 15.00, 2.50, 12.50, 'completed', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), v_affiliate_id, 'Sponsored Ad Credit', 150.00, 45.00, 5.00, 40.00, 'completed', NOW() - INTERVAL '4 days'),
    (gen_random_uuid(), v_affiliate_id, 'VIP Membership', 300.00, 90.00, 15.00, 75.00, 'completed', NOW() - INTERVAL '5 days')
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Ensure Policies for financial_ledger
DROP POLICY IF EXISTS "financial_ledger_select" ON public.financial_ledger;
CREATE POLICY "financial_ledger_select" ON public.financial_ledger
  FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() OR
    affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
    franchise_id IN (SELECT id FROM public.franchises WHERE owner_id = auth.uid()::text) OR
    company_id IN (SELECT id FROM public.merchants WHERE id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS "affiliate_transactions_select" ON public.affiliate_transactions;
CREATE POLICY "affiliate_transactions_select" ON public.affiliate_transactions
  FOR SELECT TO authenticated 
  USING (
    affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'franchisee')
  );

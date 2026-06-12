DO $$
DECLARE
  v_user_id uuid;
  v_franchise_id text := 'master-franchise-seed';
  v_merchant_id text := '99999999-9999-9999-9999-999999999999';
  v_affiliate_id uuid := '88888888-8888-8888-8888-888888888888'::uuid;
BEGIN
  -- 1. Create/Get User
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- 2. Create Profile
  INSERT INTO public.profiles (id, email, name, role, is_vip, franchise_id)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin', true, v_franchise_id)
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', franchise_id = v_franchise_id;

  -- 3. Create Franchise
  INSERT INTO public.franchises (id, name, email, region, status, owner_id)
  VALUES (v_franchise_id, 'RouteVoy Master Franchise', 'master@routevoy.com', 'Global', 'active', v_user_id::text)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Create Merchant
  INSERT INTO public.merchants (id, name, email, status, franchise_id)
  VALUES (v_merchant_id, 'Seeded Merchant Store', 'merchant@example.com', 'active', v_franchise_id)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Create Affiliate
  INSERT INTO public.affiliate_partners (id, name, email, status, franchise_id)
  VALUES (v_affiliate_id, 'Seeded Affiliate Partner', 'affiliate@example.com', 'active', v_franchise_id)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Create Ad Campaigns (3)
  IF NOT EXISTS (SELECT 1 FROM public.ad_campaigns WHERE title = 'Seed Ad Campaign 1') THEN
    INSERT INTO public.ad_campaigns (title, company_id, franchise_id, status, price, environment)
    VALUES 
      ('Seed Ad Campaign 1', v_merchant_id::uuid, v_franchise_id, 'active', 50.00, 'production'),
      ('Seed Ad Campaign 2', v_merchant_id::uuid, v_franchise_id, 'active', 75.00, 'production'),
      ('Seed Ad Campaign 3', v_merchant_id::uuid, v_franchise_id, 'active', 100.00, 'production');
  END IF;

  -- 7. Create Coupons (3)
  IF NOT EXISTS (SELECT 1 FROM public.coupons WHERE title = 'Seed Coupon 1') THEN
    INSERT INTO public.coupons (title, company_id, franchise_id, status, environment, description, discount)
    VALUES 
      ('Seed Coupon 1', v_merchant_id::uuid, v_franchise_id, 'active', 'production', 'Desc 1', '10% OFF'),
      ('Seed Coupon 2', v_merchant_id::uuid, v_franchise_id, 'active', 'production', 'Desc 2', '20% OFF'),
      ('Seed Coupon 3', v_merchant_id::uuid, v_franchise_id, 'active', 'production', 'Desc 3', '50% OFF');
  END IF;

  -- 8. Create Affiliate Transactions (5)
  IF NOT EXISTS (SELECT 1 FROM public.affiliate_transactions WHERE product_name = 'Seed Transaction 1') THEN
    INSERT INTO public.affiliate_transactions (affiliate_id, product_name, sale_amount, total_commission, platform_fee, affiliate_earnings, status)
    VALUES 
      (v_affiliate_id, 'Seed Transaction 1', 100.00, 10.00, 2.00, 8.00, 'completed'),
      (v_affiliate_id, 'Seed Transaction 2', 250.00, 25.00, 5.00, 20.00, 'completed'),
      (v_affiliate_id, 'Seed Transaction 3', 50.00, 5.00, 1.00, 4.00, 'completed'),
      (v_affiliate_id, 'Seed Transaction 4', 500.00, 50.00, 10.00, 40.00, 'pending'),
      (v_affiliate_id, 'Seed Transaction 5', 1000.00, 100.00, 20.00, 80.00, 'pending');
  END IF;

  -- 9. Create Financial Ledger Entries (2 credits for revenue)
  IF NOT EXISTS (SELECT 1 FROM public.financial_ledger WHERE description = 'Seed Revenue Entry 1') THEN
    INSERT INTO public.financial_ledger (franchise_id, company_id, type, amount, description, status)
    VALUES 
      (v_franchise_id, v_merchant_id, 'credit', 1500.00, 'Seed Revenue Entry 1', 'completed'),
      (v_franchise_id, v_merchant_id, 'credit', 3500.00, 'Seed Revenue Entry 2', 'completed');
  END IF;

END $$;

DO $$
DECLARE
  v_user_id uuid;
  v_merchant_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users (idempotent)
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Ensure merchant exists
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO public.merchants (id, email, name)
    VALUES (v_merchant_id, 'adailtong@gmail.com', 'Skip Merchant');
  ELSE
    SELECT id INTO v_merchant_id FROM public.merchants WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Ensure profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton G', 'merchant');
  END IF;

  -- Seed ad_campaigns
  INSERT INTO public.ad_campaigns (id, company_id, title, category, environment, status, start_date, end_date)
  VALUES 
    (gen_random_uuid(), v_merchant_id, 'Summer Sale Ad', 'fashion', 'production', 'active', NOW(), NOW() + INTERVAL '30 days'),
    (gen_random_uuid(), v_merchant_id, 'Black Friday Ad', 'electronics', 'production', 'active', NOW(), NOW() + INTERVAL '30 days'),
    (gen_random_uuid(), v_merchant_id, 'Winter Clearance', 'food', 'production', 'active', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT DO NOTHING;

  -- Seed discovered_promotions
  INSERT INTO public.discovered_promotions (id, company_id, title, environment, status, promotion_model, engagement_threshold, reward_type, reward_value)
  VALUES 
    (gen_random_uuid(), v_merchant_id, 'Pre-launch Sneaker', 'production', 'active', 'pre-launch', 10, 'Standard Discount', 20),
    (gen_random_uuid(), v_merchant_id, 'Secret Menu Pre-launch', 'production', 'active', 'pre-launch', 5, 'Free Item', null),
    (gen_random_uuid(), v_merchant_id, 'VIP Access', 'production', 'active', 'pre-launch', 15, 'Store Credit', 50)
  ON CONFLICT DO NOTHING;

  -- Seed coupons (for the Campaigns page)
  INSERT INTO public.coupons (id, company_id, title, environment, status, discount, code)
  VALUES 
    (gen_random_uuid(), v_merchant_id, '10% OFF Everything', 'production', 'active', '10%', 'SAVE10'),
    (gen_random_uuid(), v_merchant_id, 'Free Shipping', 'production', 'active', 'Free', 'FREESHIP'),
    (gen_random_uuid(), v_merchant_id, 'Buy 1 Get 1', 'production', 'active', 'BOGO', 'BOGO24')
  ON CONFLICT DO NOTHING;

END $$;

-- Make sure RLS is allowing authenticated users to select, insert, update, delete
DROP POLICY IF EXISTS "authenticated_select_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_select_ad_campaigns" ON public.ad_campaigns FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_insert_ad_campaigns" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_update_ad_campaigns" ON public.ad_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "authenticated_delete_ad_campaigns" ON public.ad_campaigns FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_select_discovered_promotions" ON public.discovered_promotions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_insert_discovered_promotions" ON public.discovered_promotions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_update_discovered_promotions" ON public.discovered_promotions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "authenticated_delete_discovered_promotions" ON public.discovered_promotions FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_coupons" ON public.coupons;
CREATE POLICY "authenticated_select_coupons" ON public.coupons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_coupons" ON public.coupons;
CREATE POLICY "authenticated_insert_coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_coupons" ON public.coupons;
CREATE POLICY "authenticated_update_coupons" ON public.coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_coupons" ON public.coupons;
CREATE POLICY "authenticated_delete_coupons" ON public.coupons FOR DELETE TO authenticated USING (true);

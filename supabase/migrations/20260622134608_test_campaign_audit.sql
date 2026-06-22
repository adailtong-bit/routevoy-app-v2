-- Add original_status column
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS original_status text;

-- Drop existing update policies to recreate them securely for soft delete workflow
DROP POLICY IF EXISTS "affiliate_update_discovered_promotions" ON public.discovered_promotions;
DROP POLICY IF EXISTS "master_bypass_discovered_promotions" ON public.discovered_promotions;
DROP POLICY IF EXISTS "master_admin_select_discovered_promotions" ON public.discovered_promotions;

-- Affiliate can update their own promotions
CREATE POLICY "affiliate_update_discovered_promotions" ON public.discovered_promotions
  FOR UPDATE TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
  );

-- Admin can manage all promotions
CREATE POLICY "master_bypass_discovered_promotions" ON public.discovered_promotions
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'adailtong@gmail.com'
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'adailtong@gmail.com'
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admin can select all promotions
CREATE POLICY "master_admin_select_discovered_promotions" ON public.discovered_promotions
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'adailtong@gmail.com'
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Seed Data (Idempotent)
DO $DO_BLOCK$
DECLARE
  v_user_id uuid;
  v_affiliate_id uuid;
BEGIN
  -- 1. Ensure master admin user exists in auth.users
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
      '{"name": "Master Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- 2. Ensure profile exists
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, status)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Master Admin', 'super_admin', true, 'approved')
  ON CONFLICT (id) DO UPDATE 
  SET is_affiliate = true, status = 'approved', role = 'super_admin';

  -- 3. Ensure affiliate partner exists
  IF NOT EXISTS (SELECT 1 FROM public.affiliate_partners WHERE email = 'adailtong@gmail.com') THEN
    v_affiliate_id := gen_random_uuid();
    INSERT INTO public.affiliate_partners (id, user_id, name, email, status, commission_model, commission_rate)
    VALUES (v_affiliate_id, v_user_id, 'Master Admin Affiliate', 'adailtong@gmail.com', 'approved', 'percentage', 30.0);
  ELSE
    SELECT id INTO v_affiliate_id FROM public.affiliate_partners WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- 4. Seed test campaign
  IF NOT EXISTS (SELECT 1 FROM public.discovered_promotions WHERE title = 'Test Audit Campaign - 50% OFF') THEN
    INSERT INTO public.discovered_promotions (
      id, title, description, price, original_price, discount, discount_percentage, 
      store_name, category, status, is_demo, environment, affiliate_id, unique_hash, reward_description
    ) VALUES (
      gen_random_uuid(),
      'Test Audit Campaign - 50% OFF',
      'This is a comprehensive test promotion to validate extraction fields and logical deletion workflows.',
      49.90,
      99.80,
      '50% OFF',
      50,
      'Test Store',
      'Electronics',
      'active',
      true,
      'production',
      v_affiliate_id,
      'test_audit_campaign_hash_' || extract(epoch from now())::text,
      '50% discount on test electronics'
    );
  END IF;

END $DO_BLOCK$;

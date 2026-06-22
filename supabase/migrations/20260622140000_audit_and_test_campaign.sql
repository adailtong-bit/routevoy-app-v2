DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed master user
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
      '{"name": "Master Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Master Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Insert Test Campaign 2024
  INSERT INTO public.discovered_promotions (
    id, title, store_name, category, discount_percentage, promotion_model, reward_value, unique_hash, status, environment
  ) VALUES (
    gen_random_uuid(),
    'Test Campaign 2024',
    'Loja Teste',
    'Eletrônicos',
    20.0,
    'standard',
    50.0,
    'test-campaign-2024-hash',
    'published',
    'production'
  ) ON CONFLICT (unique_hash) DO NOTHING;

END $$;

-- Ensure RLS policies are correct for master admin to see all records (including deleted ones)
DROP POLICY IF EXISTS "master_bypass_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "master_bypass_discovered_promotions" ON public.discovered_promotions
  FOR ALL TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com' OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Fix policy for affiliates to see their own records, or any published records
DROP POLICY IF EXISTS "affiliate_select_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "affiliate_select_discovered_promotions" ON public.discovered_promotions
  FOR SELECT TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid())
    OR status = 'published'
  );

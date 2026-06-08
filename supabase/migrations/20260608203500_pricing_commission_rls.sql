DO $$
BEGIN
  -- Seed adailtong@gmail.com as admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists and has admin role
  INSERT INTO public.profiles (id, email, name, role)
  SELECT id, email, 'Adailton', 'admin'
  FROM auth.users
  WHERE email = 'adailtong@gmail.com'
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.ad_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement TEXT NOT NULL,
    billing_type TEXT NOT NULL,
    duration_days INTEGER,
    price NUMERIC NOT NULL,
    environment TEXT NOT NULL DEFAULT 'production',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fix RLS on commission_rules
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manage_commission_rules" ON public.commission_rules;
DROP POLICY IF EXISTS "public_read_commission_rules" ON public.commission_rules;
DROP POLICY IF EXISTS "admin_select_commission_rules" ON public.commission_rules;
DROP POLICY IF EXISTS "admin_insert_commission_rules" ON public.commission_rules;
DROP POLICY IF EXISTS "admin_update_commission_rules" ON public.commission_rules;
DROP POLICY IF EXISTS "admin_delete_commission_rules" ON public.commission_rules;

CREATE POLICY "admin_select_commission_rules" ON public.commission_rules FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "admin_insert_commission_rules" ON public.commission_rules FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "admin_update_commission_rules" ON public.commission_rules FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "admin_delete_commission_rules" ON public.commission_rules FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Fix RLS on ad_pricing
ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manage_ad_pricing" ON public.ad_pricing;
DROP POLICY IF EXISTS "public_read_ad_pricing" ON public.ad_pricing;
DROP POLICY IF EXISTS "auth_select_ad_pricing" ON public.ad_pricing;
DROP POLICY IF EXISTS "admin_insert_ad_pricing" ON public.ad_pricing;
DROP POLICY IF EXISTS "admin_update_ad_pricing" ON public.ad_pricing;
DROP POLICY IF EXISTS "admin_delete_ad_pricing" ON public.ad_pricing;

CREATE POLICY "auth_select_ad_pricing" ON public.ad_pricing FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_insert_ad_pricing" ON public.ad_pricing FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "admin_update_ad_pricing" ON public.ad_pricing FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "admin_delete_ad_pricing" ON public.ad_pricing FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

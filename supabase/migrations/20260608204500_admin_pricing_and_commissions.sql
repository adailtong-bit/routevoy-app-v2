DO $$
BEGIN
  -- Ensure ad_pricing table exists
  CREATE TABLE IF NOT EXISTS public.ad_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement TEXT NOT NULL,
    billing_type TEXT NOT NULL,
    duration_days INTEGER,
    price NUMERIC NOT NULL,
    environment TEXT NOT NULL DEFAULT 'production',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Ensure commission_rules table exists
  CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('publicidade', 'impulsionamento')),
    percentage NUMERIC NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

-- Enable Row Level Security
ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

-- Clean up and recreate policies for ad_pricing
DROP POLICY IF EXISTS "auth_select_ad_pricing" ON public.ad_pricing;
CREATE POLICY "auth_select_ad_pricing" ON public.ad_pricing
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_ad_pricing" ON public.ad_pricing;
CREATE POLICY "admin_insert_ad_pricing" ON public.ad_pricing
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

DROP POLICY IF EXISTS "admin_update_ad_pricing" ON public.ad_pricing;
CREATE POLICY "admin_update_ad_pricing" ON public.ad_pricing
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

DROP POLICY IF EXISTS "admin_delete_ad_pricing" ON public.ad_pricing;
CREATE POLICY "admin_delete_ad_pricing" ON public.ad_pricing
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

-- Clean up and recreate policies for commission_rules
DROP POLICY IF EXISTS "admin_select_commission_rules" ON public.commission_rules;
CREATE POLICY "admin_select_commission_rules" ON public.commission_rules
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

DROP POLICY IF EXISTS "admin_insert_commission_rules" ON public.commission_rules;
CREATE POLICY "admin_insert_commission_rules" ON public.commission_rules
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

DROP POLICY IF EXISTS "admin_update_commission_rules" ON public.commission_rules;
CREATE POLICY "admin_update_commission_rules" ON public.commission_rules
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

DROP POLICY IF EXISTS "admin_delete_commission_rules" ON public.commission_rules;
CREATE POLICY "admin_delete_commission_rules" ON public.commission_rules
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    ) OR (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    )
  );

-- Seed admin user
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
      '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    -- Ensure existing user is admin in profiles
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

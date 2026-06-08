-- Drop existing policies to safely recreate
DROP POLICY IF EXISTS "manage_ad_pricing" ON public.ad_pricing;

-- Allow franchisee to manage prices for their environment or admin global
CREATE POLICY "manage_ad_pricing" ON public.ad_pricing
  FOR ALL TO authenticated
  USING (
    (EXISTS ( SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ))
    OR
    (EXISTS ( SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' ) AND environment IN (SELECT id FROM public.franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
  )
  WITH CHECK (
    (EXISTS ( SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ))
    OR
    (EXISTS ( SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee' ) AND environment IN (SELECT id FROM public.franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
  );

-- Ensure RLS on commission_rules
DROP POLICY IF EXISTS "manage_commission_rules" ON public.commission_rules;

CREATE POLICY "manage_commission_rules" ON public.commission_rules
  FOR ALL TO authenticated
  USING (
    EXISTS ( SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') )
  )
  WITH CHECK (
    EXISTS ( SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') )
  );

-- Seed initial admin user and commission rules idempotently
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.commission_rules WHERE service_type = 'publicidade' AND franchise_id IS NULL) THEN
    INSERT INTO public.commission_rules (id, service_type, percentage, valid_from)
    VALUES (gen_random_uuid(), 'publicidade', 15.0, NOW());
  END IF;
   
  IF NOT EXISTS (SELECT 1 FROM public.commission_rules WHERE service_type = 'impulsionamento' AND franchise_id IS NULL) THEN
    INSERT INTO public.commission_rules (id, service_type, percentage, valid_from)
    VALUES (gen_random_uuid(), 'impulsionamento', 10.0, NOW());
  END IF;
END $$;

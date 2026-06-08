DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed adailtong@gmail.com
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
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    -- Just ensure profile is super_admin
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Make sure commission_rules table exists and has proper constraints
CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    percentage NUMERIC NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop existing constraints to recreate them safely
ALTER TABLE public.commission_rules DROP CONSTRAINT IF EXISTS commission_rules_service_type_check;
ALTER TABLE public.commission_rules DROP CONSTRAINT IF EXISTS commission_rules_percentage_check;

ALTER TABLE public.commission_rules ADD CONSTRAINT commission_rules_service_type_check 
    CHECK (service_type IN ('publicidade', 'impulsionamento'));
ALTER TABLE public.commission_rules ADD CONSTRAINT commission_rules_percentage_check 
    CHECK (percentage >= 0 AND percentage <= 100);

-- RLS policies
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manage_commission_rules" ON public.commission_rules;
CREATE POLICY "manage_commission_rules" ON public.commission_rules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "public_read_commission_rules" ON public.commission_rules;
CREATE POLICY "public_read_commission_rules" ON public.commission_rules
    FOR SELECT TO public
    USING (true);

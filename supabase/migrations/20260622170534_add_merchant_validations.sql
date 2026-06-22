CREATE TABLE IF NOT EXISTS public.merchant_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT REFERENCES public.merchants(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  promotion_id UUID,
  promotion_title TEXT,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  final_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.merchant_validations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merchant_validations_select" ON public.merchant_validations;
CREATE POLICY "merchant_validations_select" ON public.merchant_validations
  FOR SELECT TO authenticated USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    company_id = current_setting('app.company_id', true) OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin' OR role = 'super_admin')
  );

DROP POLICY IF EXISTS "merchant_validations_insert" ON public.merchant_validations;
CREATE POLICY "merchant_validations_insert" ON public.merchant_validations
  FOR INSERT TO authenticated WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    company_id = current_setting('app.company_id', true)
  );

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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;

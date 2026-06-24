-- RLS Policy for coupons
DROP POLICY IF EXISTS "franchisee_select_coupons" ON public.coupons;
CREATE POLICY "franchisee_select_coupons" ON public.coupons
  FOR SELECT TO authenticated USING (
    status = 'active'
    OR
    franchise_id = (SELECT franchise_id FROM public.profiles WHERE id = auth.uid())
  );

-- Idempotent Seed Data for Adailton Franchisee
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
      '{"name": "Adailton Franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.franchises (id, name, email, status)
    VALUES ('franchise-1', 'Master Franchise', 'adailtong@gmail.com', 'active')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, email, name, role, franchise_id)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Franchisee', 'franchisee', 'franchise-1')
    ON CONFLICT (id) DO UPDATE 
      SET role = 'franchisee', franchise_id = 'franchise-1';
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';

    INSERT INTO public.franchises (id, name, email, status)
    VALUES ('franchise-1', 'Master Franchise', 'adailtong@gmail.com', 'active')
    ON CONFLICT (id) DO NOTHING;

    UPDATE public.profiles
    SET role = 'franchisee', franchise_id = 'franchise-1'
    WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

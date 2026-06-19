-- Index on status for faster querying during auth
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Idempotent RLS policy for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_select_profiles" ON public.profiles;

CREATE POLICY "auth_read_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Seed user adailtong@gmail.com
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_affiliate, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin', false, 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

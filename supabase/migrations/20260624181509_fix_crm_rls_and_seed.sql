-- Idempotent script for CRM policies and user seed

DO $$
DECLARE
  seed_user_id uuid;
BEGIN
  -- Seed adailtong@gmail.com if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    seed_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      seed_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (seed_user_id, 'adailtong@gmail.com', 'Adailton', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Safely apply generic auth policies for CRM to ensure rendering works flawlessly for authenticated users
DROP POLICY IF EXISTS "crm_campaigns_auth_all" ON public.crm_campaigns;
CREATE POLICY "crm_campaigns_auth_all" ON public.crm_campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "crm_target_groups_auth_all" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_auth_all" ON public.crm_target_groups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

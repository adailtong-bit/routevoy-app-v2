-- Fix infinite recursion in profiles table policies
-- We drop existing policies that might contain recursive SELECTs
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create basic safe non-recursive policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Make sure site_settings can be read by everyone safely without recursion dependencies
DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

-- Remove demo data to clean up production environment and ensure data integrity
DELETE FROM public.ad_campaigns WHERE is_demo = true;
DELETE FROM public.coupons WHERE is_demo = true;
DELETE FROM public.discovered_promotions WHERE is_demo = true;

-- Seed the main admin user adailtong@gmail.com
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Ensure profile exists and is properly set up with active and admin statuses
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', status = 'active';

END $$;

DO $$
BEGIN
  -- 1. Add status column to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
END $$;

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION public.set_affiliate_pending_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_affiliate = true AND (NEW.status IS NULL OR NEW.status = 'active') THEN
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger
DROP TRIGGER IF EXISTS ensure_affiliate_pending ON public.profiles;
CREATE TRIGGER ensure_affiliate_pending
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_affiliate_pending_status();

-- 4. Seed user
DO $$
DECLARE
  super_admin_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    super_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      super_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Super Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status, is_affiliate)
    VALUES (super_admin_id, 'adailtong@gmail.com', 'Adailton Super Admin', 'super_admin', 'active', false)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO super_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
    
    UPDATE public.profiles 
    SET role = 'super_admin', status = 'active'
    WHERE id = super_admin_id;
    
    INSERT INTO public.profiles (id, email, name, role, status, is_affiliate)
    VALUES (super_admin_id, 'adailtong@gmail.com', 'Adailton Super Admin', 'super_admin', 'active', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

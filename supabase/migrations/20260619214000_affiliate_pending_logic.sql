-- 1. Create a trigger to auto-set status to 'pending' if role is 'affiliate' or is_affiliate is true
CREATE OR REPLACE FUNCTION public.set_affiliate_pending_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_affiliate = true OR NEW.role = 'affiliate' THEN
    IF NEW.status IS NULL OR NEW.status = 'active' THEN
      IF TG_OP = 'INSERT' THEN
        NEW.status := 'pending';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_affiliate_pending_status ON public.profiles;
CREATE TRIGGER trigger_set_affiliate_pending_status
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_affiliate_pending_status();

-- Ensure RLS policies exist on profiles for update
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Ensure affiliate_partners RLS allows select/update by own user
DROP POLICY IF EXISTS "affiliate_own_update" ON public.affiliate_partners;
CREATE POLICY "affiliate_own_update" ON public.affiliate_partners
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed Data: adailtong@gmail.com
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
      '{"name": "Adailton", "role": "affiliate"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_affiliate, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'affiliate', true, 'pending')
    ON CONFLICT (id) DO UPDATE SET is_affiliate = true, status = 'pending', role = 'affiliate';
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
    
    UPDATE public.profiles 
    SET is_affiliate = true, status = 'pending', role = 'affiliate'
    WHERE id = new_user_id;
    
    UPDATE auth.users
    SET raw_user_meta_data = '{"name": "Adailton", "role": "affiliate"}'::jsonb
    WHERE id = new_user_id;
  END IF;
END $$;

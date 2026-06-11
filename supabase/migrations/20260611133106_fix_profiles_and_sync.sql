-- Migration: fix_profiles_and_sync
-- 1. Create/Update handle_new_user_after trigger to ensure robust syncing
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- 1. Insert into profiles with robust coalescing
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    (NEW.raw_user_meta_data->>'role' = 'affiliate'),
    NEW.raw_user_meta_data->>'tax_id'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    is_affiliate = COALESCE(EXCLUDED.is_affiliate, public.profiles.is_affiliate),
    tax_id = COALESCE(EXCLUDED.tax_id, public.profiles.tax_id);

  -- 2. Insert into affiliate_partners if affiliate
  IF NEW.raw_user_meta_data->>'role' = 'affiliate' THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      'active', -- Auto approve for simplified flow
      NEW.raw_user_meta_data->>'tax_id'
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        tax_id = COALESCE(EXCLUDED.tax_id, public.affiliate_partners.tax_id);
  END IF;

  -- 3. Handle franchisee
  IF NEW.raw_user_meta_data->>'role' = 'franchisee' THEN
    -- Check if franchise exists by email
    IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = NEW.email) THEN
      INSERT INTO public.franchises (id, name, email)
      VALUES (
        gen_random_uuid()::text,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1) || ' Franchise'),
        NEW.email
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2. Update RLS policies
DROP POLICY IF EXISTS "authenticated_select_own_affiliate" ON public.affiliate_partners;
CREATE POLICY "authenticated_select_own_affiliate" ON public.affiliate_partners
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "authenticated_select_own_franchise" ON public.franchises;
CREATE POLICY "authenticated_select_own_franchise" ON public.franchises
  FOR SELECT TO authenticated USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 3. Seed data
DO $seed$
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Sync profiles table
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET is_affiliate = true;

  -- Create affiliate partner
  INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
  VALUES (gen_random_uuid(), v_user_id, 'adailtong@gmail.com', 'Adailton Affiliate', 'active')
  ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;

  -- Create franchise partner
  IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = 'adailtong@gmail.com') THEN
    INSERT INTO public.franchises (id, name, email)
    VALUES (gen_random_uuid()::text, 'Adailton Franchise', 'adailtong@gmail.com');
  END IF;

END $seed$;

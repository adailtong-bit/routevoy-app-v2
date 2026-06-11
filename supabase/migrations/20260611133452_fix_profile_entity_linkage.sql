DO $BODY$
BEGIN
  -- Update handle_new_user_after to be idempotent and robust
  CREATE OR REPLACE FUNCTION public.handle_new_user_after()
   RETURNS trigger
   LANGUAGE plpgsql
   SECURITY DEFINER
  AS $function$
  DECLARE
    v_role text;
    v_name text;
    v_is_affiliate boolean;
    v_tax_id text;
  BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    v_is_affiliate := (v_role = 'affiliate');
    v_tax_id := NEW.raw_user_meta_data->>'tax_id';

    -- 1. Insert into profiles with robust coalescing
    INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id)
    VALUES (
      NEW.id,
      NEW.email,
      v_name,
      v_role,
      v_is_affiliate,
      v_tax_id
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      name = COALESCE(public.profiles.name, EXCLUDED.name),
      role = COALESCE(public.profiles.role, EXCLUDED.role),
      is_affiliate = COALESCE(public.profiles.is_affiliate, EXCLUDED.is_affiliate),
      tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id);
  
    -- 2. Insert into affiliate_partners if affiliate
    IF v_role = 'affiliate' THEN
      INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
      VALUES (
        gen_random_uuid(),
        NEW.id,
        NEW.email,
        v_name,
        'active', -- Auto approve for simplified flow
        v_tax_id
      )
      ON CONFLICT (email) DO UPDATE 
      SET user_id = EXCLUDED.user_id,
          tax_id = COALESCE(public.affiliate_partners.tax_id, EXCLUDED.tax_id);
    END IF;
  
    -- 3. Handle franchisee
    IF v_role = 'franchisee' THEN
      IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = NEW.email) THEN
        INSERT INTO public.franchises (id, name, email)
        VALUES (
          gen_random_uuid()::text,
          v_name || ' Franchise',
          NEW.email
        );
      END IF;
    END IF;
  
    RETURN NEW;
  END;
  $function$;

  -- Update franchises policy
  DROP POLICY IF EXISTS "authenticated_select_own_franchise" ON public.franchises;
  CREATE POLICY "authenticated_select_own_franchise" ON public.franchises
    FOR SELECT TO authenticated
    USING (email = (auth.jwt() ->> 'email')::text);

  -- Update affiliate_partners policy
  DROP POLICY IF EXISTS "authenticated_select_own_affiliate" ON public.affiliate_partners;
  CREATE POLICY "authenticated_select_own_affiliate" ON public.affiliate_partners
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email')::text);
    
END $BODY$;

-- Seed test_franqueado@example.com
DO $BODY$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
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
      'test_franqueado@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Franqueado", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'test_franqueado@example.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Test Franqueado", "role": "franchisee"}' WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_user_id, 'test_franqueado@example.com', 'Test Franqueado', 'franchisee')
  ON CONFLICT (id) DO UPDATE SET role = 'franchisee';

  IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = 'test_franqueado@example.com') THEN
    INSERT INTO public.franchises (id, name, email)
    VALUES (gen_random_uuid()::text, 'Franquia Teste Franqueado', 'test_franqueado@example.com');
  END IF;
END $BODY$;

-- Seed adailtong@gmail.com
DO $BODY$
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
      '{"name": "Adailton G", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Adailton G", "role": "super_admin"}' WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton G', 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
END $BODY$;

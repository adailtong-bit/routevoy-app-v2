-- 1. Update handle_new_user_after to handle franchisee and link affiliate directly
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
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2. Seed data implementation with idempotent checks
DO $$
DECLARE
  v_franqueado_id uuid;
  v_afiliado_id uuid;
BEGIN
  -- Franchisee Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_franqueado@example.com') THEN
    v_franqueado_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_franqueado_id,
      '00000000-0000-0000-0000-000000000000',
      'test_franqueado@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Franqueado", "role": "franchisee"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.franchises (id, name, email)
    VALUES ('test-franchise-1', 'Franquia Teste', 'test_franqueado@example.com')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Affiliate Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_afiliado@example.com') THEN
    v_afiliado_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_afiliado_id,
      '00000000-0000-0000-0000-000000000000',
      'test_afiliado@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Afiliado", "role": "affiliate", "tax_id": "000.000.000-00"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
    VALUES (gen_random_uuid(), v_afiliado_id, 'test_afiliado@example.com', 'Test Afiliado', 'active', '000.000.000-00')
    ON CONFLICT (email) DO UPDATE SET status = 'active', user_id = EXCLUDED.user_id;
  END IF;
END $$;

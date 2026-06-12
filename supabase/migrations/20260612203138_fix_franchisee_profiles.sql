-- Update handle_new_user_after to automatically link franchisee to profile
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_name text;
  v_is_affiliate boolean;
  v_tax_id text;
  v_company_id text := NULL;
  v_merchant_id text;
  v_franchise_id text := NULL;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_is_affiliate := (v_role = 'affiliate');
  v_tax_id := NEW.raw_user_meta_data->>'tax_id';

  -- Handle merchant
  IF v_role IN ('merchant', 'shopkeeper') THEN
    SELECT id::text INTO v_merchant_id FROM public.merchants WHERE email = NEW.email LIMIT 1;
    IF v_merchant_id IS NULL THEN
      v_merchant_id := gen_random_uuid()::text;
      INSERT INTO public.merchants (id, name, email, status)
      VALUES (v_merchant_id, v_name || ' Store', NEW.email, 'active')
      ON CONFLICT (id) DO NOTHING;
    END IF;
    v_company_id := v_merchant_id;
  END IF;

  -- Handle franchisee
  IF v_role = 'franchisee' THEN
    SELECT id INTO v_franchise_id FROM public.franchises WHERE email = NEW.email LIMIT 1;
    IF v_franchise_id IS NULL THEN
      v_franchise_id := gen_random_uuid()::text;
      INSERT INTO public.franchises (id, name, email)
      VALUES (v_franchise_id, v_name || ' Franchise', NEW.email);
    END IF;
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id, company_id, franchise_id)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    v_is_affiliate,
    v_tax_id,
    v_company_id,
    v_franchise_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    is_affiliate = COALESCE(public.profiles.is_affiliate, EXCLUDED.is_affiliate),
    tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id),
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    franchise_id = COALESCE(public.profiles.franchise_id, EXCLUDED.franchise_id);

  -- Handle affiliate
  IF v_role = 'affiliate' THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      v_name,
      'active',
      v_tax_id
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        tax_id = COALESCE(public.affiliate_partners.tax_id, EXCLUDED.tax_id);
  END IF;

  RETURN NEW;
END;
$$;

-- Sync existing profiles with franchises
DO $$
BEGIN
  UPDATE public.profiles p
  SET franchise_id = f.id
  FROM public.franchises f
  WHERE p.role = 'franchisee'
    AND p.franchise_id IS NULL
    AND p.email = f.email;
END $$;

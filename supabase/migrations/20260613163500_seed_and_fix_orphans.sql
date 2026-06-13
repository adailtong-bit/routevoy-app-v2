CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Seed master admin user if not exists
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
      crypt('MasterAdmin@123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton (Master)", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton (Master)', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Ensure the role is super_admin if the user already exists
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE email = 'adailtong@gmail.com';
    
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"super_admin"')
    WHERE email = 'adailtong@gmail.com';
  END IF;

  -- 2. Fix orphan records in profiles referencing non-existent company_id
  UPDATE public.profiles
  SET company_id = NULL
  WHERE company_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.merchants WHERE merchants.id = profiles.company_id);

  UPDATE public.profiles
  SET franchise_id = NULL
  WHERE franchise_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.franchises WHERE franchises.id = profiles.franchise_id);

  -- 3. Fix orphan records in merchants
  UPDATE public.merchants
  SET franchise_id = NULL
  WHERE franchise_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.franchises WHERE franchises.id = merchants.franchise_id);

  -- 4. Fix orphan records in coupons
  UPDATE public.coupons
  SET company_id = NULL
  WHERE company_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.merchants WHERE merchants.id = coupons.company_id::text);

  UPDATE public.coupons
  SET franchise_id = NULL
  WHERE franchise_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.franchises WHERE franchises.id = coupons.franchise_id);

  -- 5. Fix orphan records in ad_campaigns
  UPDATE public.ad_campaigns
  SET company_id = NULL
  WHERE company_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.merchants WHERE merchants.id = ad_campaigns.company_id::text);

  UPDATE public.ad_campaigns
  SET franchise_id = NULL
  WHERE franchise_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.franchises WHERE franchises.id = ad_campaigns.franchise_id);

END $$;

-- 6. Ensure RLS policy functions handle hierarchy properly
CREATE OR REPLACE FUNCTION public.check_hierarchy_access(p_target_table text, p_franchise_id text DEFAULT NULL::text, p_company_id text DEFAULT NULL::text, p_affiliate_id uuid DEFAULT NULL::uuid, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
  v_user_franchise text;
  v_user_company text;
  v_user_affiliate uuid;
BEGIN
  -- Super admin / Master bypass
  IF (auth.jwt() ->> 'email') = 'adailtong@gmail.com' THEN
    RETURN true;
  END IF;

  SELECT role, franchise_id, company_id 
  INTO v_role, v_user_franchise, v_user_company
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_role IN ('admin', 'super_admin') THEN
    RETURN true;
  END IF;

  -- Franchisee
  IF v_role = 'franchisee' THEN
    IF p_franchise_id IS NOT NULL THEN
      RETURN v_user_franchise = p_franchise_id;
    END IF;
  END IF;

  -- Merchant
  IF v_role IN ('merchant', 'shopkeeper') THEN
    IF p_company_id IS NOT NULL THEN
      RETURN v_user_company = p_company_id;
    END IF;
  END IF;

  -- Affiliate
  IF v_role = 'affiliate' THEN
    SELECT id INTO v_user_affiliate FROM public.affiliate_partners WHERE user_id = auth.uid();
    IF p_affiliate_id IS NOT NULL THEN
      RETURN v_user_affiliate = p_affiliate_id;
    END IF;
  END IF;

  -- End User
  IF p_user_id IS NOT NULL THEN
    RETURN auth.uid() = p_user_id;
  END IF;

  RETURN false;
END;
$function$;

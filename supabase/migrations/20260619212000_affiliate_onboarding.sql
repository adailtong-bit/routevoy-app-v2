DO $$
BEGIN
  -- Add country to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

  -- Ensure affiliate_partners.status defaults to 'pending'
  ALTER TABLE public.affiliate_partners ALTER COLUMN status SET DEFAULT 'pending';
END $$;

CREATE OR REPLACE FUNCTION public.check_affiliate_platform_access()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_platform_ids JSONB;
  v_store_name TEXT;
  v_link TEXT;
  v_has_access BOOLEAN := FALSE;
  v_key TEXT;
BEGIN
  -- Only enforce for affiliates
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role != 'affiliate' THEN
    RETURN NEW;
  END IF;

  -- Get affiliate's platforms
  SELECT platform_ids INTO v_platform_ids 
  FROM public.affiliate_partners 
  WHERE user_id = auth.uid() AND status = 'active';

  IF v_platform_ids IS NULL OR v_platform_ids = '{}'::jsonb THEN
    RAISE EXCEPTION 'Affiliate has no authorized platforms.';
  END IF;

  -- Determine store name / link based on table
  IF TG_TABLE_NAME = 'discovered_promotions' THEN
    v_store_name := NEW.store_name;
    v_link := NEW.product_link;
  ELSIF TG_TABLE_NAME = 'ad_campaigns' THEN
    v_store_name := NEW.title;
    v_link := NEW.link;
  END IF;

  -- Check if any of the platform keys are in the store_name or link (case insensitive)
  FOR v_key IN SELECT jsonb_object_keys(v_platform_ids)
  LOOP
    IF (v_store_name IS NOT NULL AND v_store_name ILIKE '%' || v_key || '%') OR (v_link IS NOT NULL AND v_link ILIKE '%' || v_key || '%') THEN
      v_has_access := TRUE;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Not authorized to promote campaigns for this platform. Please request affiliation approval first.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_affiliate_platform_dp ON public.discovered_promotions;
CREATE TRIGGER trg_check_affiliate_platform_dp
  BEFORE INSERT OR UPDATE ON public.discovered_promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_affiliate_platform_access();

DROP TRIGGER IF EXISTS trg_check_affiliate_platform_ad ON public.ad_campaigns;
CREATE TRIGGER trg_check_affiliate_platform_ad
  BEFORE INSERT OR UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.check_affiliate_platform_access();

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed admin user (idempotent: skip if email already exists)
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
      '{"name": "Adailton Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

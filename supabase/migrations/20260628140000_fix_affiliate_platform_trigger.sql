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
  -- Skip enforcement when there is no authenticated session (migrations, seeds, service role)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only enforce for affiliates
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NULL OR v_role != 'affiliate' THEN
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

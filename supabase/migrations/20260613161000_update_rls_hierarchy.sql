DO $$
BEGIN
  -- Cleanup orphaned franchise_id in profiles
  UPDATE public.profiles p
  SET franchise_id = NULL
  WHERE p.franchise_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.franchises f WHERE f.id = p.franchise_id);

  -- Cleanup orphaned company_id in profiles
  UPDATE public.profiles p
  SET company_id = NULL
  WHERE p.company_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.merchants m WHERE m.id = p.company_id);
END $$;

CREATE OR REPLACE FUNCTION public.check_hierarchy_access(
  p_target_table text,
  p_franchise_id text DEFAULT NULL,
  p_company_id text DEFAULT NULL,
  p_affiliate_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
) RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Coupons
DROP POLICY IF EXISTS "hierarchy_coupons_select" ON public.coupons;
CREATE POLICY "hierarchy_coupons_select" ON public.coupons
FOR SELECT TO authenticated
USING (
  status = 'active' OR
  check_hierarchy_access('coupons', franchise_id, company_id::text, NULL, user_id)
);

DROP POLICY IF EXISTS "hierarchy_coupons_all" ON public.coupons;
CREATE POLICY "hierarchy_coupons_all" ON public.coupons
FOR ALL TO authenticated
USING (check_hierarchy_access('coupons', franchise_id, company_id::text, NULL, user_id))
WITH CHECK (check_hierarchy_access('coupons', franchise_id, company_id::text, NULL, user_id));

-- Ad Campaigns
DROP POLICY IF EXISTS "hierarchy_ads_select" ON public.ad_campaigns;
CREATE POLICY "hierarchy_ads_select" ON public.ad_campaigns
FOR SELECT TO authenticated
USING (
  status = 'active' OR
  check_hierarchy_access('ad_campaigns', franchise_id, company_id::text, NULL, NULL)
);

DROP POLICY IF EXISTS "hierarchy_ads_all" ON public.ad_campaigns;
CREATE POLICY "hierarchy_ads_all" ON public.ad_campaigns
FOR ALL TO authenticated
USING (check_hierarchy_access('ad_campaigns', franchise_id, company_id::text, NULL, NULL))
WITH CHECK (check_hierarchy_access('ad_campaigns', franchise_id, company_id::text, NULL, NULL));

-- Merchants
DROP POLICY IF EXISTS "hierarchy_merchants_select" ON public.merchants;
CREATE POLICY "hierarchy_merchants_select" ON public.merchants
FOR SELECT TO authenticated
USING (
  status = 'active' OR
  check_hierarchy_access('merchants', franchise_id, id, NULL, NULL)
);

DROP POLICY IF EXISTS "hierarchy_merchants_all" ON public.merchants;
CREATE POLICY "hierarchy_merchants_all" ON public.merchants
FOR ALL TO authenticated
USING (check_hierarchy_access('merchants', franchise_id, id, NULL, NULL))
WITH CHECK (check_hierarchy_access('merchants', franchise_id, id, NULL, NULL));

-- Profiles
DROP POLICY IF EXISTS "hierarchy_profiles_select" ON public.profiles;
CREATE POLICY "hierarchy_profiles_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR
  check_hierarchy_access('profiles', franchise_id, company_id, NULL, id)
);

DROP POLICY IF EXISTS "hierarchy_profiles_all" ON public.profiles;
CREATE POLICY "hierarchy_profiles_all" ON public.profiles
FOR ALL TO authenticated
USING (id = auth.uid() OR check_hierarchy_access('profiles', franchise_id, company_id, NULL, id))
WITH CHECK (id = auth.uid() OR check_hierarchy_access('profiles', franchise_id, company_id, NULL, id));

-- Affiliate Partners
DROP POLICY IF EXISTS "hierarchy_affiliates_select" ON public.affiliate_partners;
CREATE POLICY "hierarchy_affiliates_select" ON public.affiliate_partners
FOR SELECT TO authenticated
USING (
  check_hierarchy_access('affiliate_partners', franchise_id, NULL, id, user_id)
);

DROP POLICY IF EXISTS "hierarchy_affiliates_all" ON public.affiliate_partners;
CREATE POLICY "hierarchy_affiliates_all" ON public.affiliate_partners
FOR ALL TO authenticated
USING (check_hierarchy_access('affiliate_partners', franchise_id, NULL, id, user_id))
WITH CHECK (check_hierarchy_access('affiliate_partners', franchise_id, NULL, id, user_id));

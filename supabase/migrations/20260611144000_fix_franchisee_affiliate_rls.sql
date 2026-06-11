DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    -- Ensure profile exists
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (v_admin_id, 'adailtong@gmail.com', 'Admin User', 'super_admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_affiliate = true;

    -- Ensure affiliate_partners exists
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
    VALUES (gen_random_uuid(), v_admin_id, 'adailtong@gmail.com', 'Admin Affiliate', 'active')
    ON CONFLICT (email) DO UPDATE SET user_id = v_admin_id;

    -- Ensure franchise exists
    IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = 'adailtong@gmail.com') THEN
      INSERT INTO public.franchises (id, name, email, region)
      VALUES (gen_random_uuid()::text, 'Admin Franchise', 'adailtong@gmail.com', 'Global');
    END IF;
  END IF;
END $$;

-- RLS Updates for Franchisee

-- coupons
DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
CREATE POLICY "franchisee_all_coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (coupons.franchise_id = f.id OR coupons.company_id IN (SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (coupons.franchise_id = f.id OR coupons.company_id IN (SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id))
    )
  );

-- merchants
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
CREATE POLICY "franchisee_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND merchants.region_id = f.region_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND merchants.region_id = f.region_id
    )
  );

-- ad_campaigns
DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND ad_campaigns.company_id IN (SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND ad_campaigns.company_id IN (SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id)
    )
  );

-- user_engagements
DROP POLICY IF EXISTS "franchisee_select_user_engagements" ON public.user_engagements;
CREATE POLICY "franchisee_select_user_engagements" ON public.user_engagements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.franchises f ON f.email = p.email
      JOIN public.coupons c ON c.id = user_engagements.campaign_id
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (c.franchise_id = f.id OR c.company_id IN (SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id))
    )
  );

DO $$
DECLARE
    v_user_id uuid;
    v_franchise_id text;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Ensure profile exists with admin role
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
        
        -- Ensure a franchise exists for this test and link to user
        v_franchise_id := 'franchise-admin-test';
        INSERT INTO public.franchises (id, name, email, region, region_id)
        VALUES (v_franchise_id, 'Admin Master Franchise', 'adailtong@gmail.com', 'Global', 'global-01')
        ON CONFLICT (id) DO NOTHING;
        
    END IF;
END $$;

-- Drop conflicting or old policies before recreating
DROP POLICY IF EXISTS "franchisee_manage_affiliates" ON public.affiliate_partners;
CREATE POLICY "franchisee_manage_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN franchises f ON f.email = p.email 
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (affiliate_partners.region_id = f.region_id OR affiliate_partners.region = f.region)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN franchises f ON f.email = p.email 
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (affiliate_partners.region_id = f.region_id OR affiliate_partners.region = f.region)
    )
  );

DROP POLICY IF EXISTS "franchisee_manage_merchants" ON public.merchants;
CREATE POLICY "franchisee_manage_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN franchises f ON f.email = p.email 
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (merchants.region_id = f.region_id OR merchants.region = f.region)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN franchises f ON f.email = p.email 
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (merchants.region_id = f.region_id OR merchants.region = f.region)
    )
  );

DROP POLICY IF EXISTS "franchisee_manage_coupons_ext" ON public.coupons;
CREATE POLICY "franchisee_manage_coupons_ext" ON public.coupons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN franchises f ON f.email = p.email 
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (
        coupons.franchise_id = f.id OR 
        coupons.company_id IN (SELECT id FROM merchants WHERE region_id = f.region_id OR region = f.region)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN franchises f ON f.email = p.email 
      WHERE p.id = auth.uid() AND p.role = 'franchisee' AND (
        coupons.franchise_id = f.id OR 
        coupons.company_id IN (SELECT id FROM merchants WHERE region_id = f.region_id OR region = f.region)
      )
    )
  );

-- Ensure franchisee can SELECT/INSERT/UPDATE/DELETE affiliate_partners by franchise_id
DROP POLICY IF EXISTS "affiliate_partners_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_insert" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_update" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_partners_delete" ON public.affiliate_partners;
DROP POLICY IF EXISTS "super_admin_all_affiliates_override" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliates_read_access" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliates_insert_access" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliates_update_access" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliates_delete_access" ON public.affiliate_partners;

CREATE POLICY "affiliate_partners_select" ON public.affiliate_partners
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = affiliate_partners.franchise_id)
      )
    )
  );

CREATE POLICY "affiliate_partners_insert" ON public.affiliate_partners
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = affiliate_partners.franchise_id)
      )
    )
  );

CREATE POLICY "affiliate_partners_update" ON public.affiliate_partners
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = affiliate_partners.franchise_id)
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = affiliate_partners.franchise_id)
      )
    )
  );

CREATE POLICY "affiliate_partners_delete" ON public.affiliate_partners
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = affiliate_partners.franchise_id)
      )
    )
  );

-- Ensure franchisee can manage merchants by franchise_id
DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
CREATE POLICY "franchisee_all_merchants" ON public.merchants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = merchants.franchise_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'super_admin')
        OR p.email = 'adailtong@gmail.com'
        OR (p.role = 'franchisee' AND p.franchise_id = merchants.franchise_id)
      )
    )
  );

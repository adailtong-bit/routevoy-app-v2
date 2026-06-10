DO $$
BEGIN
    -- Fix uuid vs text type conflicts for merchants ID and its dependencies
    -- merchants.id currently stores text. If it is purely text strings (non-uuids), converting it directly 
    -- could fail. Supabase auth.uid() gives UUID. We'll explicitly convert columns that map to merchants.id
    
    DROP POLICY IF EXISTS "auth_all_merchants" ON public.merchants;
    DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;
    
    DROP POLICY IF EXISTS "crm_campaigns_delete" ON public.crm_campaigns;
    DROP POLICY IF EXISTS "crm_campaigns_insert" ON public.crm_campaigns;
    DROP POLICY IF EXISTS "crm_campaigns_select" ON public.crm_campaigns;
    DROP POLICY IF EXISTS "crm_campaigns_update" ON public.crm_campaigns;

    DROP POLICY IF EXISTS "crm_target_groups_delete" ON public.crm_target_groups;
    DROP POLICY IF EXISTS "crm_target_groups_insert" ON public.crm_target_groups;
    DROP POLICY IF EXISTS "crm_target_groups_select" ON public.crm_target_groups;
    DROP POLICY IF EXISTS "crm_target_groups_update" ON public.crm_target_groups;

    -- Alter table types cautiously
    BEGIN
        ALTER TABLE public.crm_campaigns ALTER COLUMN company_id TYPE uuid USING NULLIF(company_id, '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert crm_campaigns.company_id to UUID natively.';
    END;

    BEGIN
        ALTER TABLE public.crm_target_groups ALTER COLUMN company_id TYPE uuid USING NULLIF(company_id, '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert crm_target_groups.company_id to UUID natively.';
    END;

    BEGIN
        ALTER TABLE public.coupons ALTER COLUMN company_id TYPE uuid USING NULLIF(company_id, '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert coupons.company_id to UUID natively.';
    END;

    BEGIN
        ALTER TABLE public.discovered_promotions ALTER COLUMN company_id TYPE uuid USING NULLIF(company_id, '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert discovered_promotions.company_id to UUID natively.';
    END;

    BEGIN
        ALTER TABLE public.ad_campaigns ALTER COLUMN company_id TYPE uuid USING NULLIF(company_id, '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert ad_campaigns.company_id to UUID natively.';
    END;

    BEGIN
        ALTER TABLE public.merchants ALTER COLUMN id TYPE uuid USING id::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not convert merchants.id to UUID natively.';
    END;

    -- Re-create policies for merchants
    CREATE POLICY "auth_all_merchants" ON public.merchants FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "public_read_merchants" ON public.merchants FOR SELECT TO public USING (true);

    -- Re-create policies for crm_campaigns - using type casting to avoid UUID vs text operator mismatch
    CREATE POLICY "crm_campaigns_delete" ON public.crm_campaigns FOR DELETE TO authenticated 
      USING ( company_id::text = (auth.uid())::text OR franchise_id::text = (auth.uid())::text OR affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) );
    CREATE POLICY "crm_campaigns_insert" ON public.crm_campaigns FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "crm_campaigns_select" ON public.crm_campaigns FOR SELECT TO authenticated 
      USING ( company_id::text = (auth.uid())::text OR franchise_id::text = (auth.uid())::text OR affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) );
    CREATE POLICY "crm_campaigns_update" ON public.crm_campaigns FOR UPDATE TO authenticated 
      USING ( company_id::text = (auth.uid())::text OR franchise_id::text = (auth.uid())::text OR affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) ) WITH CHECK (true);

    -- Re-create policies for crm_target_groups
    CREATE POLICY "crm_target_groups_delete" ON public.crm_target_groups FOR DELETE TO authenticated 
      USING ( company_id::text = (auth.uid())::text OR franchise_id::text = (auth.uid())::text OR affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) );
    CREATE POLICY "crm_target_groups_insert" ON public.crm_target_groups FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "crm_target_groups_select" ON public.crm_target_groups FOR SELECT TO authenticated 
      USING ( company_id::text = (auth.uid())::text OR franchise_id::text = (auth.uid())::text OR affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) );
    CREATE POLICY "crm_target_groups_update" ON public.crm_target_groups FOR UPDATE TO authenticated 
      USING ( company_id::text = (auth.uid())::text OR franchise_id::text = (auth.uid())::text OR affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')) ) WITH CHECK (true);

END $$;

-- Ensure Adailton seed user has access
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  IF FOUND THEN
    INSERT INTO public.merchants (id, name, email, status)
    VALUES (v_user_id::text, 'Merchant Admin (Adailton)', 'adailtong@gmail.com', 'active')
    ON CONFLICT (id) DO UPDATE SET status = 'active';
    
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  END IF;
END $$;

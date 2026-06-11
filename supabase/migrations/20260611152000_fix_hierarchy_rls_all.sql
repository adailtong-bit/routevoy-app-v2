DO $$
BEGIN
    -- Fixes for RLS type casting errors (UUID vs TEXT) and hierarchy enforcement

    -- 1. Profiles Policy
    DROP POLICY IF EXISTS "franchisee_read_profiles" ON public.profiles;
    CREATE POLICY "franchisee_read_profiles" ON public.profiles
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.franchises f
          WHERE f.email = (SELECT email FROM auth.users WHERE id = auth.uid())
          AND (
            profiles.company_id IN (
              SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id OR m.region = f.region
            )
          )
        )
      );

    -- 2. Merchants Policy
    DROP POLICY IF EXISTS "franchisee_manage_merchants" ON public.merchants;
    DROP POLICY IF EXISTS "franchisee_all_merchants" ON public.merchants;
    CREATE POLICY "franchisee_manage_merchants" ON public.merchants
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (merchants.region_id = f.region_id OR merchants.region = f.region)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (merchants.region_id = f.region_id OR merchants.region = f.region)
        )
      );

    -- 3. Affiliate Partners Policy
    DROP POLICY IF EXISTS "franchisee_manage_affiliates" ON public.affiliate_partners;
    CREATE POLICY "franchisee_manage_affiliates" ON public.affiliate_partners
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (affiliate_partners.region_id = f.region_id OR affiliate_partners.region = f.region)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (affiliate_partners.region_id = f.region_id OR affiliate_partners.region = f.region)
        )
      );

    -- 4. Coupons Policy
    DROP POLICY IF EXISTS "franchisee_manage_coupons_ext" ON public.coupons;
    DROP POLICY IF EXISTS "franchisee_all_coupons" ON public.coupons;
    CREATE POLICY "franchisee_manage_coupons_ext" ON public.coupons
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (
            coupons.franchise_id = f.id OR 
            coupons.company_id::text IN (
              SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id OR m.region = f.region
            )
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (
            coupons.franchise_id = f.id OR 
            coupons.company_id::text IN (
              SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id OR m.region = f.region
            )
          )
        )
      );

    -- 5. Ad Campaigns Policy
    DROP POLICY IF EXISTS "franchisee_all_ad_campaigns" ON public.ad_campaigns;
    CREATE POLICY "franchisee_all_ad_campaigns" ON public.ad_campaigns
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (
            ad_campaigns.company_id::text IN (
              SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id OR m.region = f.region
            )
          )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p 
          JOIN franchises f ON f.email = p.email
          WHERE p.id = auth.uid() AND p.role = 'franchisee'
          AND (
            ad_campaigns.company_id::text IN (
              SELECT m.id FROM public.merchants m WHERE m.region_id = f.region_id OR m.region = f.region
            )
          )
        )
      );

    -- 6. CRM Target Groups Policy
    DROP POLICY IF EXISTS "crm_target_groups_delete" ON public.crm_target_groups;
    CREATE POLICY "crm_target_groups_delete" ON public.crm_target_groups
      FOR DELETE TO authenticated
      USING (
        company_id = auth.uid()::text 
        OR franchise_id = auth.uid()::text 
        OR affiliate_id::text = auth.uid()::text 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee')
        )
      );

    -- 7. CRM Campaigns Policy
    DROP POLICY IF EXISTS "crm_campaigns_delete" ON public.crm_campaigns;
    CREATE POLICY "crm_campaigns_delete" ON public.crm_campaigns
      FOR DELETE TO authenticated
      USING (
        company_id = auth.uid()::text 
        OR franchise_id = auth.uid()::text 
        OR affiliate_id::text = auth.uid()::text 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee')
        )
      );

    DROP POLICY IF EXISTS "crm_campaigns_merchant_all" ON public.crm_campaigns;
    CREATE POLICY "crm_campaigns_merchant_all" ON public.crm_campaigns
      FOR ALL TO authenticated
      USING (
        company_id = auth.uid()::text 
        OR franchise_id = auth.uid()::text 
        OR affiliate_id::text = auth.uid()::text 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee')
        )
      )
      WITH CHECK (
        company_id = auth.uid()::text 
        OR franchise_id = auth.uid()::text 
        OR affiliate_id::text = auth.uid()::text 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'franchisee')
        )
      );

    -- Seed Data Fix for adailtong@gmail.com
    -- Ensure the user is a franchisee and has a franchise record
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
      DECLARE
        v_user_id uuid;
        v_franchise_id text;
      BEGIN
        SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
        
        -- Make sure the profile exists and is updated
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (v_user_id, 'adailtong@gmail.com', 'Admin Master', 'franchisee')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'franchisee';

        -- Create a franchise record linked to this email
        IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = 'adailtong@gmail.com') THEN
          v_franchise_id := gen_random_uuid()::text;
          INSERT INTO public.franchises (id, name, email, region, region_id, coverage_scope)
          VALUES (v_franchise_id, 'Master Franchise', 'adailtong@gmail.com', 'Global', 'GLOBAL', 'national');
        END IF;
      END;
    END IF;

END $$;

-- 1. Fix Foreign Key Constraints for ad_campaigns to allow deletion
ALTER TABLE public.ad_invoices DROP CONSTRAINT IF EXISTS ad_invoices_ad_id_fkey;

-- Cleanup orphaned records before adding constraints to avoid violations
DELETE FROM public.ad_invoices WHERE ad_id IS NOT NULL AND ad_id NOT IN (SELECT id FROM public.ad_campaigns);
DELETE FROM public.user_engagements WHERE campaign_id IS NOT NULL AND campaign_id NOT IN (SELECT id FROM public.ad_campaigns);

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.ad_invoices ADD CONSTRAINT ad_invoices_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE public.user_engagements DROP CONSTRAINT IF EXISTS user_engagements_campaign_id_fkey;
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.user_engagements ADD CONSTRAINT user_engagements_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;


-- 2. Add Explicit DELETE Policies

-- ad_campaigns
DROP POLICY IF EXISTS "auth_delete_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "auth_delete_ad_campaigns" ON public.ad_campaigns
FOR DELETE TO authenticated
USING (
  company_id::text = get_auth_user_company_id() OR
  franchise_id = get_auth_user_franchise_id() OR
  affiliate_id = get_auth_user_affiliate_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- crm_campaigns
DROP POLICY IF EXISTS "auth_delete_crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "auth_delete_crm_campaigns" ON public.crm_campaigns
FOR DELETE TO authenticated
USING (
  company_id = get_auth_user_company_id() OR
  franchise_id = get_auth_user_franchise_id() OR
  affiliate_id = get_auth_user_affiliate_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- discovered_promotions
DROP POLICY IF EXISTS "auth_delete_discovered_promotions" ON public.discovered_promotions;
CREATE POLICY "auth_delete_discovered_promotions" ON public.discovered_promotions
FOR DELETE TO authenticated
USING (
  company_id = get_auth_user_company_id() OR
  affiliate_id = get_auth_user_affiliate_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);


-- 3. Ensure target user exists and has super_admin role
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin', 'active')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE email = 'adailtong@gmail.com' AND role != 'super_admin';
  END IF;
END $$;

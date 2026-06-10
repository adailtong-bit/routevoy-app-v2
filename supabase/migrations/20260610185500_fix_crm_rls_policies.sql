-- Fix RLS for crm_campaigns and crm_target_groups to be sure merchants can see their own data
DROP POLICY IF EXISTS "crm_campaigns_select" ON public.crm_campaigns;
CREATE POLICY "crm_campaigns_select" ON public.crm_campaigns
FOR SELECT TO authenticated
USING (
  company_id = auth.uid() OR
  franchise_id = auth.uid() OR
  affiliate_id = auth.uid() OR
  EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ) OR
  company_id IN ( SELECT id FROM merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  franchise_id IN ( SELECT id FROM franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  affiliate_id IN ( SELECT id FROM affiliate_partners WHERE user_id = auth.uid() )
);

DROP POLICY IF EXISTS "crm_campaigns_insert" ON public.crm_campaigns;
CREATE POLICY "crm_campaigns_insert" ON public.crm_campaigns
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "crm_campaigns_update" ON public.crm_campaigns;
CREATE POLICY "crm_campaigns_update" ON public.crm_campaigns
FOR UPDATE TO authenticated
USING (
  company_id = auth.uid() OR
  franchise_id = auth.uid() OR
  affiliate_id = auth.uid() OR
  EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ) OR
  company_id IN ( SELECT id FROM merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  franchise_id IN ( SELECT id FROM franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  affiliate_id IN ( SELECT id FROM affiliate_partners WHERE user_id = auth.uid() )
)
WITH CHECK (true);

DROP POLICY IF EXISTS "crm_campaigns_delete" ON public.crm_campaigns;
CREATE POLICY "crm_campaigns_delete" ON public.crm_campaigns
FOR DELETE TO authenticated
USING (
  company_id = auth.uid() OR
  franchise_id = auth.uid() OR
  affiliate_id = auth.uid() OR
  EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ) OR
  company_id IN ( SELECT id FROM merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  franchise_id IN ( SELECT id FROM franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  affiliate_id IN ( SELECT id FROM affiliate_partners WHERE user_id = auth.uid() )
);

-- Fix RLS for crm_target_groups
DROP POLICY IF EXISTS "crm_target_groups_select" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_select" ON public.crm_target_groups
FOR SELECT TO authenticated
USING (
  company_id = auth.uid() OR
  franchise_id = auth.uid() OR
  affiliate_id = auth.uid() OR
  EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ) OR
  company_id IN ( SELECT id FROM merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  franchise_id IN ( SELECT id FROM franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  affiliate_id IN ( SELECT id FROM affiliate_partners WHERE user_id = auth.uid() )
);

DROP POLICY IF EXISTS "crm_target_groups_insert" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_insert" ON public.crm_target_groups
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "crm_target_groups_update" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_update" ON public.crm_target_groups
FOR UPDATE TO authenticated
USING (
  company_id = auth.uid() OR
  franchise_id = auth.uid() OR
  affiliate_id = auth.uid() OR
  EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ) OR
  company_id IN ( SELECT id FROM merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  franchise_id IN ( SELECT id FROM franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  affiliate_id IN ( SELECT id FROM affiliate_partners WHERE user_id = auth.uid() )
)
WITH CHECK (true);

DROP POLICY IF EXISTS "crm_target_groups_delete" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_delete" ON public.crm_target_groups
FOR DELETE TO authenticated
USING (
  company_id = auth.uid() OR
  franchise_id = auth.uid() OR
  affiliate_id = auth.uid() OR
  EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin') ) OR
  company_id IN ( SELECT id FROM merchants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  franchise_id IN ( SELECT id FROM franchises WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) ) OR
  affiliate_id IN ( SELECT id FROM affiliate_partners WHERE user_id = auth.uid() )
);

-- Seed test admin user for adailtong@gmail.com securely
DO $DO_BLOCK$
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Master", "role": "super_admin"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Master', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $DO_BLOCK$;

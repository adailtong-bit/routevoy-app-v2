DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed adailtong@gmail.com as super_admin
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
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Add billing fields to merchants table
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS billing_name TEXT;

-- RLS policies for merchants
DROP POLICY IF EXISTS "merchants_select" ON public.merchants;
CREATE POLICY "merchants_select" ON public.merchants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "merchants_update" ON public.merchants;
CREATE POLICY "merchants_update" ON public.merchants FOR UPDATE TO authenticated USING (
  id = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid() LIMIT 1) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- RLS for crm_target_groups
DROP POLICY IF EXISTS "crm_target_groups_insert" ON public.crm_target_groups;
CREATE POLICY "crm_target_groups_insert" ON public.crm_target_groups FOR INSERT TO authenticated WITH CHECK (
  company_id = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid() LIMIT 1) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- RLS for ad_invoices (allow insert for purchases)
DROP POLICY IF EXISTS "ad_invoices_insert" ON public.ad_invoices;
CREATE POLICY "ad_invoices_insert" ON public.ad_invoices FOR INSERT TO authenticated WITH CHECK (true);

-- Ensure ad_advertisers can be inserted and viewed by merchant
DROP POLICY IF EXISTS "ad_advertisers_insert" ON public.ad_advertisers;
CREATE POLICY "ad_advertisers_insert" ON public.ad_advertisers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "ad_advertisers_select" ON public.ad_advertisers;
CREATE POLICY "ad_advertisers_select" ON public.ad_advertisers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ad_advertisers_update" ON public.ad_advertisers;
CREATE POLICY "ad_advertisers_update" ON public.ad_advertisers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

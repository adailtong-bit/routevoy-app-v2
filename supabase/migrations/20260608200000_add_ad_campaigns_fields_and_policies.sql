-- Add hierarchical geographic columns and priority_score to ad_campaigns
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0;
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.ad_campaigns ADD COLUMN IF NOT EXISTS city text;

-- Add RLS policies for franchisee and merchants to access their own campaigns
DROP POLICY IF EXISTS "manage_own_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "manage_own_ad_campaigns" ON public.ad_campaigns
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  OR
  EXISTS (
    SELECT 1 FROM public.merchants 
    WHERE merchants.id = ad_campaigns.company_id
    AND merchants.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR
  (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'franchisee')
    AND
    ad_campaigns.region IN (
      SELECT region FROM public.franchises 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "public_read_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "public_read_ad_campaigns" ON public.ad_campaigns
FOR SELECT TO public
USING (true);

-- Seed adailtong@gmail.com
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
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

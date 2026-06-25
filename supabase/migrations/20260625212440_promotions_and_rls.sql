DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
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

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create promotions bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for promotions bucket
DROP POLICY IF EXISTS "Public access to promotions" ON storage.objects;
CREATE POLICY "Public access to promotions" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Authenticated users can upload promotions" ON storage.objects;
CREATE POLICY "Authenticated users can upload promotions" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Users can update their own promotions" ON storage.objects;
CREATE POLICY "Users can update their own promotions" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Users can delete their own promotions" ON storage.objects;
CREATE POLICY "Users can delete their own promotions" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'promotions');

-- Fix RLS for ad_campaigns
DROP POLICY IF EXISTS "auth_delete_ad_campaigns_override" ON public.ad_campaigns;
CREATE POLICY "auth_delete_ad_campaigns_override" ON public.ad_campaigns
  FOR DELETE TO authenticated 
  USING (
    company_id = public.get_auth_user_company_id() 
    OR franchise_id = public.get_auth_user_franchise_id()
    OR affiliate_id = public.get_auth_user_affiliate_id()
  );

-- Fix RLS for crm_campaigns
DROP POLICY IF EXISTS "auth_delete_crm_campaigns_override" ON public.crm_campaigns;
CREATE POLICY "auth_delete_crm_campaigns_override" ON public.crm_campaigns
  FOR DELETE TO authenticated 
  USING (
    company_id = public.get_auth_user_company_id() 
    OR franchise_id = public.get_auth_user_franchise_id()
    OR affiliate_id = public.get_auth_user_affiliate_id()
  );

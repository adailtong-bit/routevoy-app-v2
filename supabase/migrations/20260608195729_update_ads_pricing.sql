DO $$
BEGIN
  -- 1. Ensure site_settings table exists and is accessible
  CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 2. Insert default commission percentage if it doesn't exist
  INSERT INTO public.site_settings (key, value)
  VALUES ('ad_commission_percentage', '{"percentage": 10}'::jsonb)
  ON CONFLICT (key) DO NOTHING;

  -- 3. Update RLS for ad_pricing to allow franchisee management
  DROP POLICY IF EXISTS "admin_all_ad_pricing" ON public.ad_pricing;
  
  CREATE POLICY "manage_ad_pricing" ON public.ad_pricing
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'franchisee')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin', 'franchisee')
      )
    );
END $$;

DO $$
BEGIN
  -- Insert/update default english hero_content
  INSERT INTO public.site_settings (key, value, updated_at)
  VALUES (
    'hero_content',
    '{"title": "Discover the Best Local Deals", "subtitle": "Find exclusive coupons, must-see promotions and amazing experiences based on your location.", "cta_text": "Enter Platform"}'::jsonb,
    NOW()
  )
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

  -- Insert/update default english system_config
  INSERT INTO public.site_settings (key, value, updated_at)
  VALUES (
    'system_config',
    '{"default_country": "United States", "default_currency": "USD", "default_language": "en"}'::jsonb,
    NOW()
  )
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

  -- Ensure proper RLS on site_settings
  DROP POLICY IF EXISTS "admin_write_site_settings" ON public.site_settings;
  CREATE POLICY "admin_write_site_settings" ON public.site_settings
    FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
      )
    );
END $$;

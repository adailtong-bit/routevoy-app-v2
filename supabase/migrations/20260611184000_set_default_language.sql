DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'default_language') THEN
    INSERT INTO public.site_settings (id, key, value, updated_at)
    VALUES (gen_random_uuid(), 'default_language', '"en"'::jsonb, NOW());
  ELSE
    UPDATE public.site_settings SET value = '"en"'::jsonb, updated_at = NOW() WHERE key = 'default_language';
  END IF;
END $$;

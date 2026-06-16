CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_write_site_settings" ON public.site_settings;
CREATE POLICY "admin_write_site_settings" ON public.site_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

INSERT INTO public.site_settings (key, value) VALUES
  ('system_config', '{"default_country": "Brasil", "default_currency": "BRL", "default_language": "pt-BR"}'::jsonb),
  ('geo_hierarchy', '{"supported_countries": "BR", "default_radius": 50, "levels": "País > Estado > Cidade > Bairro"}'::jsonb),
  ('footer_content', '{"about": "Somos um aplicativo que agrega cupons com geolocalização...", "company": "RouteVoy Inc", "mission": "Conectar clientes aos melhores negócios locais", "contact": "contato@routevoy.com"}'::jsonb),
  ('hero_content', '{"title": "Descubra as Melhores Ofertas Locais", "subtitle": "Encontre cupons e promoções perto de você.", "cta_text": "Explorar Ofertas"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

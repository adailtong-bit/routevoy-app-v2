CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_insert_site_settings" ON public.site_settings;
CREATE POLICY "authenticated_insert_site_settings" ON public.site_settings
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_site_settings" ON public.site_settings;
CREATE POLICY "authenticated_update_site_settings" ON public.site_settings
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_site_settings" ON public.site_settings;
CREATE POLICY "authenticated_delete_site_settings" ON public.site_settings
    FOR DELETE TO authenticated USING (true);

INSERT INTO public.site_settings (key, value)
VALUES 
(
    'footer_content',
    '{"about": "We are a platform dedicated to bringing the best deals and opportunities to our users through geolocation.", "company": "Routevoy Inc. is a technology company focused on connecting local businesses with consumers.", "mission": "Our mission is to empower local commerce and help users save money on their everyday purchases.", "contact": "Email: contact@routevoy.com\nPhone: +1 234 567 8900\nAddress: 123 Tech Street, Suite 456, City, Country"}'::jsonb
),
(
    'hero_content',
    '{"title": "Descubra as Melhores Ofertas Locais", "subtitle": "Encontre cupons exclusivos, promoções imperdíveis e experiências incríveis com base na sua localização.", "cta_text": "Entrar na Plataforma"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

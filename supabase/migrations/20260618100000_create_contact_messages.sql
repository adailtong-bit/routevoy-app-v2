CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.contact_messages;
CREATE POLICY "Enable insert for all users" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for admins" ON public.contact_messages;
CREATE POLICY "Enable read access for admins" ON public.contact_messages
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Seed data for site settings if missing
INSERT INTO public.site_settings (key, value)
VALUES (
    'footer_content',
    '{"about": "We are a platform dedicated to bringing the best deals and opportunities to our users through geolocation.", "company": "OPPORJOB is a technology company focused on connecting local businesses with consumers.", "mission": "Our mission is to empower local commerce and help users save money on their everyday purchases.", "contact": "Email: contact@opporjob.com\nPhone: +1 234 567 8900\nAddress: 123 Tech Street, Suite 456, City, Country"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

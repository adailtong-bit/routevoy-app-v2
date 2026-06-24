DO $$
BEGIN
    -- Ensure the contact_messages table exists
    CREATE TABLE IF NOT EXISTS public.contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        reply_text TEXT,
        replied_at TIMESTAMPTZ,
        status TEXT DEFAULT 'pending'::text
    );

    -- Ensure all columns exist idempotently
    ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS subject TEXT;
    ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS reply_text TEXT;
    ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
    ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'::text;

    -- Enable RLS
    ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

    -- Policy: Allow anyone to insert messages
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.contact_messages;
    CREATE POLICY "Enable insert for all users" ON public.contact_messages
        FOR INSERT WITH CHECK (true);

    -- Policy: Allow admins to manage messages
    DROP POLICY IF EXISTS "admin_all_contact_messages" ON public.contact_messages;
    CREATE POLICY "admin_all_contact_messages" ON public.contact_messages
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'super_admin')
            )
            OR auth.jwt() ->> 'email' = 'adailtong@gmail.com'
        );
END $$;

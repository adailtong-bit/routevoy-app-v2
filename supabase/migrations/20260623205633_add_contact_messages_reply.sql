DO $$
BEGIN
  ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS reply_text TEXT;
  ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
  ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
END $$;

DROP POLICY IF EXISTS "Enable read access for admins" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable update for admins" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_all_contact_messages" ON public.contact_messages;

CREATE POLICY "admin_all_contact_messages" ON public.contact_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'adailtong@gmail.com'
    )
  );

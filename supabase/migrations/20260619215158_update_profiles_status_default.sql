ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';

DROP POLICY IF EXISTS "auth_read_own_profile" ON public.profiles;
CREATE POLICY "auth_read_own_profile" ON public.profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

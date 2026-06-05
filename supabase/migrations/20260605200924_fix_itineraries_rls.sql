-- Make sure RLS is enabled
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Drop existing to be idempotent
DROP POLICY IF EXISTS "authenticated_select" ON public.itineraries;
DROP POLICY IF EXISTS "authenticated_insert" ON public.itineraries;
DROP POLICY IF EXISTS "authenticated_update" ON public.itineraries;
DROP POLICY IF EXISTS "authenticated_delete" ON public.itineraries;

-- Recreate policies
CREATE POLICY "authenticated_select" ON public.itineraries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "authenticated_insert" ON public.itineraries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_update" ON public.itineraries
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_delete" ON public.itineraries
  FOR DELETE TO authenticated USING (user_id = auth.uid());

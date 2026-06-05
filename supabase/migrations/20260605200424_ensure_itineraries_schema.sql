-- Ensure the itineraries table exists with correct schema
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  destination TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any potentially missing columns idempotently
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure RLS is enabled
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Idempotently recreate RLS policies
DROP POLICY IF EXISTS "authenticated_select" ON public.itineraries;
CREATE POLICY "authenticated_select" ON public.itineraries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert" ON public.itineraries;
CREATE POLICY "authenticated_insert" ON public.itineraries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_update" ON public.itineraries;
CREATE POLICY "authenticated_update" ON public.itineraries
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_delete" ON public.itineraries;
CREATE POLICY "authenticated_delete" ON public.itineraries
  FOR DELETE TO authenticated USING (user_id = auth.uid());

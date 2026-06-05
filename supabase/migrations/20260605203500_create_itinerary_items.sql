CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hotel', 'activity', 'coupon')),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can read own itinerary items" ON public.itinerary_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can insert own itinerary items" ON public.itinerary_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can update own itinerary items" ON public.itinerary_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can delete own itinerary items" ON public.itinerary_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_itinerary_items_itinerary_id ON public.itinerary_items(itinerary_id);

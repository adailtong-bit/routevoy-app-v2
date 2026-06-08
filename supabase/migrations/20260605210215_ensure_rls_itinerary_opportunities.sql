-- Ensure public read for opportunities
DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;
CREATE POLICY "public_read_coupons" ON public.coupons
  FOR SELECT TO public USING (status = 'active');

DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
CREATE POLICY "public_read_promotions" ON public.discovered_promotions
  FOR SELECT TO public USING (true);

-- Ensure itinerary items access
DROP POLICY IF EXISTS "Users can read own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can read own itinerary items" ON public.itinerary_items
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can insert own itinerary items" ON public.itinerary_items
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can update own itinerary items" ON public.itinerary_items
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can delete own itinerary items" ON public.itinerary_items
  FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid()));

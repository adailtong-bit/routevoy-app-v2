-- Update constraint
ALTER TABLE public.itinerary_items DROP CONSTRAINT IF EXISTS itinerary_items_type_check;

ALTER TABLE public.itinerary_items ADD CONSTRAINT itinerary_items_type_check 
  CHECK (type = ANY (ARRAY['hotel'::text, 'activity'::text, 'coupon'::text, 'car_rental'::text, 'museum'::text]));

-- Seed the user "adailtong@gmail.com"
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin') ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Ensure RLS Policies for itineraries and itinerary_items
DROP POLICY IF EXISTS "authenticated_select" ON public.itineraries;
CREATE POLICY "authenticated_select" ON public.itineraries FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert" ON public.itineraries;
CREATE POLICY "authenticated_insert" ON public.itineraries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_update" ON public.itineraries;
CREATE POLICY "authenticated_update" ON public.itineraries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_delete" ON public.itineraries;
CREATE POLICY "authenticated_delete" ON public.itineraries FOR DELETE TO authenticated USING (user_id = auth.uid());


DROP POLICY IF EXISTS "Users can read own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can read own itinerary items" ON public.itinerary_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can insert own itinerary items" ON public.itinerary_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can update own itinerary items" ON public.itinerary_items FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own itinerary items" ON public.itinerary_items;
CREATE POLICY "Users can delete own itinerary items" ON public.itinerary_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
);

-- Seed Data for Discovered Promotions and Coupons
DO $$
BEGIN
  -- Insert into discovered_promotions
  INSERT INTO public.discovered_promotions (id, title, description, category, environment, status, store_name, price) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Localiza Demo - 15% OFF', 'Aluguel de carros com desconto', 'car_rental', 'production', 'published', 'Localiza', 150),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Movida Demo - Fim de Semana', 'Fim de semana promocional', 'car_rental', 'production', 'published', 'Movida', 120),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Museu do Amanhã Demo', 'Ingresso inteiro', 'museum', 'production', 'published', 'Museu do Amanhã', 30),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'MASP Demo', 'Exposição principal', 'museum', 'production', 'published', 'MASP', 50),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Hotel Ibis Demo', 'Diária casal', 'hotel', 'production', 'published', 'Ibis', 200),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Hilton Demo', 'Suíte master', 'hotel', 'production', 'published', 'Hilton', 500)
  ON CONFLICT (id) DO NOTHING;

  -- Insert into coupons
  INSERT INTO public.coupons (id, title, description, category, environment, status, store_name, discount) VALUES
  ('77777777-7777-7777-7777-777777777777'::uuid, 'Burger King Demo', '2 Whopper por 1', 'Alimentação', 'production', 'active', 'Burger King', '50%'),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'Cinemark Demo', 'Meia entrada', 'Atrações', 'production', 'active', 'Cinemark', '50%'),
  ('99999999-9999-9999-9999-999999999999'::uuid, 'Uber Demo', 'R$ 10 off na corrida', 'Serviços', 'production', 'active', 'Uber', 'R$ 10')
  ON CONFLICT (id) DO NOTHING;
END $$;

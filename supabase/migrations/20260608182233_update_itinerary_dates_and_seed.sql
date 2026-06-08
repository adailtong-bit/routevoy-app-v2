-- Update function to handle overflow consolidation and correct date shifts
CREATE OR REPLACE FUNCTION public.update_itinerary_dates(
  p_itinerary_id uuid,
  p_new_start_date date,
  p_new_end_date date,
  p_title text DEFAULT NULL::text,
  p_destination text DEFAULT NULL::text,
  p_description text DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_old_start_date date;
  v_day_diff integer := 0;
  v_item record;
  v_new_item_date date;
  v_new_start_time timestamp with time zone;
  v_new_end_time timestamp with time zone;
BEGIN
  SELECT start_date::date INTO v_old_start_date
  FROM public.itineraries
  WHERE id = p_itinerary_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Itinerary not found or access denied.');
  END IF;

  UPDATE public.itineraries
  SET 
    start_date = COALESCE(p_new_start_date::timestamp with time zone, start_date),
    end_date = COALESCE(p_new_end_date::timestamp with time zone, end_date),
    title = COALESCE(p_title, title),
    destination = COALESCE(p_destination, destination),
    description = COALESCE(p_description, description)
  WHERE id = p_itinerary_id;

  IF v_old_start_date IS NOT NULL AND p_new_start_date IS NOT NULL THEN
    v_day_diff := p_new_start_date - v_old_start_date;
  END IF;

  IF v_day_diff <> 0 OR p_new_end_date IS NOT NULL THEN
    FOR v_item IN
      SELECT id, start_time, end_time
      FROM public.itinerary_items
      WHERE itinerary_id = p_itinerary_id AND start_time IS NOT NULL
    LOOP
      v_new_item_date := (v_item.start_time AT TIME ZONE 'UTC')::date + v_day_diff;

      IF p_new_end_date IS NOT NULL AND v_new_item_date > p_new_end_date THEN
        v_new_item_date := p_new_end_date;
      END IF;

      v_new_start_time := (v_new_item_date::text || ' ' || (v_item.start_time AT TIME ZONE 'UTC')::time::text || ' UTC')::timestamp with time zone;
      
      IF v_item.end_time IS NOT NULL THEN
         v_new_end_time := v_new_start_time + (v_item.end_time - v_item.start_time);
      ELSE
         v_new_end_time := NULL;
      END IF;

      UPDATE public.itinerary_items
      SET start_time = v_new_start_time,
          end_time = v_new_end_time
      WHERE id = v_item.id;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- Seed the requested user
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
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

DO $DO_BLOCK$
BEGIN
END $DO_BLOCK$;

CREATE OR REPLACE FUNCTION public.update_itinerary_dates(
  p_itinerary_id uuid,
  p_new_start_date date,
  p_new_end_date date,
  p_title text DEFAULT NULL,
  p_destination text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_old_start_date date;
  v_day_diff integer;
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
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$func$;

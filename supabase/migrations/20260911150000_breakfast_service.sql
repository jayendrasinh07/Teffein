-- Additive Breakfast service rollout. Existing Lunch and Dinner data and ordering behavior remain intact.

ALTER TABLE public.delivery_slots
  ADD COLUMN IF NOT EXISTS cutoff_day_offset SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE public.delivery_slots DROP CONSTRAINT IF EXISTS delivery_slots_meal_type_check;
ALTER TABLE public.delivery_slots ADD CONSTRAINT delivery_slots_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));
ALTER TABLE public.delivery_slots DROP CONSTRAINT IF EXISTS delivery_slots_check;
ALTER TABLE public.delivery_slots DROP CONSTRAINT IF EXISTS delivery_slots_cutoff_time_check;
ALTER TABLE public.delivery_slots ADD CONSTRAINT delivery_slots_cutoff_time_check CHECK (
  (meal_type = 'breakfast' AND cutoff_time = TIME '22:00' AND cutoff_day_offset = 1) OR
  (meal_type = 'lunch' AND cutoff_time = TIME '10:30' AND cutoff_day_offset = 0) OR
  (meal_type = 'dinner' AND cutoff_time = TIME '17:30' AND cutoff_day_offset = 0)
);
ALTER TABLE public.delivery_slots DROP CONSTRAINT IF EXISTS delivery_slots_cutoff_day_offset_check;
ALTER TABLE public.delivery_slots ADD CONSTRAINT delivery_slots_cutoff_day_offset_check
  CHECK (cutoff_day_offset IN (0, 1));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_meal_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

ALTER TABLE public.kitchen_order_signals DROP CONSTRAINT IF EXISTS kitchen_order_signals_meal_type_check;
ALTER TABLE public.kitchen_order_signals ADD CONSTRAINT kitchen_order_signals_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

ALTER TABLE private.kitchen_shift_handovers DROP CONSTRAINT IF EXISTS kitchen_shift_handovers_meal_type_check;
ALTER TABLE private.kitchen_shift_handovers ADD CONSTRAINT kitchen_shift_handovers_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

INSERT INTO public.delivery_slots(seed_key, name, meal_type, start_time, end_time, max_orders, cutoff_time, cutoff_day_offset, is_active)
VALUES
  ('breakfast-1', 'Breakfast Slot 1 (Early Workday Batch)', 'breakfast', '07:30:00', '08:15:00', 100, '22:00:00', 1, true),
  ('breakfast-2', 'Breakfast Slot 2 (Office & Campus Batch)', 'breakfast', '08:15:00', '09:00:00', 150, '22:00:00', 1, true)
ON CONFLICT (seed_key) DO UPDATE SET
  name = EXCLUDED.name,
  meal_type = EXCLUDED.meal_type,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  cutoff_time = EXCLUDED.cutoff_time,
  cutoff_day_offset = EXCLUDED.cutoff_day_offset;

CREATE OR REPLACE FUNCTION private.assert_order_item_service_match()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE v_order_type TEXT; v_meal_type TEXT;
BEGIN
  SELECT meal_type INTO v_order_type FROM public.orders WHERE id = NEW.order_id;
  SELECT meal_type INTO v_meal_type FROM public.meals WHERE id = NEW.meal_id;
  IF v_order_type = 'breakfast' AND v_meal_type <> 'breakfast' THEN
    RAISE EXCEPTION 'Choose a Breakfast meal for Breakfast service';
  END IF;
  IF v_order_type IN ('lunch', 'dinner') AND v_meal_type NOT IN (v_order_type, 'both') THEN
    RAISE EXCEPTION 'Choose a meal for the selected service';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_order_item_service_match ON public.order_items;
CREATE TRIGGER enforce_order_item_service_match
BEFORE INSERT OR UPDATE OF order_id, meal_id ON public.order_items
FOR EACH ROW EXECUTE FUNCTION private.assert_order_item_service_match();
REVOKE ALL ON FUNCTION private.assert_order_item_service_match() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION private.assert_order_window(p_date DATE,p_type TEXT,p_now TIMESTAMPTZ)
RETURNS VOID LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  v_today DATE := (p_now AT TIME ZONE 'Asia/Kolkata')::date;
  v_clock TIME := (p_now AT TIME ZONE 'Asia/Kolkata')::time;
  v_cutoff_date DATE;
  v_cutoff_time TIME;
BEGIN
  IF p_date IS NULL OR p_type IS NULL OR p_type NOT IN ('breakfast','lunch','dinner') THEN
    RAISE EXCEPTION 'Valid date and meal type required';
  END IF;
  IF p_date < v_today OR p_date > v_today + 6 THEN
    RAISE EXCEPTION 'Choose a date within the next seven days';
  END IF;
  v_cutoff_date := CASE WHEN p_type = 'breakfast' THEN p_date - 1 ELSE p_date END;
  v_cutoff_time := CASE p_type WHEN 'breakfast' THEN TIME '22:00' WHEN 'lunch' THEN TIME '10:30' ELSE TIME '17:30' END;
  IF v_today > v_cutoff_date OR (v_today = v_cutoff_date AND v_clock >= v_cutoff_time) THEN
    RAISE EXCEPTION 'Ordering cutoff has passed';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_kitchen_orders(p_order_date DATE,p_meal_type TEXT) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM private.require_kitchen_access();
  IF p_order_date IS NULL OR p_meal_type IS NULL OR p_meal_type NOT IN ('breakfast','lunch','dinner') THEN
    RAISE EXCEPTION 'Choose a date and breakfast, lunch, or dinner.' USING ERRCODE='22023';
  END IF;
  RETURN coalesce((SELECT jsonb_agg(private.kitchen_order_document(o.id)
    ORDER BY o.address_snapshot->>'slotLabel',o.created_at,o.id)
    FROM public.orders o WHERE o.order_date=p_order_date AND o.meal_type=p_meal_type
    AND o.status IN ('confirmed','preparing','ready')),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION private.kitchen_catalog_document()
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'name', m.name,
      'description', m.description,
      'image_url', m.image_url,
      'meal_type', m.meal_type,
      'diet_type', coalesce(m.diet_type, 'standard_gujarati'),
      'base_price', m.base_price,
      'is_active', m.is_active,
      'created_at', m.created_at,
      'updated_at', m.updated_at
    )
    ORDER BY m.is_active DESC,
      CASE m.meal_type WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'both' THEN 3 ELSE 4 END,
      m.name,
      m.id
  ), '[]'::jsonb)
  FROM public.meals m
  WHERE m.meal_type IN ('breakfast', 'lunch', 'dinner', 'both')
    AND m.archived_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.save_kitchen_meal(
  p_meal_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_image_url TEXT,
  p_meal_type TEXT,
  p_diet_type TEXT,
  p_base_price NUMERIC,
  p_is_active BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_before public.meals%ROWTYPE;
  v_after public.meals%ROWTYPE;
  v_name TEXT := btrim(coalesce(p_name, ''));
  v_description TEXT := nullif(btrim(coalesce(p_description, '')), '');
  v_image_url TEXT := nullif(btrim(coalesce(p_image_url, '')), '');
  v_action TEXT;
BEGIN
  v_actor := private.require_kitchen_access();

  IF length(v_name) NOT BETWEEN 3 AND 120 THEN
    RAISE EXCEPTION 'Meal name must be between 3 and 120 characters.' USING ERRCODE = '22023';
  END IF;
  IF length(coalesce(v_description, '')) > 1000 THEN
    RAISE EXCEPTION 'Meal description must be at most 1000 characters.' USING ERRCODE = '22023';
  END IF;
  IF length(coalesce(v_image_url, '')) > 2048
     OR (v_image_url IS NOT NULL AND v_image_url !~ '^https://') THEN
    RAISE EXCEPTION 'Meal image must use a valid HTTPS URL.' USING ERRCODE = '22023';
  END IF;
  IF p_meal_type IS NULL OR p_meal_type NOT IN ('breakfast', 'lunch', 'dinner', 'both') THEN
    RAISE EXCEPTION 'Choose breakfast, lunch, dinner, or both.' USING ERRCODE = '22023';
  END IF;
  IF p_diet_type IS NULL OR p_diet_type NOT IN (
    'standard_gujarati', 'jain_satvik', 'kathiyawadi', 'low_oil_fit', 'north_indian'
  ) THEN
    RAISE EXCEPTION 'Choose a supported meal style.' USING ERRCODE = '22023';
  END IF;
  IF p_base_price IS NULL OR p_base_price <= 0 OR p_base_price > 10000
     OR round(p_base_price, 2) <> p_base_price THEN
    RAISE EXCEPTION 'Price must be between 0.01 and 10000 with at most two decimal places.' USING ERRCODE = '22023';
  END IF;
  IF p_is_active IS NULL THEN
    RAISE EXCEPTION 'Choose whether this meal is active.' USING ERRCODE = '22023';
  END IF;

  IF p_meal_id IS NULL THEN
    INSERT INTO public.meals(
      name, description, image_url, meal_type, diet_type, base_price, is_active
    ) VALUES (
      v_name, v_description, v_image_url, p_meal_type, p_diet_type, p_base_price, p_is_active
    )
    RETURNING * INTO v_after;
    v_action := 'created';
  ELSE
    SELECT * INTO v_before FROM public.meals WHERE id = p_meal_id FOR UPDATE;
    IF NOT FOUND OR v_before.meal_type NOT IN ('breakfast', 'lunch', 'dinner', 'both') THEN
      RAISE EXCEPTION 'Meal was not found.' USING ERRCODE = 'P0002';
    END IF;

    UPDATE public.meals
    SET name = v_name,
        description = v_description,
        image_url = v_image_url,
        meal_type = p_meal_type,
        diet_type = p_diet_type,
        base_price = p_base_price,
        is_active = p_is_active
    WHERE id = p_meal_id
    RETURNING * INTO v_after;
    v_action := 'updated';
  END IF;

  INSERT INTO private.kitchen_catalog_events(
    meal_id, actor_id, action, before_state, after_state
  ) VALUES (
    v_after.id,
    v_actor,
    v_action,
    CASE WHEN v_action = 'updated' THEN to_jsonb(v_before) ELSE NULL END,
    to_jsonb(v_after)
  );

  RETURN private.kitchen_catalog_document();
END;
$$;

CREATE OR REPLACE FUNCTION private.kitchen_menu_document(p_menu_date DATE)
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'menu_date', p_menu_date,
    'is_published', coalesce(d.is_published, false),
    'is_locked', EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.order_date = p_menu_date
        AND o.status <> 'cancelled'
    ),
    'updated_at', d.updated_at,
    'meals', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'name', m.name,
          'description', m.description,
          'meal_type', m.meal_type,
          'diet_type', m.diet_type,
          'base_price', m.base_price,
          'selected', coalesce(i.availability, false)
        )
        ORDER BY CASE m.meal_type WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'both' THEN 3 ELSE 4 END, m.name, m.id
      )
      FROM public.meals m
      LEFT JOIN public.menu_items i
        ON i.menu_day_id = d.id
       AND i.meal_id = m.id
      WHERE m.is_active
        AND m.meal_type IN ('breakfast', 'lunch', 'dinner', 'both')
    ), '[]'::jsonb)
  )
  FROM (SELECT 1) seed
  LEFT JOIN public.menu_days d ON d.menu_date = p_menu_date;
$$;

CREATE OR REPLACE FUNCTION public.save_kitchen_menu(
  p_menu_date DATE,
  p_meal_ids UUID[],
  p_publish BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_today DATE := (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date;
  v_day_id UUID;
  v_meal_ids UUID[] := coalesce(p_meal_ids, ARRAY[]::UUID[]);
BEGIN
  v_actor := private.require_kitchen_access();

  IF p_menu_date IS NULL OR p_menu_date < v_today OR p_menu_date > v_today + 6 THEN
    RAISE EXCEPTION 'Choose a menu date within the next seven days.' USING ERRCODE = '22023';
  END IF;
  IF p_publish IS NULL THEN
    RAISE EXCEPTION 'Choose whether to save a draft or publish the menu.' USING ERRCODE = '22023';
  END IF;
  IF cardinality(v_meal_ids) <> (SELECT count(DISTINCT meal_id) FROM unnest(v_meal_ids) AS chosen(meal_id))
     OR array_position(v_meal_ids, NULL) IS NOT NULL THEN
    RAISE EXCEPTION 'Each selected meal must be unique and valid.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(v_meal_ids) AS chosen(meal_id)
    LEFT JOIN public.meals m ON m.id = chosen.meal_id
    WHERE m.id IS NULL OR NOT m.is_active OR m.meal_type NOT IN ('breakfast', 'lunch', 'dinner', 'both')
  ) THEN
    RAISE EXCEPTION 'The menu contains an unavailable meal.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.order_date = p_menu_date AND o.status <> 'cancelled'
  ) THEN
    RAISE EXCEPTION 'This menu is locked because a customer order already exists for this date.' USING ERRCODE = '23514';
  END IF;
  IF p_publish AND NOT EXISTS (
    SELECT 1 FROM public.meals m WHERE m.id = ANY(v_meal_ids) AND m.meal_type IN ('lunch', 'both')
  ) THEN
    RAISE EXCEPTION 'Select at least one lunch meal before publishing.' USING ERRCODE = '23514';
  END IF;
  IF p_publish AND NOT EXISTS (
    SELECT 1 FROM public.meals m WHERE m.id = ANY(v_meal_ids) AND m.meal_type IN ('dinner', 'both')
  ) THEN
    RAISE EXCEPTION 'Select at least one dinner meal before publishing.' USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.menu_days(menu_date, is_published)
  VALUES (p_menu_date, p_publish)
  ON CONFLICT (menu_date) DO UPDATE
    SET is_published = EXCLUDED.is_published
  RETURNING id INTO v_day_id;

  DELETE FROM public.menu_items WHERE menu_day_id = v_day_id;
  INSERT INTO public.menu_items(menu_day_id, meal_id, availability, display_order)
  SELECT v_day_id, chosen.meal_id, true, chosen.position::integer
  FROM unnest(v_meal_ids) WITH ORDINALITY AS chosen(meal_id, position)
  ORDER BY chosen.position;

  INSERT INTO private.kitchen_menu_events(menu_date, actor_id, is_published, meal_ids)
  VALUES (p_menu_date, v_actor, p_publish, v_meal_ids);

  RETURN private.kitchen_menu_document(p_menu_date);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_kitchen_shift_brief(
  p_service_date DATE,
  p_meal_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.require_kitchen_access();
  IF p_service_date IS NULL OR p_meal_type IS NULL OR p_meal_type NOT IN ('breakfast', 'lunch', 'dinner') THEN
    RAISE EXCEPTION 'Choose a date and breakfast, lunch, or dinner.' USING ERRCODE = '22023';
  END IF;
  RETURN private.kitchen_shift_brief_document(p_service_date, p_meal_type);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_kitchen_shift_handover(
  p_service_date DATE,
  p_meal_type TEXT,
  p_note TEXT,
  p_expected_updated_at TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_existing private.kitchen_shift_handovers%ROWTYPE;
  v_saved private.kitchen_shift_handovers%ROWTYPE;
  v_note TEXT := btrim(coalesce(p_note, ''));
BEGIN
  v_actor := private.require_kitchen_access();
  IF p_service_date IS NULL OR p_meal_type IS NULL OR p_meal_type NOT IN ('breakfast', 'lunch', 'dinner') THEN
    RAISE EXCEPTION 'Choose a date and breakfast, lunch, or dinner.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_note) > 2000 THEN
    RAISE EXCEPTION 'Handover note must be 2000 characters or less.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_existing
  FROM private.kitchen_shift_handovers
  WHERE service_date = p_service_date AND meal_type = p_meal_type
  FOR UPDATE;

  IF FOUND THEN
    IF p_expected_updated_at IS NULL OR v_existing.updated_at <> p_expected_updated_at THEN
      RAISE EXCEPTION 'Another kitchen user updated this handover. Refresh before saving.' USING ERRCODE = '40001';
    END IF;
    UPDATE private.kitchen_shift_handovers
    SET note = v_note, updated_by = v_actor, updated_at = clock_timestamp()
    WHERE id = v_existing.id
    RETURNING * INTO v_saved;
  ELSE
    IF p_expected_updated_at IS NOT NULL THEN
      RAISE EXCEPTION 'The handover changed. Refresh before saving.' USING ERRCODE = '40001';
    END IF;
    INSERT INTO private.kitchen_shift_handovers(service_date, meal_type, note, updated_by)
    VALUES (p_service_date, p_meal_type, v_note, v_actor)
    RETURNING * INTO v_saved;
  END IF;

  INSERT INTO private.kitchen_handover_events(
    handover_id, actor_id, previous_note, next_note
  ) VALUES (
    v_saved.id, v_actor,
    CASE WHEN v_existing.id IS NULL THEN NULL ELSE v_existing.note END,
    v_saved.note
  );

  RETURN private.kitchen_shift_brief_document(p_service_date, p_meal_type);
END;
$$;

CREATE OR REPLACE FUNCTION private.kitchen_management_document() RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'payment_mode', 'manual',
    'cutoffs', jsonb_build_object('breakfast', '22:00:00', 'lunch', '10:30:00', 'dinner', '17:30:00'),
    'slots', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'meal_type', s.meal_type,
        'start_time', s.start_time,
        'end_time', s.end_time,
        'cutoff_time', s.cutoff_time,
        'max_portions', s.max_orders,
        'is_active', s.is_active,
        'booked_today', coalesce(today.portions, 0),
        'peak_booked_portions', coalesce(future.peak_portions, 0)
      ) ORDER BY CASE s.meal_type WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 ELSE 3 END, s.start_time, s.id)
      FROM public.delivery_slots s
      LEFT JOIN LATERAL (
        SELECT sum(i.quantity)::INTEGER AS portions
        FROM public.orders o
        JOIN public.order_items i ON i.order_id = o.id
        WHERE o.delivery_slot_id = s.id
          AND o.order_date = (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date
          AND o.status <> 'cancelled'
      ) today ON true
      LEFT JOIN LATERAL (
        SELECT max(day_total)::INTEGER AS peak_portions
        FROM (
          SELECT sum(i.quantity)::INTEGER AS day_total
          FROM public.orders o
          JOIN public.order_items i ON i.order_id = o.id
          WHERE o.delivery_slot_id = s.id
            AND o.order_date >= (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date
            AND o.status <> 'cancelled'
          GROUP BY o.order_date
        ) booked_by_day
      ) future ON true
    ), '[]'::jsonb),
    'staff', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'user_id', r.user_id,
        'full_name', coalesce(nullif(btrim(p.full_name), ''), split_part(u.email, '@', 1), 'Kitchen user'),
        'email', coalesce(nullif(btrim(p.email), ''), u.email),
        'added_at', r.created_at
      ) ORDER BY coalesce(nullif(btrim(p.full_name), ''), u.email), r.user_id)
      FROM public.user_roles r
      JOIN auth.users u ON u.id = r.user_id
      LEFT JOIN public.profiles p ON p.id = r.user_id
      WHERE r.role = 'kitchen'
    ), '[]'::jsonb)
  );
$$;

REVOKE ALL ON FUNCTION public.get_kitchen_orders(DATE, TEXT),
  public.save_kitchen_meal(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN),
  public.get_kitchen_shift_brief(DATE, TEXT),
  public.save_kitchen_shift_handover(DATE, TEXT, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kitchen_orders(DATE, TEXT),
  public.save_kitchen_meal(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN),
  public.get_kitchen_shift_brief(DATE, TEXT),
  public.save_kitchen_shift_handover(DATE, TEXT, TEXT, TIMESTAMPTZ)
  TO authenticated;
REVOKE ALL ON FUNCTION private.assert_order_window(DATE, TEXT, TIMESTAMPTZ),
  private.kitchen_catalog_document(), private.kitchen_menu_document(DATE),
  private.kitchen_management_document()
  FROM PUBLIC, anon, authenticated;

COMMENT ON COLUMN public.delivery_slots.cutoff_day_offset IS
  'Number of calendar days before service_date on which cutoff_time applies; Breakfast uses 1.';


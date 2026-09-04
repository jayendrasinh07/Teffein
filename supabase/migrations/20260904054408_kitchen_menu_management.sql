-- TEFFEIN Kitchen Menu Management
-- Kitchen staff may compose and publish a complete daily menu from the approved
-- meal catalog. Catalog details and prices remain admin-controlled.

CREATE TABLE IF NOT EXISTS private.kitchen_menu_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  menu_date DATE NOT NULL,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  is_published BOOLEAN NOT NULL,
  meal_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE private.kitchen_menu_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.kitchen_menu_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE private.kitchen_menu_events_id_seq FROM PUBLIC, anon, authenticated;

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
        ORDER BY CASE m.meal_type WHEN 'lunch' THEN 1 WHEN 'both' THEN 2 ELSE 3 END, m.name, m.id
      )
      FROM public.meals m
      LEFT JOIN public.menu_items i
        ON i.menu_day_id = d.id
       AND i.meal_id = m.id
      WHERE m.is_active
        AND m.meal_type IN ('lunch', 'dinner', 'both')
    ), '[]'::jsonb)
  )
  FROM (SELECT 1) seed
  LEFT JOIN public.menu_days d ON d.menu_date = p_menu_date;
$$;

CREATE OR REPLACE FUNCTION public.get_kitchen_menu(p_menu_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_today DATE := (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
  PERFORM private.require_kitchen_access();
  IF p_menu_date IS NULL OR p_menu_date < v_today OR p_menu_date > v_today + 6 THEN
    RAISE EXCEPTION 'Choose a menu date within the next seven days.' USING ERRCODE = '22023';
  END IF;
  RETURN private.kitchen_menu_document(p_menu_date);
END;
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
    WHERE m.id IS NULL OR NOT m.is_active OR m.meal_type NOT IN ('lunch', 'dinner', 'both')
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

COMMENT ON FUNCTION public.get_kitchen_menu(DATE) IS
  'Returns the approved meal catalog and draft/published selection for a seven-day menu date. Kitchen/admin access only.';
COMMENT ON FUNCTION public.save_kitchen_menu(DATE, UUID[], BOOLEAN) IS
  'Atomically saves or publishes a complete daily menu. Prices remain catalog-authoritative and menus lock after the first active order.';

REVOKE ALL ON FUNCTION private.kitchen_menu_document(DATE) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_kitchen_menu(DATE) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_kitchen_menu(DATE, UUID[], BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kitchen_menu(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_kitchen_menu(DATE, UUID[], BOOLEAN) TO authenticated;


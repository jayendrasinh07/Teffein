-- TEFFEIN Kitchen Operations Upgrade
-- Adds role-guarded delivery details to the Kitchen queue and implements
-- audited soft deletion for catalog meals while preserving order history.

ALTER TABLE public.meals
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.meals
  DROP CONSTRAINT IF EXISTS meals_archived_inactive;
ALTER TABLE public.meals
  ADD CONSTRAINT meals_archived_inactive
  CHECK (archived_at IS NULL OR is_active = false);

CREATE INDEX IF NOT EXISTS meals_unarchived_display
  ON public.meals(is_active DESC, meal_type, name)
  WHERE archived_at IS NULL;

ALTER TABLE private.kitchen_catalog_events
  DROP CONSTRAINT IF EXISTS kitchen_catalog_events_action_check;
ALTER TABLE private.kitchen_catalog_events
  ADD CONSTRAINT kitchen_catalog_events_action_check
  CHECK (action IN ('created', 'updated', 'archived'));

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
      CASE m.meal_type WHEN 'lunch' THEN 1 WHEN 'both' THEN 2 ELSE 3 END,
      m.name,
      m.id
  ), '[]'::jsonb)
  FROM public.meals m
  WHERE m.meal_type IN ('lunch', 'dinner', 'both')
    AND m.archived_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.archive_kitchen_meal(p_meal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_before public.meals%ROWTYPE;
  v_after public.meals%ROWTYPE;
  v_today DATE := (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
  v_actor := private.require_kitchen_access();
  IF p_meal_id IS NULL THEN
    RAISE EXCEPTION 'Choose a meal to delete.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_before
  FROM public.meals
  WHERE id = p_meal_id AND archived_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meal was not found.' USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.menu_items i
    JOIN public.menu_days d ON d.id = i.menu_day_id
    WHERE i.meal_id = p_meal_id
      AND i.availability
      AND d.is_published
      AND d.menu_date >= v_today
  ) THEN
    RAISE EXCEPTION 'Remove this meal from every published current or future menu before deleting it.' USING ERRCODE = '23514';
  END IF;

  DELETE FROM public.menu_items i
  USING public.menu_days d
  WHERE i.menu_day_id = d.id
    AND i.meal_id = p_meal_id
    AND NOT d.is_published
    AND d.menu_date >= v_today;

  UPDATE public.meals
  SET is_active = false,
      archived_at = clock_timestamp()
  WHERE id = p_meal_id
  RETURNING * INTO v_after;

  INSERT INTO private.kitchen_catalog_events(
    meal_id, actor_id, action, before_state, after_state
  ) VALUES (
    v_after.id, v_actor, 'archived', to_jsonb(v_before), to_jsonb(v_after)
  );

  RETURN private.kitchen_catalog_document();
END;
$$;

CREATE OR REPLACE FUNCTION private.kitchen_order_document(p_order_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'customer_name', coalesce(
      nullif(btrim(o.address_snapshot->>'recipient_name'), ''),
      nullif(btrim(o.address_snapshot->>'recipientName'), ''),
      'Customer'
    ),
    'customer_phone', coalesce(
      nullif(btrim(o.address_snapshot->>'recipient_phone'), ''),
      nullif(btrim(o.address_snapshot->>'phone'), ''),
      'Phone unavailable'
    ),
    'delivery_address', coalesce(
      nullif(btrim(o.address_snapshot->>'formatted_address'), ''),
      nullif(btrim(o.address_snapshot->>'addressLine1'), ''),
      nullif(concat_ws(', ',
        nullif(btrim(o.address_snapshot->>'house_flat_number'), ''),
        nullif(btrim(o.address_snapshot->>'building_name'), ''),
        nullif(btrim(o.address_snapshot->>'street'), ''),
        nullif(btrim(o.address_snapshot->>'area'), ''),
        nullif(btrim(o.address_snapshot->>'city'), '')
      ), ''),
      'Address unavailable'
    ),
    'delivery_area', coalesce(
      nullif(btrim(o.address_snapshot->>'area'), ''),
      nullif(btrim(o.address_snapshot->>'sector'), ''),
      ''
    ),
    'delivery_pincode', coalesce(o.address_snapshot->>'pincode', ''),
    'delivery_instructions', coalesce(
      nullif(btrim(o.address_snapshot->>'delivery_instructions'), ''),
      nullif(btrim(o.address_snapshot->>'instructions'), '')
    ),
    'payment_status', o.payment_status,
    'grand_total', o.grand_total,
    'order_date', o.order_date,
    'meal_type', o.meal_type,
    'slot_label', coalesce(o.address_snapshot->>'slotLabel', ''),
    'status', o.status,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'notes', o.notes,
    'items', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', i.id,
        'meal_name', i.meal_name_snapshot,
        'quantity', i.quantity,
        'preferences', i.preparation_preferences,
        'addons', coalesce((
          SELECT jsonb_agg(jsonb_build_object(
            'id', c.id,
            'name', c.customization_name_snapshot,
            'quantity', c.quantity
          ) ORDER BY c.id)
          FROM public.order_customizations c
          WHERE c.order_item_id = i.id
        ), '[]'::jsonb)
      ) ORDER BY i.id)
      FROM public.order_items i
      WHERE i.order_id = o.id
    ), '[]'::jsonb)
  )
  FROM public.orders o
  WHERE o.id = p_order_id;
$$;

REVOKE ALL ON FUNCTION private.kitchen_catalog_document(), private.kitchen_order_document(UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.archive_kitchen_meal(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_kitchen_meal(UUID) TO authenticated;

COMMENT ON FUNCTION public.archive_kitchen_meal(UUID) IS
  'Archives a meal after Kitchen/Admin authorization, removes it from future drafts, and preserves historical order snapshots.';
COMMENT ON FUNCTION public.get_kitchen_orders(DATE, TEXT) IS
  'Returns role-guarded preparation, customer contact, delivery, and payment summary fields required by Kitchen operations.';

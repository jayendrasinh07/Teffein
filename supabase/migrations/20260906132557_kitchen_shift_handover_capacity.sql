-- Kitchen shift control: per-slot portion capacity plus audited handover notes.

CREATE TABLE private.kitchen_shift_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  note TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 2000),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (service_date, meal_type)
);

CREATE TABLE private.kitchen_handover_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handover_id UUID NOT NULL REFERENCES private.kitchen_shift_handovers(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_note TEXT,
  next_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE private.kitchen_shift_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.kitchen_handover_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.kitchen_shift_handovers, private.kitchen_handover_events
  FROM PUBLIC, anon, authenticated;

CREATE INDEX kitchen_handover_events_handover_created
  ON private.kitchen_handover_events(handover_id, created_at DESC);
CREATE INDEX kitchen_handover_events_actor
  ON private.kitchen_handover_events(actor_id);

CREATE FUNCTION private.kitchen_shift_brief_document(
  p_service_date DATE,
  p_meal_type TEXT
) RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'service_date', p_service_date,
    'meal_type', p_meal_type,
    'slots', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'start_time', s.start_time,
        'end_time', s.end_time,
        'max_portions', s.max_orders,
        'booked_portions', booked.portions,
        'remaining_portions', greatest(s.max_orders - booked.portions, 0),
        'utilization_percent', CASE
          WHEN s.max_orders = 0 THEN 100
          ELSE round((booked.portions * 100.0) / s.max_orders, 1)
        END
      ) ORDER BY s.start_time, s.id)
      FROM public.delivery_slots s
      CROSS JOIN LATERAL (
        SELECT coalesce(sum(i.quantity), 0)::INTEGER AS portions
        FROM public.orders o
        JOIN public.order_items i ON i.order_id = o.id
        WHERE o.delivery_slot_id = s.id
          AND o.order_date = p_service_date
          AND o.status <> 'cancelled'
      ) booked
      WHERE s.meal_type = p_meal_type
        AND s.is_active
    ), '[]'::jsonb),
    'handover', coalesce((
      SELECT jsonb_build_object(
        'note', h.note,
        'updated_at', h.updated_at,
        'updated_by', coalesce(nullif(btrim(p.full_name), ''), 'Kitchen team')
      )
      FROM private.kitchen_shift_handovers h
      LEFT JOIN public.profiles p ON p.id = h.updated_by
      WHERE h.service_date = p_service_date
        AND h.meal_type = p_meal_type
    ), jsonb_build_object('note', '', 'updated_at', NULL, 'updated_by', NULL))
  );
$$;

CREATE FUNCTION public.get_kitchen_shift_brief(
  p_service_date DATE,
  p_meal_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.require_kitchen_access();
  IF p_service_date IS NULL OR p_meal_type IS NULL OR p_meal_type NOT IN ('lunch', 'dinner') THEN
    RAISE EXCEPTION 'Choose a date and lunch or dinner.' USING ERRCODE = '22023';
  END IF;
  RETURN private.kitchen_shift_brief_document(p_service_date, p_meal_type);
END;
$$;

CREATE FUNCTION public.save_kitchen_shift_handover(
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
  IF p_service_date IS NULL OR p_meal_type IS NULL OR p_meal_type NOT IN ('lunch', 'dinner') THEN
    RAISE EXCEPTION 'Choose a date and lunch or dinner.' USING ERRCODE = '22023';
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

REVOKE ALL ON FUNCTION private.kitchen_shift_brief_document(DATE, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_kitchen_shift_brief(DATE, TEXT),
  public.save_kitchen_shift_handover(DATE, TEXT, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kitchen_shift_brief(DATE, TEXT),
  public.save_kitchen_shift_handover(DATE, TEXT, TEXT, TIMESTAMPTZ)
  TO authenticated;

COMMENT ON FUNCTION public.get_kitchen_shift_brief(DATE, TEXT) IS
  'Kitchen/admin-only per-slot portion capacity and shared shift handover summary.';
COMMENT ON FUNCTION public.save_kitchen_shift_handover(DATE, TEXT, TEXT, TIMESTAMPTZ) IS
  'Kitchen/admin-only optimistic handover update with private audit history.';


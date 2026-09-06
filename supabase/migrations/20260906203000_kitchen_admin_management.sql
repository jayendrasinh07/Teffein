-- Admin-only controls kept inside the Kitchen application.
-- Customer ordering, fixed cutoffs, and manual payment status are unchanged.

CREATE TABLE private.kitchen_management_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('slot_updated', 'staff_granted', 'staff_revoked')),
  target_id UUID,
  before_state JSONB,
  after_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE private.kitchen_management_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.kitchen_management_events FROM PUBLIC, anon, authenticated;
CREATE INDEX kitchen_management_events_actor_created
  ON private.kitchen_management_events(actor_id, created_at DESC);
CREATE INDEX kitchen_management_events_target_created
  ON private.kitchen_management_events(target_id, created_at DESC);

CREATE FUNCTION private.require_admin_access() RETURNS UUID
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE v_actor UUID := auth.uid();
BEGIN
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_actor AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access is required.' USING ERRCODE = '42501';
  END IF;
  RETURN v_actor;
END;
$$;

CREATE FUNCTION private.kitchen_management_document() RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'payment_mode', 'manual',
    'cutoffs', jsonb_build_object('lunch', '10:30:00', 'dinner', '17:30:00'),
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
      ) ORDER BY CASE s.meal_type WHEN 'lunch' THEN 1 ELSE 2 END, s.start_time, s.id)
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

CREATE FUNCTION public.get_kitchen_management() RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.require_admin_access();
  RETURN private.kitchen_management_document();
END;
$$;

CREATE FUNCTION public.save_kitchen_delivery_slot(
  p_slot_id UUID,
  p_max_portions INTEGER,
  p_is_active BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_slot public.delivery_slots%ROWTYPE;
  v_peak INTEGER;
BEGIN
  v_actor := private.require_admin_access();
  IF p_slot_id IS NULL OR p_max_portions IS NULL OR p_is_active IS NULL
     OR p_max_portions < 0 OR p_max_portions > 5000 THEN
    RAISE EXCEPTION 'Capacity must be between 0 and 5000 portions.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_slot
  FROM public.delivery_slots
  WHERE id = p_slot_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery slot was not found.' USING ERRCODE = 'P0002';
  END IF;

  SELECT coalesce(max(day_total), 0)::INTEGER INTO v_peak
  FROM (
    SELECT sum(i.quantity)::INTEGER AS day_total
    FROM public.orders o
    JOIN public.order_items i ON i.order_id = o.id
    WHERE o.delivery_slot_id = v_slot.id
      AND o.order_date >= (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date
      AND o.status <> 'cancelled'
    GROUP BY o.order_date
  ) booked_by_day;

  IF p_max_portions < v_peak THEN
    RAISE EXCEPTION 'Capacity cannot be below % already-booked portions.', v_peak
      USING ERRCODE = '23514';
  END IF;

  UPDATE public.delivery_slots
  SET max_orders = p_max_portions, is_active = p_is_active
  WHERE id = v_slot.id;

  IF v_slot.max_orders IS DISTINCT FROM p_max_portions
     OR v_slot.is_active IS DISTINCT FROM p_is_active THEN
    INSERT INTO private.kitchen_management_events(actor_id, action, target_id, before_state, after_state)
    VALUES (
      v_actor,
      'slot_updated',
      v_slot.id,
      jsonb_build_object('max_portions', v_slot.max_orders, 'is_active', v_slot.is_active),
      jsonb_build_object('max_portions', p_max_portions, 'is_active', p_is_active)
    );
  END IF;

  RETURN private.kitchen_management_document();
END;
$$;

CREATE FUNCTION public.grant_kitchen_access(p_email TEXT) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_user_id UUID;
  v_email TEXT := lower(btrim(coalesce(p_email, '')));
  v_inserted UUID;
BEGIN
  v_actor := private.require_admin_access();
  IF v_email = '' OR char_length(v_email) > 254 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Enter a valid account email.' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = v_email
  ORDER BY id
  LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'This user must create a TEFFEIN account first.' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.user_roles(user_id, role)
  VALUES (v_user_id, 'kitchen')
  ON CONFLICT (user_id, role) DO NOTHING
  RETURNING user_id INTO v_inserted;

  IF v_inserted IS NOT NULL THEN
    INSERT INTO private.kitchen_management_events(actor_id, action, target_id, after_state)
    VALUES (v_actor, 'staff_granted', v_user_id, jsonb_build_object('role', 'kitchen', 'email', v_email));
  END IF;

  RETURN private.kitchen_management_document();
END;
$$;

CREATE FUNCTION public.revoke_kitchen_access(p_user_id UUID) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_deleted UUID;
  v_email TEXT;
BEGIN
  v_actor := private.require_admin_access();
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Choose a Kitchen user.' USING ERRCODE = '22023';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  DELETE FROM public.user_roles
  WHERE user_id = p_user_id AND role = 'kitchen'
  RETURNING user_id INTO v_deleted;
  IF v_deleted IS NULL THEN
    RAISE EXCEPTION 'Kitchen access record was not found.' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO private.kitchen_management_events(actor_id, action, target_id, before_state)
  VALUES (v_actor, 'staff_revoked', p_user_id, jsonb_build_object('role', 'kitchen', 'email', v_email));

  RETURN private.kitchen_management_document();
END;
$$;

REVOKE ALL ON FUNCTION private.require_admin_access(), private.kitchen_management_document()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_kitchen_management(),
  public.save_kitchen_delivery_slot(UUID, INTEGER, BOOLEAN),
  public.grant_kitchen_access(TEXT),
  public.revoke_kitchen_access(UUID)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kitchen_management(),
  public.save_kitchen_delivery_slot(UUID, INTEGER, BOOLEAN),
  public.grant_kitchen_access(TEXT),
  public.revoke_kitchen_access(UUID)
  TO authenticated;

-- Force these sensitive writes through the audited RPCs above.
REVOKE INSERT, UPDATE, DELETE ON public.delivery_slots, public.user_roles FROM authenticated;

COMMENT ON FUNCTION public.get_kitchen_management() IS
  'Admin-only Kitchen management document for delivery capacity and Kitchen staff access.';
COMMENT ON FUNCTION public.save_kitchen_delivery_slot(UUID, INTEGER, BOOLEAN) IS
  'Admin-only delivery capacity update; fixed service times and cutoffs cannot be changed.';
COMMENT ON FUNCTION public.grant_kitchen_access(TEXT) IS
  'Admin-only Kitchen role grant for an existing authenticated TEFFEIN account.';
COMMENT ON FUNCTION public.revoke_kitchen_access(UUID) IS
  'Admin-only Kitchen role revocation with private audit history.';


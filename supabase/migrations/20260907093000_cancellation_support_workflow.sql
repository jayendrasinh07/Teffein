-- Reason-based customer cancellation and real support tickets.
-- Payments remain manual/pending; no refund is implied or processed here.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_note TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

DO $$
BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_cancellation_reason_check
    CHECK (cancellation_reason IS NULL OR cancellation_reason IN (
      'changed_mind', 'ordered_by_mistake', 'schedule_changed', 'address_issue', 'other'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE private.order_cancellation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE private.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'order_help', 'cancellation_help', 'delivery_help', 'menu_question',
    'account_help', 'corporate', 'other'
  )),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE private.support_request_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES private.support_requests(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'status_changed')),
  before_status TEXT,
  after_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE private.order_cancellation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.support_request_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.order_cancellation_events, private.support_requests, private.support_request_events
  FROM PUBLIC, anon, authenticated;

CREATE INDEX order_cancellation_events_order_created_idx
  ON private.order_cancellation_events(order_id, created_at DESC);
CREATE INDEX support_requests_user_created_idx
  ON private.support_requests(user_id, created_at DESC);
CREATE INDEX support_requests_status_created_idx
  ON private.support_requests(status, created_at DESC);
CREATE INDEX support_request_events_request_created_idx
  ON private.support_request_events(request_id, created_at DESC);

CREATE FUNCTION public.cancel_customer_order(
  p_order_id UUID,
  p_reason TEXT,
  p_note TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_slot_id UUID;
  v_user_id UUID := auth.uid();
  v_reason TEXT := lower(btrim(coalesce(p_reason, '')));
  v_note TEXT := nullif(btrim(coalesce(p_note, '')), '');
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF v_reason NOT IN ('changed_mind', 'ordered_by_mistake', 'schedule_changed', 'address_issue', 'other') THEN
    RAISE EXCEPTION 'Choose a cancellation reason.' USING ERRCODE = '22023';
  END IF;
  IF char_length(coalesce(v_note, '')) > 500 OR (v_reason = 'other' AND char_length(coalesce(v_note, '')) < 5) THEN
    RAISE EXCEPTION 'Add a short cancellation note of up to 500 characters.' USING ERRCODE = '22023';
  END IF;

  SELECT delivery_slot_id INTO v_slot_id
  FROM public.orders
  WHERE id = p_order_id AND user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002'; END IF;

  PERFORM 1 FROM public.delivery_slots WHERE id = v_slot_id FOR UPDATE;
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id AND user_id = v_user_id
  FOR UPDATE;

  IF v_order.status = 'cancelled' THEN RETURN private.order_document(v_order.id); END IF;
  IF v_order.status <> 'confirmed' OR v_order.payment_status <> 'pending' THEN
    RAISE EXCEPTION 'This order can no longer be cancelled online' USING ERRCODE = '23514';
  END IF;
  PERFORM private.assert_order_window(v_order.order_date, v_order.meal_type, clock_timestamp());

  UPDATE public.orders
  SET status = 'cancelled', cancellation_reason = v_reason,
      cancellation_note = v_note, cancelled_at = clock_timestamp()
  WHERE id = v_order.id;

  INSERT INTO private.order_cancellation_events(order_id, user_id, reason, note)
  VALUES (v_order.id, v_user_id, v_reason, v_note);

  RETURN private.order_document(v_order.id);
END;
$$;

-- Backward-compatible path for older cached clients; still creates an audit reason.
CREATE OR REPLACE FUNCTION public.cancel_customer_order(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN public.cancel_customer_order(
    p_order_id, 'other', 'Cancelled from an older TEFFEIN app version.'
  );
EXCEPTION
  WHEN insufficient_privilege OR no_data_found OR invalid_parameter_value OR check_violation THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

CREATE FUNCTION public.create_support_request(
  p_category TEXT,
  p_message TEXT,
  p_order_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_category TEXT := lower(btrim(coalesce(p_category, '')));
  v_message TEXT := btrim(coalesce(p_message, ''));
  v_request private.support_requests%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF v_category NOT IN (
    'order_help', 'cancellation_help', 'delivery_help', 'menu_question',
    'account_help', 'corporate', 'other'
  ) OR char_length(v_message) NOT BETWEEN 10 AND 2000 THEN
    RAISE EXCEPTION 'Choose a topic and enter 10 to 2000 characters.' USING ERRCODE = '22023';
  END IF;
  IF p_order_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.orders WHERE id = p_order_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('support:' || v_user_id::text, 0));
  IF (SELECT count(*) FROM private.support_requests WHERE user_id = v_user_id AND status <> 'resolved') >= 5 THEN
    RAISE EXCEPTION 'Please wait for the team to resolve an existing request.' USING ERRCODE = '23514';
  END IF;

  INSERT INTO private.support_requests(user_id, order_id, category, message)
  VALUES (v_user_id, p_order_id, v_category, v_message)
  RETURNING * INTO v_request;
  INSERT INTO private.support_request_events(request_id, actor_id, action, after_status)
  VALUES (v_request.id, v_user_id, 'created', v_request.status);

  RETURN jsonb_build_object(
    'id', v_request.id, 'order_id', v_request.order_id, 'category', v_request.category,
    'message', v_request.message, 'status', v_request.status,
    'created_at', v_request.created_at, 'updated_at', v_request.updated_at
  );
END;
$$;

CREATE FUNCTION public.get_my_support_requests() RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', r.id, 'order_id', r.order_id, 'order_number', o.order_number,
      'category', r.category, 'message', r.message, 'status', r.status,
      'created_at', r.created_at, 'updated_at', r.updated_at
    ) ORDER BY r.created_at DESC, r.id)
    FROM private.support_requests r
    LEFT JOIN public.orders o ON o.id = r.order_id
    WHERE r.user_id = v_user_id
  ), '[]'::jsonb);
END;
$$;

CREATE FUNCTION public.get_kitchen_support_requests() RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.require_admin_access();
  RETURN coalesce((
    SELECT jsonb_agg(row_document ORDER BY
      CASE row_document->>'status' WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END,
      row_document->>'created_at' DESC)
    FROM (
      SELECT jsonb_build_object(
        'id', r.id, 'order_id', r.order_id, 'order_number', o.order_number,
        'category', r.category, 'message', r.message, 'status', r.status,
        'created_at', r.created_at, 'updated_at', r.updated_at,
        'customer_name', coalesce(nullif(btrim(p.full_name), ''), split_part(u.email, '@', 1), 'Customer'),
        'customer_email', coalesce(nullif(btrim(p.email), ''), u.email, ''),
        'customer_phone', coalesce(nullif(btrim(p.phone), ''), nullif(btrim(u.phone), ''), '')
      ) AS row_document
      FROM private.support_requests r
      JOIN auth.users u ON u.id = r.user_id
      LEFT JOIN public.profiles p ON p.id = r.user_id
      LEFT JOIN public.orders o ON o.id = r.order_id
      ORDER BY CASE r.status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END,
               r.created_at DESC, r.id
      LIMIT 100
    ) queue
  ), '[]'::jsonb);
END;
$$;

CREATE FUNCTION public.update_kitchen_support_request(
  p_request_id UUID,
  p_status TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID;
  v_request private.support_requests%ROWTYPE;
  v_status TEXT := lower(btrim(coalesce(p_status, '')));
BEGIN
  v_actor := private.require_admin_access();
  IF p_request_id IS NULL OR v_status NOT IN ('open', 'in_progress', 'resolved') THEN
    RAISE EXCEPTION 'Choose a valid support status.' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_request FROM private.support_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Support request was not found.' USING ERRCODE = 'P0002'; END IF;

  IF v_request.status IS DISTINCT FROM v_status THEN
    UPDATE private.support_requests
    SET status = v_status, updated_at = clock_timestamp()
    WHERE id = v_request.id;
    INSERT INTO private.support_request_events(request_id, actor_id, action, before_status, after_status)
    VALUES (v_request.id, v_actor, 'status_changed', v_request.status, v_status);
  END IF;
  RETURN public.get_kitchen_support_requests();
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_customer_order(UUID, TEXT, TEXT),
  public.cancel_customer_order(UUID),
  public.create_support_request(TEXT, TEXT, UUID),
  public.get_my_support_requests(),
  public.get_kitchen_support_requests(),
  public.update_kitchen_support_request(UUID, TEXT)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_customer_order(UUID, TEXT, TEXT),
  public.cancel_customer_order(UUID),
  public.create_support_request(TEXT, TEXT, UUID),
  public.get_my_support_requests(),
  public.get_kitchen_support_requests(),
  public.update_kitchen_support_request(UUID, TEXT)
  TO authenticated;

COMMENT ON FUNCTION public.cancel_customer_order(UUID, TEXT, TEXT) IS
  'Owner-only pre-cutoff cancellation with a validated reason and immutable private audit event.';
COMMENT ON FUNCTION public.create_support_request(TEXT, TEXT, UUID) IS
  'Authenticated customer support ticket creation; order ownership is checked when supplied.';
COMMENT ON FUNCTION public.get_kitchen_support_requests() IS
  'Admin-only support queue projection for Kitchen Management.';


-- TEFFEIN Kitchen Catalog and Realtime Queue
-- Kitchen/admin users manage the customer-facing meal catalog through guarded
-- RPCs. Order events are minimal refresh signals; preparation data remains
-- available only through get_kitchen_orders().

CREATE TABLE private.kitchen_catalog_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE RESTRICT,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated')),
  before_state JSONB,
  after_state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE private.kitchen_catalog_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.kitchen_catalog_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE private.kitchen_catalog_events_id_seq FROM PUBLIC, anon, authenticated;
CREATE INDEX kitchen_catalog_events_meal_created
  ON private.kitchen_catalog_events(meal_id, created_at DESC);
CREATE INDEX kitchen_catalog_events_actor_created
  ON private.kitchen_catalog_events(actor_id, created_at DESC);

CREATE FUNCTION private.kitchen_catalog_document()
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
  WHERE m.meal_type IN ('lunch', 'dinner', 'both');
$$;

CREATE FUNCTION public.get_kitchen_catalog()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.require_kitchen_access();
  RETURN private.kitchen_catalog_document();
END;
$$;

CREATE FUNCTION public.save_kitchen_meal(
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
  IF p_meal_type IS NULL OR p_meal_type NOT IN ('lunch', 'dinner', 'both') THEN
    RAISE EXCEPTION 'Choose lunch, dinner, or both.' USING ERRCODE = '22023';
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
    IF NOT FOUND OR v_before.meal_type NOT IN ('lunch', 'dinner', 'both') THEN
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

-- Add only the recipient name captured at checkout. Phone, address, account ID,
-- payment fields, and prices remain outside the Kitchen document.
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

-- Realtime rows contain only enough information to decide which guarded queue
-- RPC should be fetched again. They never contain customer or order contents.
CREATE TABLE public.kitchen_order_signals (
  order_id UUID PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  order_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled'
  )),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.kitchen_order_signals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.kitchen_order_signals FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.kitchen_order_signals TO authenticated;

CREATE POLICY "Kitchen users can receive order refresh signals"
  ON public.kitchen_order_signals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles r
      WHERE r.user_id = (SELECT auth.uid())
        AND r.role IN ('kitchen', 'admin')
    )
  );

CREATE INDEX kitchen_order_signals_scope_changed
  ON public.kitchen_order_signals(order_date, meal_type, changed_at DESC);

CREATE FUNCTION private.sync_kitchen_order_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.kitchen_order_signals(
    order_id, order_date, meal_type, status, changed_at
  ) VALUES (
    NEW.id, NEW.order_date, NEW.meal_type, NEW.status, clock_timestamp()
  )
  ON CONFLICT (order_id) DO UPDATE
    SET order_date = EXCLUDED.order_date,
        meal_type = EXCLUDED.meal_type,
        status = EXCLUDED.status,
        changed_at = EXCLUDED.changed_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_kitchen_order_signal
  AFTER INSERT OR UPDATE OF order_date, meal_type, status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_kitchen_order_signal();

INSERT INTO public.kitchen_order_signals(order_id, order_date, meal_type, status, changed_at)
SELECT id, order_date, meal_type, status, updated_at
FROM public.orders
ON CONFLICT (order_id) DO UPDATE
  SET order_date = EXCLUDED.order_date,
      meal_type = EXCLUDED.meal_type,
      status = EXCLUDED.status,
      changed_at = EXCLUDED.changed_at;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'kitchen_order_signals'
     ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.kitchen_order_signals';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION private.kitchen_catalog_document(), private.sync_kitchen_order_signal()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_kitchen_catalog(), public.save_kitchen_meal(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kitchen_catalog(), public.save_kitchen_meal(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN
) TO authenticated;

COMMENT ON FUNCTION public.get_kitchen_catalog() IS
  'Returns active and inactive lunch/dinner meal catalog entries to kitchen/admin users.';
COMMENT ON FUNCTION public.save_kitchen_meal(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN) IS
  'Creates or updates a meal through kitchen/admin authorization and records a private audit snapshot.';
COMMENT ON TABLE public.kitchen_order_signals IS
  'Minimal RLS-protected realtime refresh signals. Fetch order preparation data through get_kitchen_orders().';


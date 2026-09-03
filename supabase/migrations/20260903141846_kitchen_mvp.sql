-- CLI-generated in verified foundation CI run 33764191064, job 100677736090.
-- Kitchen sees preparation snapshots through guarded RPCs; customer RLS is unchanged.
CREATE TABLE private.kitchen_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT NOT NULL CHECK (previous_status IN ('confirmed','preparing')),
  next_status TEXT NOT NULL CHECK (next_status IN ('preparing','ready')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK ((previous_status='confirmed' AND next_status='preparing') OR
         (previous_status='preparing' AND next_status='ready'))
);
ALTER TABLE private.kitchen_status_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.kitchen_status_events FROM PUBLIC, anon, authenticated;
CREATE INDEX kitchen_status_events_order ON private.kitchen_status_events(order_id,created_at);
CREATE INDEX kitchen_status_events_actor ON private.kitchen_status_events(actor_id);
CREATE INDEX orders_kitchen_queue ON public.orders(order_date,meal_type,created_at)
  WHERE status IN ('confirmed','preparing','ready');

CREATE FUNCTION private.require_kitchen_access() RETURNS UUID
LANGUAGE plpgsql STABLE SET search_path = '' AS $$
DECLARE actor UUID := auth.uid();
BEGIN
  IF actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id=actor AND role IN ('kitchen','admin')
  ) THEN
    RAISE EXCEPTION 'Kitchen access is required.' USING ERRCODE='42501';
  END IF;
  RETURN actor;
END $$;

CREATE FUNCTION private.kitchen_order_document(p_order_id UUID) RETURNS JSONB
LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT jsonb_build_object(
    'id',o.id,'order_number',o.order_number,'order_date',o.order_date,
    'meal_type',o.meal_type,'slot_label',coalesce(o.address_snapshot->>'slotLabel',''),
    'status',o.status,'created_at',o.created_at,'updated_at',o.updated_at,'notes',o.notes,
    'items',coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id',i.id,'meal_name',i.meal_name_snapshot,'quantity',i.quantity,
        'preferences',i.preparation_preferences,
        'addons',coalesce((SELECT jsonb_agg(jsonb_build_object(
          'id',c.id,'name',c.customization_name_snapshot,'quantity',c.quantity
        ) ORDER BY c.id) FROM public.order_customizations c WHERE c.order_item_id=i.id),'[]'::jsonb)
      ) ORDER BY i.id) FROM public.order_items i WHERE i.order_id=o.id
    ),'[]'::jsonb)
  ) FROM public.orders o WHERE o.id=p_order_id;
$$;

CREATE FUNCTION public.get_kitchen_orders(p_order_date DATE,p_meal_type TEXT) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM private.require_kitchen_access();
  IF p_order_date IS NULL OR p_meal_type IS NULL OR p_meal_type NOT IN ('lunch','dinner') THEN
    RAISE EXCEPTION 'Choose a date and lunch or dinner.' USING ERRCODE='22023';
  END IF;
  RETURN coalesce((SELECT jsonb_agg(private.kitchen_order_document(o.id)
    ORDER BY o.address_snapshot->>'slotLabel',o.created_at,o.id)
    FROM public.orders o WHERE o.order_date=p_order_date AND o.meal_type=p_meal_type
    AND o.status IN ('confirmed','preparing','ready')),'[]'::jsonb);
END $$;

CREATE FUNCTION public.update_kitchen_order_status(
  p_order_id UUID,p_expected_status TEXT,p_next_status TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE actor UUID; current_status TEXT;
BEGIN
  actor := private.require_kitchen_access();
  IF p_expected_status IS NULL OR p_next_status IS NULL OR NOT (
    (p_expected_status='confirmed' AND p_next_status='preparing') OR
    (p_expected_status='preparing' AND p_next_status='ready')
  ) THEN
    RAISE EXCEPTION 'Orders must move from confirmed to preparing to ready.' USING ERRCODE='22023';
  END IF;
  SELECT status INTO current_status FROM public.orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order was not found.' USING ERRCODE='P0002'; END IF;
  -- Safe retry after a lost response: do not produce a second status event.
  IF current_status=p_next_status THEN RETURN private.kitchen_order_document(p_order_id); END IF;
  IF current_status<>p_expected_status THEN
    RAISE EXCEPTION 'This order has changed. Refresh the kitchen queue.' USING ERRCODE='40001';
  END IF;
  UPDATE public.orders SET status=p_next_status WHERE id=p_order_id;
  INSERT INTO private.kitchen_status_events(order_id,actor_id,previous_status,next_status)
    VALUES(p_order_id,actor,p_expected_status,p_next_status);
  RETURN private.kitchen_order_document(p_order_id);
END $$;

REVOKE ALL ON FUNCTION private.require_kitchen_access(),private.kitchen_order_document(UUID)
  FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.get_kitchen_orders(DATE,TEXT),public.update_kitchen_order_status(UUID,TEXT,TEXT)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.get_kitchen_orders(DATE,TEXT),public.update_kitchen_order_status(UUID,TEXT,TEXT)
  TO authenticated;
COMMENT ON FUNCTION public.update_kitchen_order_status(UUID,TEXT,TEXT) IS
  'Kitchen/admin preparation transitions only; payment stays independent in manual-payment mode. Each new transition records its actor privately.';

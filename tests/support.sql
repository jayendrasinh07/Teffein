BEGIN;
SELECT set_config('request.jwt.claim.aal','aal2',true);
DO $$
DECLARE
  v_admin UUID := gen_random_uuid();
  v_customer UUID := gen_random_uuid();
  v_outsider UUID := gen_random_uuid();
  v_slot UUID;
  v_order UUID := gen_random_uuid();
  v_date DATE := (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date + 1;
BEGIN
  INSERT INTO auth.users(id, email, raw_user_meta_data) VALUES
    (v_admin, 'support-admin@example.invalid', '{"full_name":"Support Admin"}'),
    (v_customer, 'support-customer@example.invalid', '{"full_name":"Support Customer"}'),
    (v_outsider, 'support-outsider@example.invalid', '{}');
  INSERT INTO public.user_roles(user_id, role) VALUES (v_admin, 'admin');
  INSERT INTO public.delivery_slots(name, meal_type, start_time, end_time, cutoff_time, max_orders)
  VALUES ('Support workflow slot', 'lunch', '14:00', '14:30', '10:30', 20)
  RETURNING id INTO v_slot;
  INSERT INTO public.orders(id, user_id, delivery_slot_id, order_number, idempotency_key, request_payload, order_date, meal_type, status, address_snapshot)
  VALUES (v_order, v_customer, v_slot, 'TEF-SUPPORT-TEST', gen_random_uuid(), '{}', v_date, 'lunch', 'confirmed', '{"slotLabel":"14:00:00 – 14:30:00"}');
  INSERT INTO public.order_items(order_id, meal_name_snapshot, quantity, unit_price, line_total)
  VALUES (v_order, 'Support Test Thali', 1, 100, 100);
  PERFORM set_config('test.support', jsonb_build_object('admin', v_admin, 'customer', v_customer, 'outsider', v_outsider, 'order', v_order)::text, true);
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN PERFORM public.create_support_request('other', 'Anonymous request', NULL); RAISE EXCEPTION 'Anonymous support write'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.get_my_support_requests(); RAISE EXCEPTION 'Anonymous support read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.get_kitchen_support_requests(); RAISE EXCEPTION 'Anonymous admin queue read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$
DECLARE v_f JSONB := current_setting('test.support')::jsonb;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v_f->>'outsider', true);
  BEGIN PERFORM public.cancel_customer_order((v_f->>'order')::uuid, 'changed_mind', NULL); RAISE EXCEPTION 'Foreign cancellation allowed'; EXCEPTION WHEN no_data_found THEN NULL; END;
  BEGIN PERFORM public.create_support_request('order_help', 'Foreign order request', (v_f->>'order')::uuid); RAISE EXCEPTION 'Foreign support link allowed'; EXCEPTION WHEN no_data_found THEN NULL; END;
  BEGIN PERFORM public.get_kitchen_support_requests(); RAISE EXCEPTION 'Customer admin queue read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$
DECLARE
  v_f JSONB := current_setting('test.support')::jsonb;
  v_request JSONB;
  v_requests JSONB;
  v_cancelled JSONB;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v_f->>'customer', true);
  BEGIN PERFORM public.cancel_customer_order((v_f->>'order')::uuid, 'invalid', NULL); RAISE EXCEPTION 'Invalid cancellation reason accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN PERFORM public.cancel_customer_order((v_f->>'order')::uuid, 'other', 'no'); RAISE EXCEPTION 'Short other note accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN PERFORM public.create_support_request('order_help', 'short', (v_f->>'order')::uuid); RAISE EXCEPTION 'Short support message accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;

  v_request := public.create_support_request('order_help', 'Please confirm the delivery time.', (v_f->>'order')::uuid);
  v_requests := public.get_my_support_requests();
  IF jsonb_array_length(v_requests) <> 1
     OR v_requests#>>'{0,id}' <> v_request->>'id'
     OR v_requests#>>'{0,order_number}' <> 'TEF-SUPPORT-TEST'
     OR v_requests#>>'{0,status}' <> 'open' THEN
    RAISE EXCEPTION 'Customer support tracking failed: %', v_requests;
  END IF;

  v_cancelled := public.cancel_customer_order((v_f->>'order')::uuid, 'schedule_changed', 'Office timing changed');
  IF v_cancelled->>'status' <> 'cancelled'
     OR v_cancelled->>'payment_status' <> 'pending'
     OR v_cancelled->>'cancellation_reason' <> 'schedule_changed'
     OR v_cancelled->>'cancellation_note' <> 'Office timing changed'
     OR v_cancelled->>'cancelled_at' IS NULL THEN
    RAISE EXCEPTION 'Reason-based cancellation failed: %', v_cancelled;
  END IF;
  PERFORM public.cancel_customer_order((v_f->>'order')::uuid, 'changed_mind', NULL);
  BEGIN PERFORM count(*) FROM private.support_requests; RAISE EXCEPTION 'Private support table exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM count(*) FROM private.order_cancellation_events; RAISE EXCEPTION 'Private cancellation audit exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$
DECLARE
  v_f JSONB := current_setting('test.support')::jsonb;
  v_queue JSONB;
  v_ticket JSONB;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v_f->>'admin', true);
  v_queue := public.get_kitchen_support_requests();
  SELECT entry INTO v_ticket FROM jsonb_array_elements(v_queue) entry WHERE entry->>'order_number' = 'TEF-SUPPORT-TEST';
  IF v_ticket IS NULL OR v_ticket->>'customer_name' <> 'Support Customer'
     OR v_ticket->>'customer_email' <> 'support-customer@example.invalid'
     OR v_ticket->>'status' <> 'open' THEN
    RAISE EXCEPTION 'Admin support projection failed: %', v_queue;
  END IF;
  v_queue := public.update_kitchen_support_request((v_ticket->>'id')::uuid, 'in_progress');
  v_queue := public.update_kitchen_support_request((v_ticket->>'id')::uuid, 'resolved');
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v_queue) entry WHERE entry->>'id' = v_ticket->>'id' AND entry->>'status' = 'resolved') THEN
    RAISE EXCEPTION 'Admin support status update failed: %', v_queue;
  END IF;
END $$;
RESET ROLE;

DO $$
DECLARE v_f JSONB := current_setting('test.support')::jsonb;
BEGIN
  IF (SELECT count(*) FROM private.order_cancellation_events WHERE order_id = (v_f->>'order')::uuid) <> 1 THEN
    RAISE EXCEPTION 'Cancellation was not audited exactly once';
  END IF;
  IF (SELECT count(*) FROM private.support_request_events WHERE action = 'created') <> 1
     OR (SELECT count(*) FROM private.support_request_events WHERE action = 'status_changed') <> 2 THEN
    RAISE EXCEPTION 'Support audit trail is incomplete';
  END IF;
END $$;
ROLLBACK;
SELECT 'PASS: reasoned cancellation, private audit, customer support tracking and admin queue' AS result;


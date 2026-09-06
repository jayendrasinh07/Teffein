BEGIN;
DO $$
DECLARE
  v_admin UUID := gen_random_uuid();
  v_staff UUID := gen_random_uuid();
  v_customer UUID := gen_random_uuid();
  v_candidate UUID := gen_random_uuid();
  v_slot UUID;
  v_order UUID := gen_random_uuid();
  v_date DATE := (clock_timestamp() AT TIME ZONE 'Asia/Kolkata')::date + 1;
BEGIN
  INSERT INTO auth.users(id, email, raw_user_meta_data) VALUES
    (v_admin, 'admin-management@example.invalid', '{"full_name":"Admin Lead"}'),
    (v_staff, 'kitchen-management@example.invalid', '{"full_name":"Kitchen Lead"}'),
    (v_customer, 'customer-management@example.invalid', '{}'),
    (v_candidate, 'candidate-management@example.invalid', '{"full_name":"New Cook"}');
  INSERT INTO public.user_roles(user_id, role) VALUES (v_admin, 'admin'), (v_staff, 'kitchen');
  INSERT INTO public.delivery_slots(name, meal_type, start_time, end_time, cutoff_time, max_orders)
  VALUES ('Management capacity test', 'lunch', '14:00', '14:30', '10:30', 8)
  RETURNING id INTO v_slot;
  INSERT INTO public.orders(id, user_id, delivery_slot_id, order_number, idempotency_key, request_payload, order_date, meal_type, status)
  VALUES (v_order, v_customer, v_slot, 'TEF-MANAGEMENT', gen_random_uuid(), '{}', v_date, 'lunch', 'confirmed');
  INSERT INTO public.order_items(order_id, meal_name_snapshot, quantity, unit_price, line_total)
  VALUES (v_order, 'Management Thali', 6, 100, 600);
  PERFORM set_config('test.management', jsonb_build_object(
    'admin', v_admin, 'staff', v_staff, 'customer', v_customer,
    'candidate', v_candidate, 'slot', v_slot
  )::text, true);
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN PERFORM public.get_kitchen_management(); RAISE EXCEPTION 'Anonymous management read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.grant_kitchen_access('candidate-management@example.invalid'); RAISE EXCEPTION 'Anonymous staff grant'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$
DECLARE v_f JSONB := current_setting('test.management')::jsonb; v_actor TEXT;
BEGIN
  FOREACH v_actor IN ARRAY ARRAY['customer', 'staff'] LOOP
    PERFORM set_config('request.jwt.claim.sub', v_f->>v_actor, true);
    BEGIN PERFORM public.get_kitchen_management(); RAISE EXCEPTION 'Non-admin management read: %', v_actor; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN PERFORM public.save_kitchen_delivery_slot((v_f->>'slot')::uuid, 10, true); RAISE EXCEPTION 'Non-admin slot update: %', v_actor; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN PERFORM public.grant_kitchen_access('candidate-management@example.invalid'); RAISE EXCEPTION 'Non-admin staff grant: %', v_actor; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  END LOOP;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$
DECLARE
  v_f JSONB := current_setting('test.management')::jsonb;
  v_document JSONB;
  v_slot JSONB;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v_f->>'admin', true);
  v_document := public.get_kitchen_management();
  SELECT entry INTO v_slot FROM jsonb_array_elements(v_document->'slots') entry WHERE entry->>'id' = v_f->>'slot';
  IF v_document->>'payment_mode' <> 'manual'
     OR v_document#>>'{cutoffs,lunch}' <> '10:30:00'
     OR v_document#>>'{cutoffs,dinner}' <> '17:30:00'
     OR v_slot->>'max_portions' <> '8'
     OR v_slot->>'peak_booked_portions' <> '6' THEN
    RAISE EXCEPTION 'Management document is incorrect: %', v_document;
  END IF;

  BEGIN
    PERFORM public.save_kitchen_delivery_slot((v_f->>'slot')::uuid, 5, true);
    RAISE EXCEPTION 'Capacity below booked portions accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  v_document := public.save_kitchen_delivery_slot((v_f->>'slot')::uuid, 10, false);
  IF (SELECT max_orders FROM public.delivery_slots WHERE id = (v_f->>'slot')::uuid) <> 10
     OR (SELECT is_active FROM public.delivery_slots WHERE id = (v_f->>'slot')::uuid)
     OR (SELECT cutoff_time FROM public.delivery_slots WHERE id = (v_f->>'slot')::uuid) <> TIME '10:30' THEN
    RAISE EXCEPTION 'Slot update changed the wrong fields';
  END IF;

  v_document := public.grant_kitchen_access(' CANDIDATE-MANAGEMENT@example.invalid ');
  PERFORM public.grant_kitchen_access('candidate-management@example.invalid');
  IF (SELECT count(*) FROM public.user_roles WHERE user_id = (v_f->>'candidate')::uuid AND role = 'kitchen') <> 1 THEN
    RAISE EXCEPTION 'Kitchen role grant is not idempotent';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v_document->'staff') entry WHERE entry->>'email' = 'candidate-management@example.invalid') THEN
    RAISE EXCEPTION 'Granted Kitchen user missing from document';
  END IF;

  BEGIN UPDATE public.delivery_slots SET max_orders = 1 WHERE id = (v_f->>'slot')::uuid; RAISE EXCEPTION 'Direct slot update allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM public.user_roles WHERE user_id = (v_f->>'staff')::uuid AND role = 'kitchen'; RAISE EXCEPTION 'Direct role delete allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM count(*) FROM private.kitchen_management_events; RAISE EXCEPTION 'Private audit exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  v_document := public.revoke_kitchen_access((v_f->>'candidate')::uuid);
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_document->'staff') entry WHERE entry->>'user_id' = v_f->>'candidate') THEN
    RAISE EXCEPTION 'Revoked Kitchen user remains in document';
  END IF;
END $$;
RESET ROLE;

DO $$
DECLARE v_f JSONB := current_setting('test.management')::jsonb;
BEGIN
  IF (SELECT count(*) FROM private.kitchen_management_events WHERE action = 'slot_updated' AND target_id = (v_f->>'slot')::uuid) <> 1 THEN RAISE EXCEPTION 'Slot audit failed'; END IF;
  IF (SELECT count(*) FROM private.kitchen_management_events WHERE action = 'staff_granted' AND target_id = (v_f->>'candidate')::uuid) <> 1 THEN RAISE EXCEPTION 'Grant audit failed'; END IF;
  IF (SELECT count(*) FROM private.kitchen_management_events WHERE action = 'staff_revoked' AND target_id = (v_f->>'candidate')::uuid) <> 1 THEN RAISE EXCEPTION 'Revoke audit failed'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: admin-only management, fixed cutoffs, capacity floor, staff roles and private audit' AS result;


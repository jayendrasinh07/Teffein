BEGIN;
SELECT set_config('request.jwt.claim.aal', 'aal2', true);
DO $$
DECLARE v_admin UUID := gen_random_uuid(); v_staff UUID := gen_random_uuid(); v_customer UUID := gen_random_uuid(); v_day DATE := DATE '2026-09-08';
DECLARE v_first UUID := gen_random_uuid(); v_second UUID := gen_random_uuid(); v_cancelled UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users(id, email) VALUES (v_admin, 'analytics-admin@example.invalid'), (v_staff, 'analytics-staff@example.invalid'), (v_customer, 'analytics-customer@example.invalid');
  INSERT INTO public.user_roles(user_id, role) VALUES (v_admin, 'admin'), (v_staff, 'kitchen');
  INSERT INTO public.orders(id,user_id,order_number,idempotency_key,request_payload,order_date,meal_type,status,grand_total,payment_status) VALUES
    (v_first,v_customer,'TEF-ANALYTICS-1',gen_random_uuid(),'{}',v_day,'lunch','confirmed',200,'pending'),
    (v_second,v_customer,'TEF-ANALYTICS-2',gen_random_uuid(),'{}',v_day,'dinner','ready',150,'pending'),
    (v_cancelled,v_customer,'TEF-ANALYTICS-3',gen_random_uuid(),'{}',v_day,'lunch','cancelled',100,'pending');
  INSERT INTO public.order_items(order_id,meal_name_snapshot,quantity,unit_price,line_total) VALUES
    (v_first,'Gujarati Thali',2,100,200),(v_second,'Jain Thali',1,150,150),(v_cancelled,'Gujarati Thali',1,100,100);
  PERFORM set_config('test.analytics', jsonb_build_object('admin',v_admin,'staff',v_staff,'day',v_day)::text, true);
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN BEGIN PERFORM public.get_kitchen_business_analytics(DATE '2026-09-08',DATE '2026-09-08'); RAISE EXCEPTION 'Anonymous analytics access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$
DECLARE v_fixture JSONB := current_setting('test.analytics')::jsonb; v_report JSONB;
BEGIN
  PERFORM set_config('request.jwt.claim.sub',v_fixture->>'staff',true);
  BEGIN PERFORM public.get_kitchen_business_analytics(DATE '2026-09-08',DATE '2026-09-08'); RAISE EXCEPTION 'Kitchen staff analytics access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM set_config('request.jwt.claim.sub',v_fixture->>'admin',true);
  PERFORM set_config('request.jwt.claim.aal','aal1',true);
  BEGIN PERFORM public.get_kitchen_business_analytics(DATE '2026-09-08',DATE '2026-09-08'); RAISE EXCEPTION 'Admin analytics without MFA'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM set_config('request.jwt.claim.aal','aal2',true);
  v_report := public.get_kitchen_business_analytics(DATE '2026-09-08',DATE '2026-09-08');
  IF v_report#>>'{summary,total_orders}' <> '3' OR v_report#>>'{summary,active_orders}' <> '2'
     OR v_report#>>'{summary,cancelled_orders}' <> '1' OR v_report#>>'{summary,total_portions}' <> '3'
     OR (v_report#>>'{summary,booked_value}')::numeric <> 350 OR jsonb_array_length(v_report->'daily') <> 1
     OR v_report::text LIKE '%analytics-customer@example.invalid%' THEN RAISE EXCEPTION 'Analytics totals or privacy failed: %',v_report; END IF;
  BEGIN PERFORM public.get_kitchen_business_analytics(DATE '2026-01-01',DATE '2026-09-08'); RAISE EXCEPTION 'Oversized report range'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: aggregate analytics totals, privacy, range guard and MFA admin access' AS result;

-- Aggregate, PII-free business reporting for MFA-verified admins.
CREATE FUNCTION public.get_kitchen_business_analytics(p_start_date DATE, p_end_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_result JSONB;
BEGIN
  PERFORM private.require_admin_access();
  IF p_start_date IS NULL OR p_end_date IS NULL OR p_start_date > p_end_date
     OR p_end_date - p_start_date > 92 THEN
    RAISE EXCEPTION 'Choose a valid report range of up to 93 days.' USING ERRCODE = '22023';
  END IF;

  SELECT jsonb_build_object(
    'start_date', p_start_date,
    'end_date', p_end_date,
    'generated_at', clock_timestamp(),
    'summary', (
      SELECT jsonb_build_object(
        'total_orders', count(*),
        'active_orders', count(*) FILTER (WHERE o.status <> 'cancelled'),
        'cancelled_orders', count(*) FILTER (WHERE o.status = 'cancelled'),
        'cancellation_rate', coalesce(round(100.0 * count(*) FILTER (WHERE o.status = 'cancelled') / nullif(count(*), 0), 1), 0),
        'total_portions', coalesce(sum(items.portions) FILTER (WHERE o.status <> 'cancelled'), 0),
        'booked_value', coalesce(sum(o.grand_total) FILTER (WHERE o.status <> 'cancelled'), 0),
        'average_order_value', coalesce(round(avg(o.grand_total) FILTER (WHERE o.status <> 'cancelled'), 2), 0),
        'paid_value', coalesce(sum(o.grand_total) FILTER (WHERE o.status <> 'cancelled' AND o.payment_status = 'paid'), 0),
        'pending_value', coalesce(sum(o.grand_total) FILTER (WHERE o.status <> 'cancelled' AND o.payment_status = 'pending'), 0)
      )
      FROM public.orders o
      LEFT JOIN LATERAL (SELECT sum(i.quantity)::BIGINT portions FROM public.order_items i WHERE i.order_id = o.id) items ON true
      WHERE o.order_date BETWEEN p_start_date AND p_end_date
    ),
    'daily', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'date', report.report_date,
        'orders', report.orders,
        'cancelled', report.cancelled,
        'portions', report.portions,
        'booked_value', report.booked_value
      ) ORDER BY report.report_date), '[]'::jsonb)
      FROM (
        SELECT d.report_date::DATE AS report_date,
          count(o.id) orders,
          count(o.id) FILTER (WHERE o.status = 'cancelled') cancelled,
          coalesce(sum(items.portions) FILTER (WHERE o.status <> 'cancelled'), 0) portions,
          coalesce(sum(o.grand_total) FILTER (WHERE o.status <> 'cancelled'), 0) booked_value
        FROM generate_series(p_start_date, p_end_date, interval '1 day') AS d(report_date)
        LEFT JOIN public.orders o ON o.order_date = d.report_date::DATE
        LEFT JOIN LATERAL (SELECT sum(i.quantity)::BIGINT portions FROM public.order_items i WHERE i.order_id = o.id) items ON true
        GROUP BY d.report_date
      ) report
    ),
    'statuses', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('status', status, 'orders', orders) ORDER BY status), '[]'::jsonb)
      FROM (SELECT o.status, count(*) orders FROM public.orders o WHERE o.order_date BETWEEN p_start_date AND p_end_date GROUP BY o.status) grouped
    ),
    'meal_types', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('meal_type', meal_type, 'orders', orders, 'portions', portions) ORDER BY meal_type), '[]'::jsonb)
      FROM (
        SELECT o.meal_type, count(*) orders, coalesce(sum(items.portions), 0) portions
        FROM public.orders o
        LEFT JOIN LATERAL (SELECT sum(i.quantity)::BIGINT portions FROM public.order_items i WHERE i.order_id = o.id) items ON true
        WHERE o.order_date BETWEEN p_start_date AND p_end_date AND o.status <> 'cancelled'
        GROUP BY o.meal_type
      ) grouped
    ),
    'payments', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('payment_status', payment_status, 'orders', orders, 'value', value) ORDER BY payment_status), '[]'::jsonb)
      FROM (
        SELECT o.payment_status, count(*) orders, coalesce(sum(o.grand_total), 0) value
        FROM public.orders o
        WHERE o.order_date BETWEEN p_start_date AND p_end_date AND o.status <> 'cancelled'
        GROUP BY o.payment_status
      ) grouped
    ),
    'top_meals', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('meal_name', meal_name, 'portions', portions) ORDER BY portions DESC, meal_name), '[]'::jsonb)
      FROM (
        SELECT i.meal_name_snapshot meal_name, sum(i.quantity) portions
        FROM public.orders o JOIN public.order_items i ON i.order_id = o.id
        WHERE o.order_date BETWEEN p_start_date AND p_end_date AND o.status <> 'cancelled'
        GROUP BY i.meal_name_snapshot ORDER BY portions DESC, meal_name LIMIT 10
      ) grouped
    )
  ) INTO v_result;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_kitchen_business_analytics(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kitchen_business_analytics(DATE, DATE) TO authenticated;
COMMENT ON FUNCTION public.get_kitchen_business_analytics(DATE, DATE) IS
  'Admin-only aggregate report. Values are booked order amounts, not payment settlement.';

-- Privacy-safe client crash monitoring. Payloads intentionally exclude customer content.
CREATE TABLE private.client_error_events (
  id UUID PRIMARY KEY,
  actor_day_hash TEXT NOT NULL CHECK (length(actor_day_hash) = 64),
  surface TEXT NOT NULL CHECK (surface IN ('customer', 'kitchen')),
  error_kind TEXT NOT NULL CHECK (error_kind = 'render_crash'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE private.client_error_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.client_error_events FROM PUBLIC, anon, authenticated;
CREATE INDEX client_error_events_created_at_idx ON private.client_error_events (created_at DESC);
CREATE INDEX client_error_events_rate_limit_idx ON private.client_error_events (actor_day_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.report_client_error(
  p_event_id UUID,
  p_surface TEXT,
  p_error_kind TEXT DEFAULT 'render_crash'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_actor_day_hash TEXT;
BEGIN
  IF v_actor IS NULL THEN
    RETURN;
  END IF;
  IF p_event_id IS NULL OR p_surface NOT IN ('customer', 'kitchen') OR p_error_kind <> 'render_crash' THEN
    RAISE EXCEPTION 'Invalid client error report' USING ERRCODE = '22023';
  END IF;

  v_actor_day_hash := encode(extensions.digest(v_actor::text || current_date::text, 'sha256'), 'hex');
  IF (SELECT count(*) FROM private.client_error_events
      WHERE actor_day_hash = v_actor_day_hash AND created_at > clock_timestamp() - interval '15 minutes') >= 20 THEN
    RETURN;
  END IF;

  DELETE FROM private.client_error_events WHERE created_at < clock_timestamp() - interval '30 days';
  INSERT INTO private.client_error_events(id, actor_day_hash, surface, error_kind)
  VALUES (p_event_id, v_actor_day_hash, p_surface, p_error_kind)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_error_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.require_admin_access();
  RETURN jsonb_build_object(
    'last_24h', (SELECT count(*) FROM private.client_error_events WHERE created_at >= clock_timestamp() - interval '24 hours'),
    'last_7d', (SELECT count(*) FROM private.client_error_events WHERE created_at >= clock_timestamp() - interval '7 days'),
    'latest_at', (SELECT max(created_at) FROM private.client_error_events)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.report_client_error(UUID, TEXT, TEXT), public.get_client_error_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.report_client_error(UUID, TEXT, TEXT), public.get_client_error_summary() TO authenticated;

COMMENT ON TABLE private.client_error_events IS '30-day privacy-minimized UI crash events; no messages, contact data, order IDs, URLs, or device details.';

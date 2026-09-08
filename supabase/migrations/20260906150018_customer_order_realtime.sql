-- Customer tracking refreshes immediately after Kitchen status changes.
-- RLS continues to restrict each authenticated customer to their own orders.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'orders'
     ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
  END IF;
END;
$$;

COMMENT ON TABLE public.orders IS
  'Customer order headers. Published to Supabase Realtime with existing owner/admin SELECT RLS.';


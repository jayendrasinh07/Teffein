-- Admin checks are only used by authenticated RLS policies.
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM anon;

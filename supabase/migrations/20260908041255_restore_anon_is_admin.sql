-- Public menu RLS evaluates this self-limited helper for anonymous reads.
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

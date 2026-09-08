-- Require a verified MFA session for every Kitchen/Admin operation.

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT check_user_id IS NOT NULL
    AND check_user_id = (SELECT auth.uid())
    AND coalesce((SELECT auth.jwt()->>'aal'), 'aal1') = 'aal2'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = check_user_id AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION private.require_kitchen_access() RETURNS UUID
LANGUAGE plpgsql STABLE SET search_path = '' AS $$
DECLARE actor UUID := auth.uid();
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'Kitchen access is required.' USING ERRCODE='42501';
  END IF;
  IF coalesce(auth.jwt()->>'aal', 'aal1') <> 'aal2' THEN
    RAISE EXCEPTION 'Multi-factor authentication is required.' USING ERRCODE='42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id=actor AND role IN ('kitchen','admin')
  ) THEN
    RAISE EXCEPTION 'Kitchen access is required.' USING ERRCODE='42501';
  END IF;
  RETURN actor;
END $$;

CREATE OR REPLACE FUNCTION private.require_admin_access() RETURNS UUID
LANGUAGE plpgsql STABLE SET search_path = '' AS $$
DECLARE v_actor UUID := auth.uid();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Admin access is required.' USING ERRCODE='42501';
  END IF;
  IF coalesce(auth.jwt()->>'aal', 'aal1') <> 'aal2' THEN
    RAISE EXCEPTION 'Multi-factor authentication is required.' USING ERRCODE='42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id=v_actor AND role='admin'
  ) THEN
    RAISE EXCEPTION 'Admin access is required.' USING ERRCODE='42501';
  END IF;
  RETURN v_actor;
END $$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;
REVOKE ALL ON FUNCTION private.require_kitchen_access(), private.require_admin_access() FROM PUBLIC, anon, authenticated;

-- Local/CI-only approximation of Supabase Auth. Never deploy this file to cloud.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT, phone TEXT, raw_user_meta_data JSONB DEFAULT '{}');
CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
CREATE FUNCTION auth.jwt() RETURNS JSONB LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object(
   'sub', nullif(current_setting('request.jwt.claim.sub',true),''),
   'aal', coalesce(nullif(current_setting('request.jwt.claim.aal',true),''),'aal1')
 );
$$;
GRANT USAGE ON SCHEMA auth,public TO anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid(), auth.jwt() TO anon,authenticated;

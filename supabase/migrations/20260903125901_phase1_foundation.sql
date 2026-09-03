-- ==============================================================================
-- TEFFEIN — PHASE 1 DATABASE MIGRATION: PRODUCTION FOUNDATION
-- Brand: TEFFEIN ("Roz ka khana. Sahi khana.")
-- Gandhinagar Home-Style Meal Ordering Platform
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE SCHEMAS & TABLES
-- ==============================================================================

-- 2.1 PROFILES TABLE
-- Extends Supabase auth.users with customer/staff identity and preference segmentation
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  segment TEXT NOT NULL DEFAULT 'individual' CHECK (segment IN ('student', 'worker', 'corporate', 'family', 'individual')),
  diet_preference TEXT DEFAULT 'standard_gujarati' CHECK (diet_preference IN ('standard_gujarati', 'jain_satvik', 'kathiyawadi', 'low_oil_fit', 'north_indian')),
  default_portion TEXT DEFAULT 'regular' CHECK (default_portion IN ('mini', 'regular', 'jumbo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 USER ROLES TABLE
-- Supports multi-role access control (customer, admin, kitchen_lead, delivery_partner, corporate_manager)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'kitchen', 'delivery', 'corporate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);

-- 2.3 DELIVERY ZONES TABLE
-- Authoritative delivery zone definitions for Gandhinagar and surrounding clusters
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id TEXT PRIMARY KEY, -- 'zone_a_core', 'zone_b_extended', 'zone_c_periphery'
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 25,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_free_delivery BOOLEAN NOT NULL DEFAULT false,
  pincodes TEXT[] NOT NULL DEFAULT '{}',
  sectors TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Default Gandhinagar Delivery Zones
INSERT INTO public.delivery_zones (id, name, tagline, description, delivery_fee, estimated_duration_minutes, is_free_delivery, pincodes, sectors)
VALUES 
  (
    'zone_a_core', 
    'Core Gandhinagar & Tech Corridor', 
    'Free Cluster Delivery', 
    'Sectors 1–30, Infocity, Kudasan, PDPU Knowledge Corridor, Bhaijipura, Raysan, Sargasan & Sector 24-28 GIDC', 
    0.00, 
    25, 
    true, 
    ARRAY['382007', '382421', '382423', '382010', '382016', '382024'],
    ARRAY['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10', 'Sector 11', 'Sector 12', 'Sector 13', 'Sector 14', 'Sector 15', 'Sector 16', 'Sector 17', 'Sector 18', 'Sector 19', 'Sector 20', 'Sector 21', 'Sector 22', 'Sector 23', 'Sector 24', 'Sector 25', 'Sector 26', 'Sector 27', 'Sector 28', 'Sector 29', 'Sector 30', 'Infocity', 'Kudasan', 'Bhaijipura', 'Raysan', 'Sargasan', 'Randesan']
  ),
  (
    'zone_b_extended', 
    'GIFT City & Highway Corridor', 
    '₹15 Express Delivery', 
    'GIFT City SEZ & Domestic, Koba Highway, Nabhoi, Pethapur, Chiloda Circle', 
    15.00, 
    35, 
    false, 
    ARRAY['382355', '382009', '382610'],
    ARRAY['GIFT City', 'GIFT SEZ', 'Koba Circle', 'Nabhoi', 'Pethapur', 'Chiloda']
  ),
  (
    'zone_c_periphery', 
    'Outer Periphery Zone', 
    '₹25 Extended Delivery', 
    'Vavol, Kolavada, Adalaj Cross Roads, Urjanagar', 
    25.00, 
    40, 
    false, 
    ARRAY['382016', '382421', '382845'],
    ARRAY['Vavol', 'Kolavada', 'Adalaj', 'Urjanagar']
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  delivery_fee = EXCLUDED.delivery_fee,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
  is_free_delivery = EXCLUDED.is_free_delivery,
  pincodes = EXCLUDED.pincodes,
  sectors = EXCLUDED.sectors;

-- 2.4 USER ADDRESSES TABLE
-- Stores multi-point delivery locations with exact GPS coords, accuracy, and doorstep attributes
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home' CHECK (label IN ('Home', 'Office', 'College', 'PG', 'Other')),
  custom_label TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  house_flat_number TEXT,
  building_name TEXT,
  floor TEXT,
  street TEXT,
  landmark TEXT,
  area TEXT NOT NULL,
  sector TEXT,
  city TEXT NOT NULL DEFAULT 'Gandhinagar',
  state TEXT NOT NULL DEFAULT 'Gujarat',
  pincode TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  gps_accuracy DOUBLE PRECISION,
  place_id TEXT,
  formatted_address TEXT,
  source TEXT NOT NULL DEFAULT 'map' CHECK (source IN ('gps', 'search', 'map', 'saved', 'manual')),
  delivery_instructions TEXT,
  instruction_preset TEXT DEFAULT 'call_on_reach' CHECK (instruction_preset IN ('call_on_reach', 'leave_at_security', 'ring_bell', 'deliver_at_reception', 'custom')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  cluster_id TEXT DEFAULT 'cluster-a',
  zone_id TEXT REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  is_serviceable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 AREA WAITLIST TABLE
-- Allows customers outside serviceable boundary to register interest for zone expansion
CREATE TABLE IF NOT EXISTS public.area_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL, -- Phone or email
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Gandhinagar',
  pincode TEXT,
  segment TEXT DEFAULT 'individual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_pincode ON public.addresses(pincode);
CREATE INDEX IF NOT EXISTS idx_addresses_coords ON public.addresses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON public.delivery_zones(is_active);

-- ==============================================================================
-- 4. AUTOMATIC TRIGGERS & SECURITY FUNCTIONS
-- ==============================================================================

-- 4.1 Update Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach Updated At triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_addresses_updated_at ON public.addresses;
CREATE TRIGGER set_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Auth User Creation Hook Function
-- Automatically creates a public.profiles entry and default 'customer' role when an auth user registers
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_segment TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULLIF(split_part(NEW.email, '@', 1), ''), 'Customer');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '');
  v_segment := COALESCE(NEW.raw_user_meta_data->>'segment', 'individual');
  IF v_segment NOT IN ('student', 'worker', 'corporate', 'family', 'individual') THEN v_segment := 'individual'; END IF;

  -- 1. Insert Profile
  INSERT INTO public.profiles (id, full_name, phone, email, segment)
  VALUES (NEW.id, v_full_name, v_phone, NEW.email, v_segment)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone);

  -- 2. Insert Default 'customer' Role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach Auth Hook Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- 4.3 Admin Helper Function for RLS
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
END;
$$;

-- 4.4 Default Address Enforcer Function
-- Ensures that when an address is set to default, all other addresses for that user become non-default
CREATE OR REPLACE FUNCTION public.handle_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_default = true THEN
    PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_address_default_changed ON public.addresses;
CREATE TRIGGER on_address_default_changed
  BEFORE INSERT OR UPDATE OF is_default ON public.addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.handle_default_address();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all Phase 1 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_waitlist ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile or admins can update" ON public.profiles;
CREATE POLICY "Users can update their own profile or admins can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- 5.2 USER ROLES POLICIES
DROP POLICY IF EXISTS "Users can view their own roles or admins can view all" ON public.user_roles;
CREATE POLICY "Users can view their own roles or admins can view all"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
CREATE POLICY "Only admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5.3 DELIVERY ZONES POLICIES
-- Publicly readable by all guests, authenticated customers, and admins
DROP POLICY IF EXISTS "Delivery zones are viewable by everyone" ON public.delivery_zones;
CREATE POLICY "Delivery zones are viewable by everyone"
  ON public.delivery_zones FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage delivery zones" ON public.delivery_zones;
CREATE POLICY "Only admins can manage delivery zones"
  ON public.delivery_zones FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5.4 ADDRESSES POLICIES
DROP POLICY IF EXISTS "Users can view their own addresses or admins can view all" ON public.addresses;
CREATE POLICY "Users can view their own addresses or admins can view all"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
CREATE POLICY "Users can insert their own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses or admins can update" ON public.addresses;
CREATE POLICY "Users can update their own addresses or admins can update"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
CREATE POLICY "Users can delete their own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 5.5 AREA WAITLIST POLICIES
DROP POLICY IF EXISTS "Anyone can join the area waitlist" ON public.area_waitlist;
CREATE POLICY "Anyone can join the area waitlist"
  ON public.area_waitlist FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view area waitlist entries" ON public.area_waitlist;
CREATE POLICY "Only admins can view area waitlist entries"
  ON public.area_waitlist FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Server-owned serviceability, based only on the approved zone coverage lists.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION private.resolve_delivery_zone(p_pincode TEXT, p_area TEXT, p_sector TEXT)
RETURNS TEXT LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT z.id FROM public.delivery_zones z
  WHERE z.is_active AND btrim(p_pincode) = ANY(z.pincodes)
    AND EXISTS (SELECT 1 FROM unnest(z.sectors) s
      WHERE regexp_replace(lower(s), '[^a-z0-9]', '', 'g') IN
        (regexp_replace(lower(coalesce(p_area,'')), '[^a-z0-9]', '', 'g'),
         regexp_replace(lower(coalesce(p_sector,'')), '[^a-z0-9]', '', 'g')))
  ORDER BY z.id LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION private.normalize_address()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  NEW.zone_id := private.resolve_delivery_zone(NEW.pincode, NEW.area, NEW.sector);
  -- Same physical envelope as the existing location service. Unknown coordinates
  -- can use an exact covered sector+pincode; supplied out-of-area pins are rejected.
  IF (NEW.latitude IS NULL) <> (NEW.longitude IS NULL) OR
     (NEW.latitude IS NOT NULL AND NOT (NEW.latitude BETWEEN 23.10 AND 23.35 AND NEW.longitude BETWEEN 72.54 AND 72.76)) THEN
    NEW.zone_id := NULL;
  END IF;
  NEW.is_serviceable := NEW.zone_id IS NOT NULL;
  NEW.is_verified := false;
  NEW.cluster_id := CASE NEW.zone_id WHEN 'zone_a_core' THEN 'cluster-a' WHEN 'zone_b_extended' THEN 'cluster-b' WHEN 'zone_c_periphery' THEN 'cluster-c' ELSE NULL END;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS a_normalize_address ON public.addresses;
CREATE TRIGGER a_normalize_address BEFORE INSERT OR UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION private.normalize_address();
CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user ON public.addresses(user_id) WHERE is_default;
CREATE INDEX IF NOT EXISTS addresses_zone_id_idx ON public.addresses(zone_id);
ALTER TABLE public.addresses DROP CONSTRAINT IF EXISTS addresses_valid_coordinates;
ALTER TABLE public.addresses ADD CONSTRAINT addresses_valid_coordinates CHECK (
  (latitude IS NULL OR latitude BETWEEN -90 AND 90) AND (longitude IS NULL OR longitude BETWEEN -180 AND 180));
ALTER TABLE public.delivery_zones DROP CONSTRAINT IF EXISTS delivery_zones_valid_fees;
ALTER TABLE public.delivery_zones ADD CONSTRAINT delivery_zones_valid_fees CHECK (delivery_fee >= 0 AND min_order_amount >= 0);

-- The quotation uses current zone pricing and authenticated address ownership.
CREATE OR REPLACE FUNCTION public.quote_delivery_address(p_address_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE a public.addresses%ROWTYPE; z public.delivery_zones%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO a FROM public.addresses WHERE id=p_address_id AND user_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Delivery address not found'; END IF;
  SELECT * INTO z FROM public.delivery_zones WHERE id=private.resolve_delivery_zone(a.pincode,a.area,a.sector) AND is_active;
  IF NOT FOUND OR NOT a.is_serviceable OR z.id IS DISTINCT FROM a.zone_id THEN RAISE EXCEPTION 'This address is outside current delivery coverage'; END IF;
  RETURN jsonb_build_object('zoneId',z.id,'deliveryFee',CASE WHEN z.is_free_delivery THEN 0 ELSE z.delivery_fee END,'minOrderAmount',z.min_order_amount);
END;
$$;
REVOKE ALL ON FUNCTION public.quote_delivery_address(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quote_delivery_address(UUID) TO authenticated;
REVOKE ALL ON FUNCTION private.resolve_delivery_zone(TEXT,TEXT,TEXT), private.normalize_address() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at(), public.handle_new_auth_user(), public.handle_default_address() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;
REVOKE ALL ON public.profiles, public.user_roles, public.addresses, public.delivery_zones, public.area_waitlist FROM anon, authenticated;
GRANT SELECT ON public.delivery_zones TO anon, authenticated;
GRANT INSERT ON public.area_waitlist TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles, public.addresses, public.delivery_zones TO authenticated;
GRANT SELECT ON public.area_waitlist TO authenticated;

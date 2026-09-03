-- ==============================================================================
-- TEFFEIN — PHASE 2 DATABASE MIGRATION: ORDERING ENGINE & MENU SYSTEM
-- Brand: TEFFEIN ("Roz ka khana. Sahi khana.")
-- Gandhinagar Home-Style Meal Ordering Platform
-- ==============================================================================

-- 1. MEALS TABLE
-- Base meal catalog items supporting lunch, dinner, and future meal formats
CREATE TABLE IF NOT EXISTS public.meals (
  seed_key TEXT UNIQUE,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  meal_type TEXT NOT NULL DEFAULT 'lunch' CHECK (meal_type IN ('lunch', 'dinner', 'both', 'breakfast', 'snack')),
  diet_type TEXT DEFAULT 'standard_gujarati' CHECK (diet_type IN ('standard_gujarati', 'jain_satvik', 'kathiyawadi', 'low_oil_fit', 'north_indian')),
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 89.00 CHECK (base_price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MENU DAYS TABLE
-- Single menu calendar representation corresponding to specific dates
CREATE TABLE IF NOT EXISTS public.menu_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date DATE NOT NULL UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MENU ITEMS TABLE
-- Links specific meals to a menu date with availability and display sequencing
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_day_id UUID NOT NULL REFERENCES public.menu_days(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE RESTRICT,
  availability BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT menu_items_day_meal_unique UNIQUE (menu_day_id, meal_id)
);

-- 4. MEAL CUSTOMIZATIONS TABLE
-- Add-ons and dish customizations (Extra Roti, Extra Sabzi, Extra Dal, Chaas, Sweet)
-- Price is database-authoritative (never hardcoded in client components)
CREATE TABLE IF NOT EXISTS public.meal_customizations (
  seed_key TEXT UNIQUE,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE, -- NULL indicates universal add-on
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DELIVERY SLOTS TABLE
-- Meal delivery timing windows for Gandhinagar clusters (Lunch & Dinner)
CREATE TABLE IF NOT EXISTS public.delivery_slots (
  seed_key TEXT UNIQUE,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER NOT NULL DEFAULT 150 CHECK (max_orders >= 0), -- Semantics: Maximum meal portion / thali capacity for this delivery window batch
  cutoff_time TIME NOT NULL CHECK (cutoff_time = CASE meal_type WHEN 'lunch' THEN TIME '10:30' ELSE TIME '17:30' END),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.delivery_slots.max_orders IS 'Maximum meal portion / thali capacity for this slot batch (used for portion capacity enforcement).';

-- 6. ORDERS TABLE
-- High-integrity order header storing exact snapshot of delivery address & calculations
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL,
  request_payload JSONB NOT NULL,
  UNIQUE (user_id, idempotency_key),
  order_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  delivery_slot_id UUID REFERENCES public.delivery_slots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  customization_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (customization_total >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  notes TEXT,
  address_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ORDER ITEMS TABLE
-- Line items capturing exact meal name snapshot and unit price at time of order
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  meal_name_snapshot TEXT NOT NULL,
  preparation_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. ORDER CUSTOMIZATIONS TABLE
-- Line-level customizations capturing snapshot name and pricing for historical integrity
CREATE TABLE IF NOT EXISTS public.order_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  customization_id UUID REFERENCES public.meal_customizations(id) ON DELETE SET NULL,
  customization_name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_meals_active ON public.meals(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_days_date ON public.menu_days(menu_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_day ON public.menu_items(menu_day_id);
CREATE INDEX IF NOT EXISTS idx_meal_customizations_meal ON public.meal_customizations(meal_id);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_type ON public.delivery_slots(meal_type);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_customizations_item ON public.order_customizations(order_item_id);

-- ==============================================================================
-- 10. TRIGGERS FOR UPDATED AT TIMESTAMPS
-- ==============================================================================
DROP TRIGGER IF EXISTS set_meals_updated_at ON public.meals;
CREATE TRIGGER set_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_menu_days_updated_at ON public.menu_days;
CREATE TRIGGER set_menu_days_updated_at
  BEFORE UPDATE ON public.menu_days
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_meal_customizations_updated_at ON public.meal_customizations;
CREATE TRIGGER set_meal_customizations_updated_at
  BEFORE UPDATE ON public.meal_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_delivery_slots_updated_at ON public.delivery_slots;
CREATE TRIGGER set_delivery_slots_updated_at
  BEFORE UPDATE ON public.delivery_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_customizations ENABLE ROW LEVEL SECURITY;

-- 11.1 MEALS POLICIES
DROP POLICY IF EXISTS "Active meals are viewable by everyone" ON public.meals;
CREATE POLICY "Active meals are viewable by everyone"
  ON public.meals FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage meals" ON public.meals;
CREATE POLICY "Only admins can manage meals"
  ON public.meals FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11.2 MENU DAYS POLICIES
DROP POLICY IF EXISTS "Published menu days are viewable by everyone" ON public.menu_days;
CREATE POLICY "Published menu days are viewable by everyone"
  ON public.menu_days FOR SELECT
  USING (is_published = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage menu days" ON public.menu_days;
CREATE POLICY "Only admins can manage menu days"
  ON public.menu_days FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11.3 MENU ITEMS POLICIES
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON public.menu_items;
DROP POLICY IF EXISTS "Published menu items are viewable by everyone or admins can view all" ON public.menu_items;
CREATE POLICY "Published menu items are viewable by everyone or admins can view all"
  ON public.menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_days md
      WHERE md.id = menu_day_id
        AND (md.is_published = true OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Only admins can manage menu items" ON public.menu_items;
CREATE POLICY "Only admins can manage menu items"
  ON public.menu_items FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11.4 MEAL CUSTOMIZATIONS POLICIES
DROP POLICY IF EXISTS "Active meal customizations are viewable by everyone" ON public.meal_customizations;
CREATE POLICY "Active meal customizations are viewable by everyone"
  ON public.meal_customizations FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage meal customizations" ON public.meal_customizations;
CREATE POLICY "Only admins can manage meal customizations"
  ON public.meal_customizations FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11.5 DELIVERY SLOTS POLICIES
DROP POLICY IF EXISTS "Active delivery slots are viewable by everyone" ON public.delivery_slots;
CREATE POLICY "Active delivery slots are viewable by everyone"
  ON public.delivery_slots FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage delivery slots" ON public.delivery_slots;
CREATE POLICY "Only admins can manage delivery slots"
  ON public.delivery_slots FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11.6 ORDERS POLICIES
-- Regular users can only VIEW their own orders.
-- Orders must be placed securely via the place_order_secure() function.
DROP POLICY IF EXISTS "Users can view their own orders or admins can view all" ON public.orders;
CREATE POLICY "Users can view their own orders or admins can view all"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can insert orders directly" ON public.orders;
CREATE POLICY "Only admins can insert orders directly"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update orders directly" ON public.orders;
CREATE POLICY "Only admins can update orders directly"
  ON public.orders FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can delete orders" ON public.orders;
CREATE POLICY "Only admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 11.7 ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view items of their own orders or admins can view all" ON public.order_items;
CREATE POLICY "Users can view items of their own orders or admins can view all"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can insert items for their own orders" ON public.order_items;
DROP POLICY IF EXISTS "Only admins can insert order items directly" ON public.order_items;
CREATE POLICY "Only admins can insert order items directly"
  ON public.order_items FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update or delete order items" ON public.order_items;
CREATE POLICY "Only admins can update or delete order items"
  ON public.order_items FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11.8 ORDER CUSTOMIZATIONS POLICIES
DROP POLICY IF EXISTS "Users can view customizations of their own order items or admins can view all" ON public.order_customizations;
CREATE POLICY "Users can view customizations of their own order items or admins can view all"
  ON public.order_customizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_id AND (o.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can insert customizations for their own order items" ON public.order_customizations;
DROP POLICY IF EXISTS "Only admins can insert order customizations directly" ON public.order_customizations;
CREATE POLICY "Only admins can insert order customizations directly"
  ON public.order_customizations FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update or delete order customizations" ON public.order_customizations;
CREATE POLICY "Only admins can update or delete order customizations"
  ON public.order_customizations FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================================
-- 12. CRITICAL PRICE SECURITY: SERVER-SIDE ORDER CREATION RPC
-- All prices, totals, menu availability, cutoff rules, and address snapshots are
-- calculated and enforced by PostgreSQL, preventing client-side price tampering.
-- ==============================================================================

-- No API role, including administrators, may bypass the ordering RPC.
DROP POLICY IF EXISTS "Only admins can insert orders directly" ON public.orders;
DROP POLICY IF EXISTS "Only admins can update orders directly" ON public.orders;
DROP POLICY IF EXISTS "Only admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can insert order items directly" ON public.order_items;
DROP POLICY IF EXISTS "Only admins can update or delete order items" ON public.order_items;
DROP POLICY IF EXISTS "Only admins can insert order customizations directly" ON public.order_customizations;
DROP POLICY IF EXISTS "Only admins can update or delete order customizations" ON public.order_customizations;
CREATE INDEX IF NOT EXISTS orders_slot_date_idx ON public.orders(delivery_slot_id,order_date) WHERE status <> 'cancelled';
CREATE INDEX IF NOT EXISTS orders_address_idx ON public.orders(address_id);
CREATE INDEX IF NOT EXISTS order_items_meal_idx ON public.order_items(meal_id);
CREATE INDEX IF NOT EXISTS menu_items_meal_idx ON public.menu_items(meal_id);
CREATE INDEX IF NOT EXISTS order_customizations_customization_idx ON public.order_customizations(customization_id);

CREATE OR REPLACE FUNCTION private.assert_order_window(p_date DATE,p_type TEXT,p_now TIMESTAMPTZ)
RETURNS VOID LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE d DATE := (p_now AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
 IF p_date IS NULL OR p_type IS NULL OR p_type NOT IN ('lunch','dinner') THEN RAISE EXCEPTION 'Valid date and meal type required'; END IF;
 IF p_date < d OR p_date > d+6 THEN RAISE EXCEPTION 'Choose a date within the next seven days'; END IF;
 IF p_date=d AND (p_now AT TIME ZONE 'Asia/Kolkata')::time >= (CASE p_type WHEN 'lunch' THEN TIME '10:30' ELSE TIME '17:30' END) THEN
   RAISE EXCEPTION 'Ordering cutoff has passed';
 END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.order_document(p_order_id UUID)
RETURNS JSONB LANGUAGE sql STABLE SET search_path = '' AS $$
 SELECT (to_jsonb(o) - 'request_payload' - 'idempotency_key') || jsonb_build_object(
 'order_items', coalesce((SELECT jsonb_agg(to_jsonb(i) || jsonb_build_object(
 'order_customizations',coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.id) FROM public.order_customizations c WHERE c.order_item_id=i.id),'[]'::jsonb)) ORDER BY i.id)
 FROM public.order_items i WHERE i.order_id=o.id),'[]'::jsonb))
 FROM public.orders o WHERE o.id=p_order_id;
$$;

-- Remove the previous signature if this file is tested against an older local schema.
DROP FUNCTION IF EXISTS public.place_order_secure(DATE,TEXT,UUID,UUID,UUID,INT,JSONB,TEXT);
CREATE OR REPLACE FUNCTION public.place_order_secure(
 p_order_date DATE,p_meal_type TEXT,p_delivery_slot_id UUID,p_address_id UUID,p_meal_id UUID,p_quantity INT,
 p_customizations JSONB DEFAULT '[]',p_notes TEXT DEFAULT NULL,p_idempotency_key UUID DEFAULT NULL,p_preferences JSONB DEFAULT '{}'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
 u UUID := auth.uid(); m public.meals%ROWTYPE; md public.menu_days%ROWTYPE; mi public.menu_items%ROWTYPE;
 s public.delivery_slots%ROWTYPE; a public.addresses%ROWTYPE; z public.delivery_zones%ROWTYPE;
 c public.meal_customizations%ROWTYPE; e JSONB; extras JSONB := '[]'; normalized JSONB; payload JSONB; existing public.orders%ROWTYPE;
 preferences JSONB; cid UUID; qty INT; booked BIGINT; subtotal NUMERIC(10,2); addons NUMERIC(10,2):=0;
 fee NUMERIC(10,2); oid UUID := gen_random_uuid(); iid UUID; snapshot JSONB;
BEGIN
 IF u IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_idempotency_key IS NULL THEN RAISE EXCEPTION 'A checkout request key is required'; END IF;
 IF p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Quantity must be between 1 and 20'; END IF;
 IF p_customizations IS NULL OR jsonb_typeof(p_customizations) <> 'array' THEN RAISE EXCEPTION 'Add-ons must be an array'; END IF;
 IF jsonb_array_length(p_customizations)>20 THEN RAISE EXCEPTION 'Too many add-ons'; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(p_customizations) LOOP
   IF jsonb_typeof(e)<>'object' OR e->>'customization_id' IS NULL OR coalesce(e->>'quantity','') !~ '^[0-9]{1,3}$' THEN RAISE EXCEPTION 'Invalid add-on'; END IF;
   cid := (e->>'customization_id')::uuid; qty := (e->>'quantity')::int;
   IF qty NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Add-on quantity must be between 1 and 100'; END IF;
   extras := extras || jsonb_build_array(jsonb_build_object('customization_id',cid,'quantity',qty));
 END LOOP;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(extras) v GROUP BY v->>'customization_id' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate add-on'; END IF;
 SELECT coalesce(jsonb_agg(value ORDER BY value->>'customization_id'),'[]') INTO normalized FROM jsonb_array_elements(extras);
 IF p_preferences IS NULL OR jsonb_typeof(p_preferences)<>'object' THEN RAISE EXCEPTION 'Invalid preparation preferences'; END IF;
 IF coalesce(p_preferences->>'spiceLevel','Regular') NOT IN ('Regular','Less Spicy') OR coalesce(p_preferences->>'oilLevel','Standard') NOT IN ('Standard','Less Oil (Fit)') THEN RAISE EXCEPTION 'Invalid preparation preference'; END IF;
 IF length(coalesce(p_notes,''))>1000 THEN RAISE EXCEPTION 'Notes must be at most 1000 characters'; END IF;
 payload := jsonb_build_object('date',p_order_date,'type',p_meal_type,'slot',p_delivery_slot_id,'address',p_address_id,'meal',p_meal_id,'quantity',p_quantity,'addons',normalized,'notes',nullif(btrim(p_notes),''),'preferences',p_preferences);
 PERFORM pg_advisory_xact_lock(hashtextextended(u::text||p_idempotency_key::text,0));
 SELECT * INTO existing FROM public.orders WHERE user_id=u AND idempotency_key=p_idempotency_key;
 IF FOUND THEN
   IF existing.request_payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'This request key belongs to different order details'; END IF;
   RETURN private.order_document(existing.id);
 END IF;
 SELECT * INTO s FROM public.delivery_slots WHERE id=p_delivery_slot_id FOR UPDATE;
 IF NOT FOUND OR NOT s.is_active OR s.meal_type IS DISTINCT FROM p_meal_type THEN RAISE EXCEPTION 'Choose an active delivery slot for this meal'; END IF;
 -- clock_timestamp is evaluated after lock waits, not at transaction start.
 PERFORM private.assert_order_window(p_order_date,p_meal_type,clock_timestamp());
 SELECT * INTO m FROM public.meals WHERE id=p_meal_id FOR SHARE;
 IF NOT FOUND OR NOT m.is_active OR m.meal_type NOT IN (p_meal_type,'both') THEN RAISE EXCEPTION 'This meal is unavailable'; END IF;
 SELECT * INTO md FROM public.menu_days WHERE menu_date=p_order_date FOR SHARE;
 IF NOT FOUND OR NOT md.is_published THEN RAISE EXCEPTION 'The menu for this day has not been published'; END IF;
 SELECT * INTO mi FROM public.menu_items WHERE menu_day_id=md.id AND meal_id=m.id FOR SHARE;
 IF NOT FOUND OR NOT mi.availability THEN RAISE EXCEPTION 'This meal is not available in the selected menu'; END IF;
 SELECT coalesce(sum(i.quantity),0) INTO booked FROM public.orders o JOIN public.order_items i ON i.order_id=o.id
 WHERE o.delivery_slot_id=s.id AND o.order_date=p_order_date AND o.status<>'cancelled';
 IF booked+p_quantity>s.max_orders THEN RAISE EXCEPTION 'This delivery slot has insufficient remaining portions'; END IF;
 SELECT * INTO a FROM public.addresses WHERE id=p_address_id AND user_id=u FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Choose a saved address belonging to your account'; END IF;
 SELECT * INTO z FROM public.delivery_zones WHERE id=private.resolve_delivery_zone(a.pincode,a.area,a.sector) AND is_active FOR SHARE;
 IF NOT FOUND OR NOT a.is_serviceable OR z.id IS DISTINCT FROM a.zone_id THEN RAISE EXCEPTION 'This address is outside current delivery coverage'; END IF;
 fee := CASE WHEN z.is_free_delivery THEN 0 ELSE z.delivery_fee END;
 subtotal := m.base_price*p_quantity;
 FOR e IN SELECT value FROM jsonb_array_elements(normalized) LOOP
   SELECT * INTO c FROM public.meal_customizations WHERE id=(e->>'customization_id')::uuid FOR SHARE;
   IF NOT FOUND OR NOT c.is_active OR (c.meal_id IS NOT NULL AND c.meal_id<>m.id) THEN RAISE EXCEPTION 'An add-on is unavailable for this meal'; END IF;
   addons := addons+c.price*(e->>'quantity')::int;
 END LOOP;
 IF subtotal+addons<z.min_order_amount THEN RAISE EXCEPTION 'Minimum order amount for this zone is %',z.min_order_amount; END IF;
 preferences := jsonb_build_object('spiceLevel',coalesce(p_preferences->>'spiceLevel','Regular'),'oilLevel',coalesce(p_preferences->>'oilLevel','Standard'),'dietType',m.diet_type);
 snapshot := to_jsonb(a) || jsonb_build_object('zoneId',z.id,'deliveryFee',fee,'slotLabel',s.start_time::text||' – '||s.end_time::text,'capturedAt',clock_timestamp());
 INSERT INTO public.orders(id,user_id,address_id,order_number,idempotency_key,request_payload,order_date,meal_type,delivery_slot_id,status,subtotal,customization_total,delivery_fee,discount,grand_total,payment_status,notes,address_snapshot)
 VALUES(oid,u,a.id,'TEF-'||to_char(p_order_date,'YYYYMMDD')||'-'||replace(oid::text,'-',''),p_idempotency_key,payload,p_order_date,p_meal_type,s.id,'confirmed',subtotal,addons,fee,0,subtotal+addons+fee,'pending',nullif(btrim(p_notes),''),snapshot);
 INSERT INTO public.order_items(order_id,meal_id,meal_name_snapshot,preparation_preferences,quantity,unit_price,line_total)
 VALUES(oid,m.id,m.name,preferences,p_quantity,m.base_price,subtotal) RETURNING id INTO iid;
 FOR e IN SELECT value FROM jsonb_array_elements(normalized) LOOP
   SELECT * INTO c FROM public.meal_customizations WHERE id=(e->>'customization_id')::uuid;
   INSERT INTO public.order_customizations(order_item_id,customization_id,customization_name_snapshot,quantity,unit_price,line_total)
   VALUES(iid,c.id,c.name,(e->>'quantity')::int,c.price,c.price*(e->>'quantity')::int);
 END LOOP;
 RETURN private.order_document(oid);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_customer_order(p_order_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE o public.orders%ROWTYPE; sid UUID;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 SELECT delivery_slot_id INTO sid FROM public.orders WHERE id=p_order_id AND user_id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
 PERFORM 1 FROM public.delivery_slots WHERE id=sid FOR UPDATE;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id AND user_id=auth.uid() FOR UPDATE;
 IF o.status='cancelled' THEN RETURN private.order_document(o.id); END IF;
 IF o.status<>'confirmed' OR o.payment_status<>'pending' THEN RAISE EXCEPTION 'This order can no longer be cancelled online'; END IF;
 PERFORM private.assert_order_window(o.order_date,o.meal_type,clock_timestamp());
 UPDATE public.orders SET status='cancelled' WHERE id=o.id;
 RETURN private.order_document(o.id);
END;
$$;

-- Expose only aggregate occupancy; no customer records are returned by this RPC.
CREATE OR REPLACE FUNCTION public.get_delivery_slot_availability(p_order_date DATE,p_meal_type TEXT)
RETURNS TABLE(id UUID,name TEXT,meal_type TEXT,start_time TIME,end_time TIME,max_orders INT,booked_portions BIGINT,cutoff_time TIME,is_active BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT s.id,s.name,s.meal_type,s.start_time,s.end_time,s.max_orders,
 coalesce((SELECT sum(i.quantity) FROM public.orders o JOIN public.order_items i ON i.order_id=o.id WHERE o.delivery_slot_id=s.id AND o.order_date=p_order_date AND o.status<>'cancelled'),0),s.cutoff_time,s.is_active
 FROM public.delivery_slots s WHERE s.is_active AND s.meal_type=p_meal_type;
$$;
REVOKE ALL ON FUNCTION public.place_order_secure(DATE,TEXT,UUID,UUID,UUID,INT,JSONB,TEXT,UUID,JSONB), public.cancel_customer_order(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order_secure(DATE,TEXT,UUID,UUID,UUID,INT,JSONB,TEXT,UUID,JSONB), public.cancel_customer_order(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.get_delivery_slot_availability(DATE,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_delivery_slot_availability(DATE,TEXT) TO anon,authenticated;
REVOKE ALL ON FUNCTION private.assert_order_window(DATE,TEXT,TIMESTAMPTZ),private.order_document(UUID) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.orders,public.order_items,public.order_customizations,public.meals,public.menu_days,public.menu_items,public.meal_customizations,public.delivery_slots FROM anon,authenticated;
GRANT SELECT ON public.orders,public.order_items,public.order_customizations TO authenticated;
GRANT SELECT ON public.meals,public.menu_days,public.menu_items,public.meal_customizations,public.delivery_slots TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.meals,public.menu_days,public.menu_items,public.meal_customizations,public.delivery_slots TO authenticated;

-- ==============================================================================
-- 13. SEED INITIAL DATA FOR GANDHINAGAR KITCHEN (DEVELOPMENT SEED)
-- ==============================================================================

-- 13.1 Delivery Slots
-- MVP Business Cutoffs: Lunch = 10:30:00 IST, Dinner = 17:30:00 IST across all batches
INSERT INTO public.delivery_slots (seed_key, name, meal_type, start_time, end_time, max_orders, cutoff_time)
VALUES
  ('lunch-1', 'Lunch Slot 1 (Early Batch - Campuses & Tech)', 'lunch', '12:00:00', '12:45:00', 200, '10:30:00'),
  ('lunch-2', 'Lunch Slot 2 (Prime Batch - Sectors 1–30 & GIFT)', 'lunch', '12:45:00', '13:30:00', 250, '10:30:00'),
  ('dinner-1', 'Dinner Slot 1 (Early Evening Batch)', 'dinner', '19:30:00', '20:15:00', 200, '17:30:00'),
  ('dinner-2', 'Dinner Slot 2 (Night Batch - Tech Workers & Students)', 'dinner', '20:15:00', '21:00:00', 250, '17:30:00')
ON CONFLICT (seed_key) DO NOTHING;

-- 13.2 Standard Meal Customizations
INSERT INTO public.meal_customizations (seed_key, name, description, price, is_active)
VALUES
  ('roti-2', 'Extra Phulka Roti (Set of 2)', 'Freshly rolled 100% whole wheat tawa rotis lightly brushed with pure A2 cow ghee', 15.00, true),
  ('sabji', 'Extra Sabji Portion (150ml)', 'Freshly prepared seasonal green vegetable or paneer sabji with cold-pressed groundnut oil', 35.00, true),
  ('dal', 'Extra Dal / Kadhi (150ml)', 'Traditional slow-simmered Gujarati Tuver Dal or sweet-sour Gujarati Kadhi', 25.00, true),
  ('chaas', 'Chilled Masala Chaas (200ml)', 'Fresh daily probiotic buttermilk infused with roasted cumin, rock salt, and mint', 15.00, true),
  ('sweet', 'Sweet of the Day', 'Traditional artisanal Gujarati sweet (Sukhadi / Mohanthal / Shrikhand)', 30.00, true),
  ('salad', 'Fresh Green Salad & Lemon Bowl', 'Crisp cucumber, tomato, carrot, beetroot with fresh lemon wedge and green chilli', 20.00, true)
ON CONFLICT (seed_key) DO NOTHING;

-- 13.3 Core Meals Catalog
INSERT INTO public.meals (seed_key, name, description, meal_type, diet_type, base_price, is_active)
VALUES
  (
    'executive-lunch', 'Gandhinagar Executive Thali (Lunch)',
    'Balanced home-style Gujarati lunch: 4 Phulka Rotis, 1 Dry Sabji (Bhindi / Tindora), 1 Gravy Sabji (Sev Tameta / Paneer), Gujarati Tuver Dal, Steamed Rice, Kachumber Salad, and Masala Chaas.',
    'lunch',
    'standard_gujarati',
    119.00,
    true
  ),
  (
    'khichdi-dinner', 'Light Evening Khichdi & Kadhi Bowl (Dinner)',
    'Comforting night dinner: Slow-cooked Moong Dal Khichdi with pure cow ghee, traditional Gujarati Kadhi, Bataka Nu Shaak, Papad, and Pickle.',
    'dinner',
    'standard_gujarati',
    109.00,
    true
  ),
  (
    'jain-lunch', 'Jain Satvik Executive Thali',
    'Strictly Jain lunch: No onion, garlic, or root vegetables. 4 Tawa Phulkas, Dudhi Chana Dal Sabji, Paneer Makhani (Jain), Jain Dal, Rice, and Sweet Curd.',
    'lunch',
    'jain_satvik',
    119.00,
    true
  ),
  (
    'kathiyawadi-dinner', 'Kathiyawadi Desi Thali (Dinner)',
    'Hearty rustic meal: 2 Ringna No Olo, 2 Bajra Rotla with pure white butter (Makhan), Desi Jaggery, Garlic Chutney, and Chaas.',
    'dinner',
    'kathiyawadi',
    129.00,
    true
  ),
  (
    'fit-lunch', 'Low-Oil Fit Pro Thali',
    'High-protein, cold-pressed controlled preparation: 3 Multigrain Rotis, Soya-Paneer Bhurji, Sprouted Moong Dal, Brown Rice, and High-Fiber Salad Bowl.',
    'lunch',
    'low_oil_fit',
    139.00,
    true
  )
ON CONFLICT (seed_key) DO NOTHING;


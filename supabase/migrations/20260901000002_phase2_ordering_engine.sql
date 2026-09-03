-- ==============================================================================
-- TEFFEIN — PHASE 2 DATABASE MIGRATION: ORDERING ENGINE & MENU SYSTEM
-- Brand: TEFFEIN ("Roz ka khana. Sahi khana.")
-- Gandhinagar Home-Style Meal Ordering Platform
-- ==============================================================================

-- 1. MEALS TABLE
-- Base meal catalog items supporting lunch, dinner, and future meal formats
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  meal_type TEXT NOT NULL DEFAULT 'lunch' CHECK (meal_type IN ('lunch', 'dinner', 'both', 'breakfast', 'snack')),
  diet_type TEXT DEFAULT 'standard_gujarati' CHECK (diet_type IN ('standard_gujarati', 'jain_satvik', 'kathiyawadi', 'low_oil_fit', 'north_indian')),
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 89.00 CHECK (base_price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. MENU DAYS TABLE
-- Single menu calendar representation corresponding to specific dates
CREATE TABLE IF NOT EXISTS public.menu_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date DATE NOT NULL UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. MENU ITEMS TABLE
-- Links specific meals to a menu date with availability and display sequencing
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_day_id UUID NOT NULL REFERENCES public.menu_days(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE RESTRICT,
  availability BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT menu_items_day_meal_unique UNIQUE (menu_day_id, meal_id)
);

-- 4. MEAL CUSTOMIZATIONS TABLE
-- Add-ons and dish customizations (Extra Roti, Extra Sabzi, Extra Dal, Chaas, Sweet)
-- Price is database-authoritative (never hardcoded in client components)
CREATE TABLE IF NOT EXISTS public.meal_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE, -- NULL indicates universal add-on
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. DELIVERY SLOTS TABLE
-- Meal delivery timing windows for Gandhinagar clusters (Lunch & Dinner)
CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER NOT NULL DEFAULT 150, -- Semantics: Maximum meal portion / thali capacity for this delivery window batch
  cutoff_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON COLUMN public.delivery_slots.max_orders IS 'Maximum meal portion / thali capacity for this slot batch (used for portion capacity enforcement).';

-- 6. ORDERS TABLE
-- High-integrity order header storing exact snapshot of delivery address & calculations
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ORDER ITEMS TABLE
-- Line items capturing exact meal name snapshot and unit price at time of order
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  meal_name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
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
CREATE OR REPLACE FUNCTION public.place_order_secure(
  p_order_date DATE,
  p_meal_type TEXT,
  p_delivery_slot_id UUID,
  p_address_id UUID,
  p_meal_id UUID,
  p_quantity INT,
  p_customizations JSONB DEFAULT '[]'::jsonb,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_meal RECORD;
  v_menu_day RECORD;
  v_menu_item RECORD;
  v_slot RECORD;
  v_address RECORD;
  v_zone RECORD;
  v_delivery_fee NUMERIC(10,2) := 0.00;
  v_subtotal NUMERIC(10,2) := 0.00;
  v_customization_total NUMERIC(10,2) := 0.00;
  v_discount NUMERIC(10,2) := 0.00;
  v_grand_total NUMERIC(10,2) := 0.00;
  v_order_number TEXT;
  v_order_id UUID;
  v_order_item_id UUID;
  v_address_snapshot JSONB;
  v_cust_item JSONB;
  v_cust_id UUID;
  v_cust_qty INT;
  v_cust RECORD;
  v_cust_line_total NUMERIC(10,2);
  v_current_time_ist TIME;
  v_slot_booked_qty INT := 0;
BEGIN
  -- 1. Validate Authenticated User
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.';
  END IF;

  -- 2. Validate Quantity
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 20 THEN
    RAISE EXCEPTION 'Order quantity must be between 1 and 20 meals.';
  END IF;

  -- 3. Validate Meal
  SELECT id, name, description, meal_type, base_price, is_active
  INTO v_meal
  FROM public.meals
  WHERE id = p_meal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected meal does not exist.';
  END IF;

  IF NOT v_meal.is_active THEN
    RAISE EXCEPTION 'Selected meal is currently inactive or discontinued.';
  END IF;

  IF v_meal.meal_type <> 'both' AND v_meal.meal_type <> p_meal_type THEN
    RAISE EXCEPTION 'Selected meal is not available for % slot.', p_meal_type;
  END IF;

  -- 4. Validate Menu Day & Item Availability (if a published day menu exists)
  SELECT id, menu_date, is_published
  INTO v_menu_day
  FROM public.menu_days
  WHERE menu_date = p_order_date;

  IF FOUND THEN
    IF NOT v_menu_day.is_published THEN
      RAISE EXCEPTION 'The menu for % has not been published yet.', p_order_date;
    END IF;

    SELECT id, availability
    INTO v_menu_item
    FROM public.menu_items
    WHERE menu_day_id = v_menu_day.id AND meal_id = p_meal_id;

    IF FOUND AND NOT v_menu_item.availability THEN
      RAISE EXCEPTION 'Selected meal is marked sold out for %.', p_order_date;
    END IF;
  END IF;

  -- 5. Validate Delivery Slot & Cutoff Time (with Concurrency Row Lock)
  SELECT id, name, meal_type, start_time, end_time, cutoff_time, max_orders, is_active
  INTO v_slot
  FROM public.delivery_slots
  WHERE id = p_delivery_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected delivery slot does not exist.';
  END IF;

  IF NOT v_slot.is_active THEN
    RAISE EXCEPTION 'Selected delivery slot is currently inactive.';
  END IF;

  IF v_slot.meal_type <> p_meal_type THEN
    RAISE EXCEPTION 'Delivery slot meal type does not match requested meal type.';
  END IF;

  -- Concurrency-safe capacity verification
  IF v_slot.max_orders IS NOT NULL THEN
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_slot_booked_qty
    FROM public.orders
    WHERE delivery_slot_id = p_delivery_slot_id
      AND order_date = p_order_date
      AND status NOT IN ('cancelled');

    IF (v_slot_booked_qty + p_quantity) > v_slot.max_orders THEN
      RAISE EXCEPTION 'Selected delivery slot is at maximum capacity (% / % booked). Please select another delivery window.', v_slot_booked_qty, v_slot.max_orders;
    END IF;
  END IF;

  -- Check cutoff time if ordering for today in IST (Indian Standard Time = UTC+05:30)
  IF p_order_date = (timezone('Asia/Kolkata', now()))::date AND v_slot.cutoff_time IS NOT NULL THEN
    v_current_time_ist := (timezone('Asia/Kolkata', now()))::time;
    IF v_current_time_ist > v_slot.cutoff_time THEN
      RAISE EXCEPTION 'Operational cutoff has passed for this slot today (Cutoff: %). Please choose tomorrow or next available slot.', v_slot.cutoff_time;
    END IF;
  END IF;

  -- 6. Validate Delivery Address Ownership & Serviceability
  SELECT *
  INTO v_address
  FROM public.addresses
  WHERE id = p_address_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery address not found or does not belong to your account.';
  END IF;

  -- Calculate delivery fee from authoritative delivery_zones table and verify zone serviceability
  IF v_address.zone_id IS NOT NULL THEN
    SELECT delivery_fee, is_active, is_serviceable
    INTO v_zone
    FROM public.delivery_zones
    WHERE id = v_address.zone_id;

    IF NOT FOUND OR NOT v_zone.is_active OR NOT v_zone.is_serviceable THEN
      RAISE EXCEPTION 'Delivery address is located in an unserviceable or inactive delivery zone.';
    END IF;

    v_delivery_fee := v_zone.delivery_fee;
  ELSE
    -- Verify baseline Gandhinagar serviceability
    IF (v_address.city NOT ILIKE '%Gandhinagar%' AND v_address.city NOT ILIKE '%GIFT City%') AND v_address.pincode NOT LIKE '382%' THEN
      RAISE EXCEPTION 'Delivery is currently available only across Gandhinagar and GIFT City delivery clusters.';
    END IF;
  END IF;

  -- Build immutable Address Snapshot (JSONB)
  v_address_snapshot := jsonb_build_object(
    'addressId', v_address.id,
    'label', v_address.label,
    'customLabel', v_address.custom_label,
    'recipientName', v_address.recipient_name,
    'recipientPhone', v_address.recipient_phone,
    'houseNumber', COALESCE(v_address.house_flat_number, ''),
    'building', COALESCE(v_address.building_name, ''),
    'floor', COALESCE(v_address.floor, ''),
    'street', COALESCE(v_address.street, ''),
    'landmark', COALESCE(v_address.landmark, ''),
    'area', v_address.area,
    'sector', COALESCE(v_address.sector, v_address.area),
    'city', v_address.city,
    'state', v_address.state,
    'pincode', v_address.pincode,
    'latitude', v_address.latitude,
    'longitude', v_address.longitude,
    'gpsAccuracy', v_address.gps_accuracy,
    'formattedAddress', COALESCE(v_address.formatted_address, v_address.area || ', ' || v_address.city),
    'deliveryInstructions', COALESCE(v_address.delivery_instructions, ''),
    'instructionPreset', COALESCE(v_address.instruction_preset, 'call_on_reach'),
    'zoneId', COALESCE(v_address.zone_id, 'zone_a_core'),
    'clusterId', COALESCE(v_address.cluster_id, 'cluster-a'),
    'capturedAt', timezone('utc'::text, now())
  );

  -- 7. Authoritative Pricing Calculation
  v_subtotal := v_meal.base_price * p_quantity;

  -- 8. Generate Unique Order Number
  v_order_number := 'TEF-' || to_char(p_order_date, 'YYYYMMDD') || '-' || lpad((floor(random() * 9000 + 1000))::text, 4, '0');

  -- 9. Insert Order Record
  INSERT INTO public.orders (
    user_id,
    address_id,
    order_number,
    order_date,
    meal_type,
    delivery_slot_id,
    status,
    subtotal,
    customization_total,
    delivery_fee,
    discount,
    grand_total,
    payment_status,
    notes,
    address_snapshot
  )
  VALUES (
    v_user_id,
    v_address.id,
    v_order_number,
    p_order_date,
    p_meal_type,
    p_delivery_slot_id,
    'confirmed',
    v_subtotal,
    0.00,
    v_delivery_fee,
    0.00,
    v_subtotal + v_delivery_fee,
    'pending',
    p_notes,
    v_address_snapshot
  )
  RETURNING id INTO v_order_id;

  -- 10. Insert Order Item (with historical snapshot name & unit price)
  INSERT INTO public.order_items (
    order_id,
    meal_id,
    meal_name_snapshot,
    quantity,
    unit_price,
    line_total
  )
  VALUES (
    v_order_id,
    v_meal.id,
    v_meal.name,
    p_quantity,
    v_meal.base_price,
    v_subtotal
  )
  RETURNING id INTO v_order_item_id;

  -- 11. Process Customizations (if provided)
  IF p_customizations IS NOT NULL AND jsonb_array_length(p_customizations) > 0 THEN
    FOR v_cust_item IN SELECT * FROM jsonb_array_elements(p_customizations)
    LOOP
      v_cust_id := (v_cust_item->>'customization_id')::UUID;
      v_cust_qty := COALESCE((v_cust_item->>'quantity')::INT, 1);

      IF v_cust_id IS NOT NULL AND v_cust_qty > 0 THEN
        SELECT id, name, price, is_active
        INTO v_cust
        FROM public.meal_customizations
        WHERE id = v_cust_id;

        IF FOUND AND v_cust.is_active THEN
          v_cust_line_total := v_cust.price * v_cust_qty;
          v_customization_total := v_customization_total + v_cust_line_total;

          INSERT INTO public.order_customizations (
            order_item_id,
            customization_id,
            customization_name_snapshot,
            quantity,
            unit_price,
            line_total
          )
          VALUES (
            v_order_item_id,
            v_cust.id,
            v_cust.name,
            v_cust_qty,
            v_cust.price,
            v_cust_line_total
          );
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- 12. Finalize Grand Total on Order Record
  v_grand_total := v_subtotal + v_customization_total + v_delivery_fee - v_discount;

  UPDATE public.orders
  SET 
    customization_total = v_customization_total,
    grand_total = v_grand_total,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_order_id;

  -- 13. Return Secure Order Confirmation Object
  RETURN jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'orderDate', p_order_date,
    'mealType', p_meal_type,
    'mealName', v_meal.name,
    'quantity', p_quantity,
    'unitPrice', v_meal.base_price,
    'subtotal', v_subtotal,
    'customizationTotal', v_customization_total,
    'deliveryFee', v_delivery_fee,
    'grandTotal', v_grand_total,
    'status', 'confirmed',
    'addressSnapshot', v_address_snapshot
  );
END;
$$;

-- Explicitly harden execution privileges:
-- Disallow public and anon execution, allow only authenticated users.
-- The function internally validates auth.uid() as well.
REVOKE ALL ON FUNCTION public.place_order_secure(DATE, TEXT, UUID, UUID, UUID, INT, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_order_secure(DATE, TEXT, UUID, UUID, UUID, INT, JSONB, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.place_order_secure(DATE, TEXT, UUID, UUID, UUID, INT, JSONB, TEXT) TO authenticated;

-- ==============================================================================
-- 13. SEED INITIAL DATA FOR GANDHINAGAR KITCHEN (DEVELOPMENT SEED)
-- ==============================================================================

-- 13.1 Delivery Slots
-- MVP Business Cutoffs: Lunch = 10:30:00 IST, Dinner = 17:30:00 IST across all batches
INSERT INTO public.delivery_slots (name, meal_type, start_time, end_time, max_orders, cutoff_time)
VALUES
  ('Lunch Slot 1 (Early Batch - Campuses & Tech)', 'lunch', '12:00:00', '12:45:00', 200, '10:30:00'),
  ('Lunch Slot 2 (Prime Batch - Sectors 1–30 & GIFT)', 'lunch', '12:45:00', '13:30:00', 250, '10:30:00'),
  ('Dinner Slot 1 (Early Evening Batch)', 'dinner', '19:30:00', '20:15:00', 200, '17:30:00'),
  ('Dinner Slot 2 (Night Batch - Tech Workers & Students)', 'dinner', '20:15:00', '21:00:00', 250, '17:30:00')
ON CONFLICT DO NOTHING;

-- 13.2 Standard Meal Customizations
INSERT INTO public.meal_customizations (name, description, price, is_active)
VALUES
  ('Extra Phulka Roti (Set of 2)', 'Freshly rolled 100% whole wheat tawa rotis lightly brushed with pure A2 cow ghee', 15.00, true),
  ('Extra Sabji Portion (150ml)', 'Freshly prepared seasonal green vegetable or paneer sabji with cold-pressed groundnut oil', 35.00, true),
  ('Extra Dal / Kadhi (150ml)', 'Traditional slow-simmered Gujarati Tuver Dal or sweet-sour Gujarati Kadhi', 25.00, true),
  ('Chilled Masala Chaas (200ml)', 'Fresh daily probiotic buttermilk infused with roasted cumin, rock salt, and mint', 15.00, true),
  ('Sweet of the Day', 'Traditional artisanal Gujarati sweet (Sukhadi / Mohanthal / Shrikhand)', 30.00, true),
  ('Fresh Green Salad & Lemon Bowl', 'Crisp cucumber, tomato, carrot, beetroot with fresh lemon wedge and green chilli', 20.00, true)
ON CONFLICT DO NOTHING;

-- 13.3 Core Meals Catalog
INSERT INTO public.meals (name, description, meal_type, diet_type, base_price, is_active)
VALUES
  (
    'Gandhinagar Executive Thali (Lunch)',
    'Balanced home-style Gujarati lunch: 4 Phulka Rotis, 1 Dry Sabji (Bhindi / Tindora), 1 Gravy Sabji (Sev Tameta / Paneer), Gujarati Tuver Dal, Steamed Rice, Kachumber Salad, and Masala Chaas.',
    'lunch',
    'standard_gujarati',
    119.00,
    true
  ),
  (
    'Light Evening Khichdi & Kadhi Bowl (Dinner)',
    'Comforting night dinner: Slow-cooked Moong Dal Khichdi with pure cow ghee, traditional Gujarati Kadhi, Bataka Nu Shaak, Papad, and Pickle.',
    'dinner',
    'standard_gujarati',
    109.00,
    true
  ),
  (
    'Jain Satvik Executive Thali',
    'Strictly Jain lunch: No onion, garlic, or root vegetables. 4 Tawa Phulkas, Dudhi Chana Dal Sabji, Paneer Makhani (Jain), Jain Dal, Rice, and Sweet Curd.',
    'lunch',
    'jain_satvik',
    119.00,
    true
  ),
  (
    'Kathiyawadi Desi Thali (Dinner)',
    'Hearty rustic meal: 2 Ringna No Olo, 2 Bajra Rotla with pure white butter (Makhan), Desi Jaggery, Garlic Chutney, and Chaas.',
    'dinner',
    'kathiyawadi',
    129.00,
    true
  ),
  (
    'Low-Oil Fit Pro Thali',
    'High-protein, cold-pressed controlled preparation: 3 Multigrain Rotis, Soya-Paneer Bhurji, Sprouted Moong Dal, Brown Rice, and High-Fiber Salad Bowl.',
    'lunch',
    'low_oil_fit',
    139.00,
    true
  )
ON CONFLICT DO NOTHING;


-- P0 security hardening: prevent role probing and make RLS evaluation explicit.

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT check_user_id IS NOT NULL
    AND check_user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = check_user_id AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;

-- Phase 1 ownership and administration policies.
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
CREATE POLICY "Users can view their own profile or admins can view all" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can update their own profile or admins can update" ON public.profiles;
CREATE POLICY "Users can update their own profile or admins can update" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin((SELECT auth.uid())))
  WITH CHECK ((SELECT auth.uid()) = id OR public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view their own roles or admins can view all" ON public.user_roles;
CREATE POLICY "Users can view their own roles or admins can view all" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
CREATE POLICY "Only admins can insert user roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update user roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete user roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Delivery zones are viewable by everyone" ON public.delivery_zones;
CREATE POLICY "Delivery zones are viewable by everyone" ON public.delivery_zones
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage delivery zones" ON public.delivery_zones;
CREATE POLICY "Only admins can insert delivery zones" ON public.delivery_zones
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update delivery zones" ON public.delivery_zones
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete delivery zones" ON public.delivery_zones
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view their own addresses or admins can view all" ON public.addresses;
CREATE POLICY "Users can view their own addresses or admins can view all" ON public.addresses
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own addresses or admins can update" ON public.addresses;
CREATE POLICY "Users can update their own addresses or admins can update" ON public.addresses
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin((SELECT auth.uid())))
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Anyone can join the area waitlist" ON public.area_waitlist;
CREATE POLICY "Anyone can join the area waitlist" ON public.area_waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins can view area waitlist entries" ON public.area_waitlist;
CREATE POLICY "Only admins can view area waitlist entries" ON public.area_waitlist
  FOR SELECT TO authenticated USING (public.is_admin((SELECT auth.uid())));

-- Phase 2 public catalog reads and admin-only writes.
DROP POLICY IF EXISTS "Active meals are viewable by everyone" ON public.meals;
CREATE POLICY "Active meals are viewable by everyone" ON public.meals
  FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can manage meals" ON public.meals;
CREATE POLICY "Only admins can insert meals" ON public.meals
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update meals" ON public.meals
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete meals" ON public.meals
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Published menu days are viewable by everyone" ON public.menu_days;
CREATE POLICY "Published menu days are viewable by everyone" ON public.menu_days
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can manage menu days" ON public.menu_days;
CREATE POLICY "Only admins can insert menu days" ON public.menu_days
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update menu days" ON public.menu_days
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete menu days" ON public.menu_days
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Published menu items are viewable by everyone or admins can view all" ON public.menu_items;
CREATE POLICY "Published menu items are viewable by everyone or admins can view all" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.menu_days md
    WHERE md.id = menu_day_id
      AND (md.is_published OR public.is_admin((SELECT auth.uid())))
  ));
DROP POLICY IF EXISTS "Only admins can manage menu items" ON public.menu_items;
CREATE POLICY "Only admins can insert menu items" ON public.menu_items
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update menu items" ON public.menu_items
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete menu items" ON public.menu_items
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Active meal customizations are viewable by everyone" ON public.meal_customizations;
CREATE POLICY "Active meal customizations are viewable by everyone" ON public.meal_customizations
  FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can manage meal customizations" ON public.meal_customizations;
CREATE POLICY "Only admins can insert meal customizations" ON public.meal_customizations
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update meal customizations" ON public.meal_customizations
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete meal customizations" ON public.meal_customizations
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Active delivery slots are viewable by everyone" ON public.delivery_slots;
CREATE POLICY "Active delivery slots are viewable by everyone" ON public.delivery_slots
  FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can manage delivery slots" ON public.delivery_slots;
CREATE POLICY "Only admins can insert delivery slots" ON public.delivery_slots
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can update delivery slots" ON public.delivery_slots
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete delivery slots" ON public.delivery_slots
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

-- Order tables remain customer-readable and server-write-only. Admin policies are
-- preserved for future management RPCs without overlapping customer SELECT rules.
DROP POLICY IF EXISTS "Users can view their own orders or admins can view all" ON public.orders;
CREATE POLICY "Users can view their own orders or admins can view all" ON public.orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can insert orders directly" ON public.orders;
CREATE POLICY "Only admins can insert orders directly" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can update orders directly" ON public.orders;
CREATE POLICY "Only admins can update orders directly" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can delete orders" ON public.orders;
CREATE POLICY "Only admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view items of their own orders or admins can view all" ON public.order_items;
CREATE POLICY "Users can view items of their own orders or admins can view all" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (o.user_id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())))
  ));
DROP POLICY IF EXISTS "Only admins can insert order items directly" ON public.order_items;
CREATE POLICY "Only admins can insert order items directly" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can update or delete order items" ON public.order_items;
CREATE POLICY "Only admins can update order items" ON public.order_items
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete order items" ON public.order_items
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can view customizations of their own order items or admins can view all" ON public.order_customizations;
CREATE POLICY "Users can view customizations of their own order items or admins can view all" ON public.order_customizations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_id
      AND (o.user_id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())))
  ));
DROP POLICY IF EXISTS "Only admins can insert order customizations directly" ON public.order_customizations;
CREATE POLICY "Only admins can insert order customizations directly" ON public.order_customizations
  FOR INSERT TO authenticated WITH CHECK (public.is_admin((SELECT auth.uid())));
DROP POLICY IF EXISTS "Only admins can update or delete order customizations" ON public.order_customizations;
CREATE POLICY "Only admins can update order customizations" ON public.order_customizations
  FOR UPDATE TO authenticated
  USING (public.is_admin((SELECT auth.uid()))) WITH CHECK (public.is_admin((SELECT auth.uid())));
CREATE POLICY "Only admins can delete order customizations" ON public.order_customizations
  FOR DELETE TO authenticated USING (public.is_admin((SELECT auth.uid())));

CREATE INDEX IF NOT EXISTS kitchen_menu_events_actor_id_idx
  ON private.kitchen_menu_events(actor_id);


import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { DeliveryAddress, CustomerAddress } from '../types';
import { SingleMealCustomization } from './orderCustomizationEngine';

export interface CreateOrderPayload {
  userId: string;
  address: DeliveryAddress | CustomerAddress;
  orderDate: string; // YYYY-MM-DD
  mealType: 'lunch' | 'dinner';
  deliverySlotId?: string;
  deliverySlotName: string;
  mealName: string;
  mealId?: string;
  quantity: number;
  basePricePerMeal: number;
  mealCustomizations: SingleMealCustomization[];
  selectedAddons?: { [id: string]: number };
  addonCatalog?: Array<{ id: string; name: string; price: number }>;
  deliveryFee: number;
  notes?: string;
  paymentMethod: string;
}

const LOCAL_ORDERS_KEY = 'teffein_saved_customer_orders';

export const orderService = {
  /**
   * Generates a unique, human-friendly order identifier (e.g. TEF-20260902-8492)
   */
  generateOrderNumber(dateStr: string): string {
    const cleanDate = dateStr.replace(/[^0-9]/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TEF-${cleanDate || '20260902'}-${rand}`;
  },

  /**
   * Places a complete order with Address Snapshot, Item Snapshot, and Customization Snapshot
   */
  async createOrder(payload: CreateOrderPayload): Promise<{ order: any | null; error: Error | null }> {
    const orderNumber = this.generateOrderNumber(payload.orderDate);
    const subtotal = payload.basePricePerMeal * payload.quantity;

    // Calculate customization total accurately using SingleMealCustomization schema
    let customizationTotal = 0;
    payload.mealCustomizations.forEach((c) => {
      const extraRotis = Math.max(0, (c.rotiCount || 4) - 4);
      customizationTotal += extraRotis * 7.5; // Rs. 15 for pair of 2
      if (c.sabjiPortion === 'extra') customizationTotal += 35;
      if (c.dalPortion === 'extra') customizationTotal += 25;
      if (c.extraSalad) customizationTotal += 20;
      if (c.hasChaas) customizationTotal += 15;
    });

    if (payload.selectedAddons && payload.addonCatalog) {
      Object.entries(payload.selectedAddons).forEach(([addonId, qty]) => {
        const found = payload.addonCatalog?.find(a => a.id === addonId);
        if (found && qty > 0) {
          customizationTotal += found.price * qty;
        }
      });
    }

    const grandTotal = subtotal + customizationTotal + payload.deliveryFee;

    const addr = payload.address as any;

    // Construct immutable Address Snapshot
    const addressSnapshot = {
      addressId: addr.id,
      label: addr.label,
      recipientName: addr.fullName || addr.name || 'Valued Customer',
      recipientPhone: addr.phone || '',
      houseNumber: addr.houseNumber || addr.house_flat_number || '',
      building: addr.building || addr.building_name || '',
      floor: addr.floor || '',
      street: addr.street || '',
      landmark: addr.landmark || '',
      area: addr.area || 'Gandhinagar',
      sector: addr.sector || addr.area || 'Gandhinagar',
      city: addr.city || 'Gandhinagar',
      state: addr.state || 'Gujarat',
      pincode: addr.pincode || '382010',
      latitude: addr.latitude || null,
      longitude: addr.longitude || null,
      gpsAccuracy: addr.accuracy || null,
      formattedAddress: addr.addressLine1 || addr.addressLine || `${addr.area}, ${addr.city || 'Gandhinagar'}`,
      deliveryInstructions: addr.instructions || addr.delivery_instructions || '',
      instructionPreset: addr.instructionPreset || 'call_on_reach',
      zoneId: addr.zoneId || 'zone_a_core',
      clusterId: addr.clusterId || 'cluster-a',
      capturedAt: new Date().toISOString()
    };

    // If Supabase is not configured or in offline demo fallback
    if (!isSupabaseConfigured() || !payload.userId) {
      const mockOrder: any = {
        id: `ord-${Date.now()}`,
        user_id: payload.userId || 'guest-user',
        order_number: orderNumber,
        order_date: payload.orderDate,
        meal_type: payload.mealType,
        delivery_slot_id: payload.deliverySlotId || null,
        status: 'confirmed',
        subtotal,
        customization_total: customizationTotal,
        delivery_fee: payload.deliveryFee,
        discount: 0,
        grand_total: grandTotal,
        payment_status: 'paid',
        notes: payload.notes || null,
        address_snapshot: addressSnapshot,
        created_at: new Date().toISOString(),
        items: [
          {
            id: `item-${Date.now()}`,
            meal_id: payload.mealId || null,
            meal_name_snapshot: payload.mealName,
            quantity: payload.quantity,
            unit_price: payload.basePricePerMeal,
            line_total: subtotal
          }
        ]
      };

      try {
        const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([mockOrder, ...existing]));
      } catch (e) {
        console.warn('Could not cache order to localStorage:', e);
      }

      return { order: mockOrder, error: null };
    }

    try {
      const client = getSupabaseClient();
      const isUuidAddress = addr.id && !addr.id.startsWith('addr-');
      const isUuidMeal = payload.mealId && !payload.mealId.startsWith('meal-');
      const isUuidSlot = payload.deliverySlotId && !payload.deliverySlotId.startsWith('slot-');

      // 1. Primary: Server-Authoritative Secure Order Creation via RPC
      if (isUuidAddress && isUuidMeal && isUuidSlot) {
        // Map customization items
        const customizationsPayload: any[] = [];
        if (payload.selectedAddons && payload.addonCatalog) {
          Object.entries(payload.selectedAddons).forEach(([addonId, qty]) => {
            if (qty > 0 && !addonId.startsWith('cust-')) {
              customizationsPayload.push({
                customization_id: addonId,
                quantity: qty
              });
            }
          });
        }

        const { data: rpcData, error: rpcErr } = await client.rpc('place_order_secure', {
          p_order_date: payload.orderDate,
          p_meal_type: payload.mealType,
          p_delivery_slot_id: payload.deliverySlotId!,
          p_address_id: addr.id,
          p_meal_id: payload.mealId!,
          p_quantity: payload.quantity,
          p_customizations: customizationsPayload,
          p_notes: payload.notes || null
        });

        if (rpcErr) {
          console.error('[TEFFEIN Orders] place_order_secure RPC failed:', rpcErr);
          return { order: null, error: new Error(rpcErr.message) };
        }

        const confirmedOrder = rpcData as any;
        return { order: confirmedOrder, error: null };
      }

      // 2. Direct Table Fallback (for existing development UUID records)
      const { data: orderRow, error: orderErr } = await client
        .from('orders')
        .insert({
          user_id: payload.userId,
          address_id: isUuidAddress ? addr.id : null,
          order_number: orderNumber,
          order_date: payload.orderDate,
          meal_type: payload.mealType,
          delivery_slot_id: isUuidSlot ? payload.deliverySlotId : null,
          status: 'confirmed',
          subtotal,
          customization_total: customizationTotal,
          delivery_fee: payload.deliveryFee,
          discount: 0,
          grand_total: grandTotal,
          payment_status: 'paid',
          notes: payload.notes || null,
          address_snapshot: addressSnapshot
        } as any)
        .select()
        .single();

      if (orderErr) throw orderErr;

      const createdOrder = orderRow as any;

      // Insert Order Item (with Meal Name & Price Snapshot)
      const { data: itemRow, error: itemErr } = await client
        .from('order_items')
        .insert({
          order_id: createdOrder.id,
          meal_id: isUuidMeal ? payload.mealId : null,
          meal_name_snapshot: payload.mealName,
          quantity: payload.quantity,
          unit_price: payload.basePricePerMeal,
          line_total: subtotal
        } as any)
        .select()
        .single();

      if (itemErr) {
        console.warn('[TEFFEIN Orders] Failed to insert line items, order header created:', itemErr);
      }

      const createdItem = itemRow as any;

      // Insert Customizations if any
      if (createdItem?.id) {
        const customizationInserts: any[] = [];

        payload.mealCustomizations.forEach((c) => {
          const extraRotis = Math.max(0, (c.rotiCount || 4) - 4);
          if (extraRotis > 0) {
            customizationInserts.push({
              order_item_id: createdItem.id,
              customization_id: null,
              customization_name_snapshot: `Extra Phulka Roti (${extraRotis} pcs)`,
              quantity: extraRotis,
              unit_price: 7.50,
              line_total: extraRotis * 7.50
            });
          }
          if (c.sabjiPortion === 'extra') {
            customizationInserts.push({
              order_item_id: createdItem.id,
              customization_id: null,
              customization_name_snapshot: `Extra Sabji Portion (150ml)`,
              quantity: 1,
              unit_price: 35.00,
              line_total: 35.00
            });
          }
          if (c.dalPortion === 'extra') {
            customizationInserts.push({
              order_item_id: createdItem.id,
              customization_id: null,
              customization_name_snapshot: `Extra Dal / Kadhi (150ml)`,
              quantity: 1,
              unit_price: 25.00,
              line_total: 25.00
            });
          }
          if (c.extraSalad) {
            customizationInserts.push({
              order_item_id: createdItem.id,
              customization_id: null,
              customization_name_snapshot: `Fresh Green Salad & Lemon Bowl`,
              quantity: 1,
              unit_price: 20.00,
              line_total: 20.00
            });
          }
          if (c.hasChaas) {
            customizationInserts.push({
              order_item_id: createdItem.id,
              customization_id: null,
              customization_name_snapshot: `Chilled Masala Chaas (200ml)`,
              quantity: 1,
              unit_price: 15.00,
              line_total: 15.00
            });
          }
        });

        if (customizationInserts.length > 0) {
          const { error: custErr } = await client
            .from('order_customizations')
            .insert(customizationInserts as any);
          if (custErr) {
            console.warn('[TEFFEIN Orders] Failed to insert customizations snapshot:', custErr);
          }
        }
      }

      // Also cache locally for instant client access
      try {
        const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([createdOrder, ...existing]));
      } catch (e) {
        console.warn('Could not cache order locally:', e);
      }

      return { order: createdOrder, error: null };
    } catch (err: any) {
      console.error('[TEFFEIN Orders] Order creation failed in Supabase:', err);
      return { order: null, error: err };
    }
  },

  /**
   * Fetches user's past order history
   */
  async getUserOrders(userId: string): Promise<any[]> {
    if (!isSupabaseConfigured() || !userId) {
      try {
        const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            order_customizations (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[TEFFEIN Orders] Failed to fetch orders from Supabase, returning local cache:', err);
      try {
        const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
  }
};

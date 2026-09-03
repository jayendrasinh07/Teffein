import { getSupabaseClient } from './supabaseClient';

export type KitchenStatus = 'confirmed' | 'preparing' | 'ready';
export type KitchenShift = 'lunch' | 'dinner';
export interface KitchenOrder {
  id: string;
  order_number: string;
  order_date: string;
  meal_type: KitchenShift;
  slot_label: string;
  status: KitchenStatus;
  created_at: string;
  updated_at: string;
  notes: string | null;
  items: {
    id: string;
    meal_name: string;
    quantity: number;
    preferences: { spiceLevel?: string; oilLevel?: string; dietType?: string };
    addons: { id: string; name: string; quantity: number }[];
  }[];
}

export class KitchenError extends Error {
  code: string;
  constructor(code: string) {
    super(code === '42501' ? 'Kitchen access is unavailable. Sign in with an authorized account.'
      : code === '40001' || code === 'P0002' ? 'This order has changed. Check its latest status before continuing.'
      : 'We could not confirm the latest kitchen status. Refresh before trying again.');
    this.code = code;
  }
}

// JSON RPCs are checked before anything becomes an actionable card.
export function parseKitchenOrder(value: unknown): KitchenOrder {
  const o = value as KitchenOrder;
  if (!o || typeof o.id !== 'string' || typeof o.order_number !== 'string'
    || typeof o.order_date !== 'string' || !['lunch', 'dinner'].includes(o.meal_type)
    || !['confirmed', 'preparing', 'ready'].includes(o.status)
    || typeof o.slot_label !== 'string' || typeof o.created_at !== 'string'
    || typeof o.updated_at !== 'string' || !(o.notes === null || typeof o.notes === 'string')
    || !Array.isArray(o.items) || o.items.length === 0
    || o.items.some(i => !i || typeof i.id !== 'string' || typeof i.meal_name !== 'string'
      || !Number.isInteger(i.quantity) || i.quantity < 1 || !i.preferences || typeof i.preferences !== 'object'
      || ['spiceLevel', 'oilLevel', 'dietType'].some(k => i.preferences[k] != null && typeof i.preferences[k] !== 'string')
      || !Array.isArray(i.addons) || i.addons.some(a => !a || typeof a.id !== 'string'
        || typeof a.name !== 'string' || !Number.isInteger(a.quantity) || a.quantity < 1))) {
    throw new KitchenError('INVALID_RESPONSE');
  }
  return o;
}

export const kitchenService = {
  async list(date: string, shift: KitchenShift): Promise<KitchenOrder[]> {
    const { data, error } = await getSupabaseClient().rpc('get_kitchen_orders', {
      p_order_date: date, p_meal_type: shift,
    });
    if (error) throw new KitchenError(error.code);
    if (!Array.isArray(data)) throw new KitchenError('INVALID_RESPONSE');
    const orders = data.map(parseKitchenOrder);
    if (orders.some(o => o.order_date !== date || o.meal_type !== shift)) throw new KitchenError('INVALID_RESPONSE');
    return orders;
  },
  async advance(order: KitchenOrder): Promise<KitchenOrder> {
    if (order.status === 'ready') throw new KitchenError('INVALID_TRANSITION');
    const next = order.status === 'confirmed' ? 'preparing' : 'ready';
    const { data, error } = await getSupabaseClient().rpc('update_kitchen_order_status', {
      p_order_id: order.id, p_expected_status: order.status, p_next_status: next,
    });
    if (error) throw new KitchenError(error.code);
    const result = parseKitchenOrder(data);
    if (result.id !== order.id || result.status !== next) throw new KitchenError('INVALID_RESPONSE');
    return result;
  },
};

import type { KitchenOrder } from './kitchenService';

export interface KitchenOrderAge {
  minutes: number;
  late: boolean;
  critical: boolean;
  label: string;
}

export const kitchenOrderAge = (order: KitchenOrder, now = Date.now()): KitchenOrderAge | null => {
  if (order.status === 'ready') return null;
  const startedAt = order.status === 'preparing' ? order.updated_at : order.created_at;
  const timestamp = new Date(startedAt).getTime();
  const minutes = Number.isFinite(timestamp) ? Math.max(0, Math.floor((now - timestamp) / 60_000)) : 0;
  const limit = order.status === 'confirmed' ? 10 : 20;
  return {
    minutes,
    late: minutes >= limit,
    critical: minutes >= limit + 10,
    label: `${minutes} min ${order.status === 'confirmed' ? 'waiting' : 'preparing'}`,
  };
};

export const newConfirmedOrders = (seen: ReadonlySet<string>, orders: KitchenOrder[]) =>
  orders.filter(order => order.status === 'confirmed' && !seen.has(order.id));


import { kitchenService, KitchenError, KitchenOrder, KitchenShift } from './kitchenService';

export interface KitchenQueueState {
  orders: KitchenOrder[];
  loading: boolean;
  busyId: string | null;
  error: string | null;
  notice: string | null;
  lastUpdated: Date | null;
}
export const emptyKitchenQueue = (): KitchenQueueState => ({
  orders: [], loading: true, busyId: null, error: null, notice: null, lastUpdated: null,
});

// One controller per identity/date/shift. Disposal invalidates every pending response.
export function createKitchenQueue(date: string, shift: KitchenShift,
  publish: (state: KitchenQueueState) => void, api = kitchenService) {
  let alive = true;
  let serial = 0;
  let state = emptyKitchenQueue();
  const emit = (patch: Partial<KitchenQueueState>) => {
    if (alive) { state = { ...state, ...patch }; publish(state); }
  };
  async function refresh() {
    if (!alive || state.busyId) return;
    const request = ++serial;
    emit({ loading: true });
    try {
      const orders = await api.list(date, shift);
      if (alive && request === serial) emit({ orders, loading: false, error: null, lastUpdated: new Date() });
    } catch (error) {
      if (!alive || request !== serial) return;
      const failure = error instanceof KitchenError ? error : new KitchenError('CONNECTION');
      emit({ loading: false, error: failure.message,
        ...(failure.code === '42501' ? { orders: [], lastUpdated: null } : {}) });
    }
  }
  return {
    refresh,
    dispose() { alive = false; ++serial; },
    async advance(id: string) {
      if (!alive || state.busyId || state.error || !state.lastUpdated) return;
      const order = state.orders.find(o => o.id === id);
      if (!order || order.status === 'ready') return;
      ++serial; // An older poll must never overwrite a completed mutation.
      emit({ busyId: id, loading: false, notice: null });
      try {
        const updated = await api.advance(order);
        emit({ orders: state.orders.map(o => o.id === updated.id ? updated : o),
          notice: updated.status === 'ready' ? 'Order marked ready.' : 'Preparation started.' });
      } catch (error) {
        const failure = error instanceof KitchenError ? error : new KitchenError('CONNECTION');
        emit({ error: failure.message, notice: failure.message,
          ...(failure.code === '42501' ? { orders: [], lastUpdated: null } : {}) });
      } finally {
        emit({ busyId: null });
        if (alive) await refresh();
      }
    },
  };
}

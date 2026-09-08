import { getSupabaseClient } from './supabaseClient';

export interface ClientErrorSummary { last_24h: number; last_7d: number; latest_at: string | null }

const safeCount = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const clientMonitoringService = {
  async reportRenderCrash(eventId: string, surface: 'customer' | 'kitchen') {
    try {
      const client = getSupabaseClient();
      const { data } = await client.auth.getSession();
      if (!data.session) return;
      await client.rpc('report_client_error', { p_event_id: eventId, p_surface: surface, p_error_kind: 'render_crash' });
    } catch {
      // Crash reporting must never create a second customer-facing failure.
    }
  },

  async getSummary(): Promise<ClientErrorSummary> {
    const { data, error } = await getSupabaseClient().rpc('get_client_error_summary');
    if (error) throw error;
    const value = data as unknown as Partial<ClientErrorSummary>;
    return { last_24h: safeCount(value?.last_24h), last_7d: safeCount(value?.last_7d), latest_at: typeof value?.latest_at === 'string' ? value.latest_at : null };
  },
};

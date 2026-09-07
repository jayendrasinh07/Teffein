import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Mail, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { supportService, type KitchenSupportRequest, type SupportStatus } from '../../services/supportService';

const statusStyle: Record<SupportStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-900',
  resolved: 'bg-emerald-100 text-emerald-800',
};

export const KitchenSupportQueue = () => {
  const [requests, setRequests] = useState<KitchenSupportRequest[]>([]);
  const [filter, setFilter] = useState<'active' | 'resolved'>('active');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setRequests(await supportService.getKitchen()); setError(null); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Support queue could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const visible = useMemo(() => requests.filter(request => filter === 'resolved'
    ? request.status === 'resolved' : request.status !== 'resolved'), [filter, requests]);
  const activeCount = requests.filter(request => request.status !== 'resolved').length;

  const update = async (request: KitchenSupportRequest, status: SupportStatus) => {
    if (busy) return;
    setBusy(request.id); setError(null); setNotice(null);
    try {
      setRequests(await supportService.updateKitchen(request.id, status));
      setNotice(`Support request ${request.id.slice(0, 8).toUpperCase()} updated.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Support status could not be updated.');
    } finally { setBusy(null); }
  };

  return <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><MessageCircle className="mt-1 shrink-0 text-emerald-700" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Customer care</p><h2 className="mt-1 text-xl font-black text-stone-900">Support queue</h2><p className="mt-1 text-sm text-stone-500">Order-linked and general requests from signed-in customers. Visible only to admins.</p></div></div><button type="button" onClick={() => void load()} disabled={loading || !!busy} className="flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm font-bold text-stone-700 disabled:opacity-40"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Refresh</button></div>
    {error && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900"><AlertTriangle size={18} className="shrink-0" />{error}</div>}
    <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-bold text-emerald-700">{notice}</p>
    <div className="mt-2 flex rounded-xl bg-stone-100 p-1 sm:w-fit"><button type="button" onClick={() => setFilter('active')} aria-pressed={filter === 'active'} className={`min-h-10 rounded-lg px-4 text-sm font-bold ${filter === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>Active ({activeCount})</button><button type="button" onClick={() => setFilter('resolved')} aria-pressed={filter === 'resolved'} className={`min-h-10 rounded-lg px-4 text-sm font-bold ${filter === 'resolved' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>Resolved ({requests.length - activeCount})</button></div>
    {loading && requests.length === 0 && <p className="mt-5 text-sm text-stone-500">Loading support requests…</p>}
    {!loading && visible.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">No {filter} support requests.</div>}
    <div className="mt-5 grid gap-4 xl:grid-cols-2">{visible.map(request => <article key={request.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">{request.category.replace(/_/g, ' ')}</p><p className="mt-1 font-mono text-xs font-bold text-stone-500">Ticket {request.id.slice(0, 8).toUpperCase()}{request.order_number ? ` · ${request.order_number}` : ''}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusStyle[request.status]}`}>{request.status.replace('_', ' ')}</span></div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-stone-800">{request.message}</p>
      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3"><p className="font-bold text-stone-900">{request.customer_name}</p><div className="mt-2 flex flex-wrap gap-3 text-xs"><a href={`mailto:${request.customer_email}`} className="flex items-center gap-1 text-emerald-700 underline"><Mail size={13} />{request.customer_email}</a>{request.customer_phone && <a href={`tel:${request.customer_phone}`} className="flex items-center gap-1 text-emerald-700 underline"><Phone size={13} />{request.customer_phone}</a>}</div></div>
      <p className="mt-3 flex items-center gap-1 text-xs text-stone-500"><Clock3 size={13} />Received {new Date(request.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
      <div className="mt-4 flex flex-wrap gap-2">{request.status === 'open' && <button type="button" disabled={!!busy} onClick={() => void update(request, 'in_progress')} className="min-h-10 rounded-xl bg-amber-100 px-3 text-sm font-bold text-amber-950 disabled:opacity-40">Start work</button>}{request.status !== 'resolved' && <button type="button" disabled={!!busy} onClick={() => void update(request, 'resolved')} className="flex min-h-10 items-center gap-1 rounded-xl bg-emerald-700 px-3 text-sm font-bold text-white disabled:opacity-40"><CheckCircle2 size={15} />Resolve</button>}{request.status === 'resolved' && <button type="button" disabled={!!busy} onClick={() => void update(request, 'open')} className="min-h-10 rounded-xl border border-stone-300 px-3 text-sm font-bold text-stone-700 disabled:opacity-40">Reopen</button>}</div>
    </article>)}</div>
  </section>;
};


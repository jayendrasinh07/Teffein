import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChefHat,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KitchenOverview } from '../components/kitchen/KitchenOverview';
import { KitchenMenuPlanner } from '../components/kitchen/KitchenMenuPlanner';
import { istDate } from '../services/availabilityEngine';
import type { KitchenOrder, KitchenShift, KitchenStatus } from '../services/kitchenService';
import { createKitchenQueue, emptyKitchenQueue, type KitchenQueueState } from '../services/kitchenQueue';

type KitchenWorkspace = 'overview' | 'menu' | 'orders';

const pageCopy: Record<KitchenWorkspace, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Control centre', title: 'Kitchen overview', description: "Today's menu, production load, and order progress in one place." },
  menu: { eyebrow: 'Daily planning', title: 'Menu planning', description: 'Choose approved meals and publish the full lunch and dinner menu.' },
  orders: { eyebrow: 'Live operations', title: 'Order queue', description: 'Move confirmed orders through preparing and ready states.' },
};

const navigation: Array<{ id: KitchenWorkspace; label: string; icon: typeof ChefHat }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu Planning', icon: CalendarDays },
  { id: 'orders', label: 'Order Queue', icon: ClipboardList },
];

const stages: { status: KitchenStatus; title: string; hint: string; color: string }[] = [
  { status: 'confirmed', title: 'To prepare', hint: 'Start with the earliest delivery window.', color: 'bg-amber-100 text-amber-900' },
  { status: 'preparing', title: 'Preparing', hint: 'Check preferences before packing.', color: 'bg-orange-100 text-orange-900' },
  { status: 'ready', title: 'Ready', hint: 'Prepared and ready for dispatch.', color: 'bg-emerald-100 text-emerald-900' },
];

const diets: Record<string, string> = {
  standard_gujarati: 'Gujarati',
  jain_satvik: 'Jain Satvik',
  kathiyawadi: 'Kathiyawadi',
  low_oil_fit: 'Low Oil Fit',
  north_indian: 'North Indian',
};

const portions = (orders: KitchenOrder[]) => orders.reduce(
  (total, order) => total + order.items.reduce((count, item) => count + item.quantity, 0),
  0,
);
const time = (value: Date | string) => new Date(value).toLocaleTimeString('en-IN', {
  timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit',
});
const slotWindow = (label: string) => label.replace(/(\d{2}):(\d{2}):\d{2}/g, (_, hour, minute) =>
  `${Number(hour) % 12 || 12}:${minute} ${Number(hour) < 12 ? 'AM' : 'PM'}`,
);

export const KitchenDashboard: React.FC = () => {
  const { currentUser, signOutUser } = useApp();
  const [workspace, setWorkspace] = useState<KitchenWorkspace>('overview');
  const [date, setDate] = useState(() => istDate(new Date()));
  const [shift, setShift] = useState<KitchenShift>('lunch');
  const scope = `${currentUser?.id ?? ''}:${date}:${shift}`;
  const [view, setView] = useState<{ scope: string; state: KitchenQueueState }>(() => ({ scope, state: emptyKitchenQueue() }));
  const queue = useRef<{ scope: string; controller: ReturnType<typeof createKitchenQueue> } | null>(null);
  const state = view.scope === scope ? view.state : emptyKitchenQueue();

  useEffect(() => {
    if (workspace !== 'orders') return;
    const controller = createKitchenQueue(date, shift, next => setView({ scope, state: next }));
    queue.current = { scope, controller };
    void controller.refresh();
    const refresh = () => { if (document.visibilityState === 'visible') void controller.refresh(); };
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.dispose();
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [scope, date, shift, workspace]);

  const activeQueue = queue.current?.scope === scope ? queue.current.controller : null;
  const page = pageCopy[workspace];
  const displayDate = useMemo(() => new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(`${istDate(new Date())}T12:00:00`)), []);

  return (
    <div className="min-h-screen bg-[#f5f6f2] lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="bg-[#0d3b2d] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:block lg:border-b-0 lg:px-6 lg:py-7">
          <button type="button" onClick={() => setWorkspace('overview')} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><ChefHat className="h-6 w-6 text-amber-300" /></span>
            <span>
              <span className="block text-lg font-black tracking-[0.12em]">TEFFEIN</span>
              <span className="block text-xs font-semibold text-emerald-100/75">Kitchen Operations</span>
            </span>
          </button>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-100 lg:mt-5 lg:inline-flex lg:items-center lg:gap-1.5">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-300" />Live
          </span>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-0" aria-label="Kitchen workspace">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = workspace === id;
            return (
              <button key={id} type="button" onClick={() => setWorkspace(id)} aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition lg:w-full ${active ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-50 hover:bg-white/10'}`}>
                <Icon className="h-5 w-5" />{label}
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:block">
          <div className="rounded-2xl bg-black/10 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100"><ShieldCheck className="h-4 w-4" />Kitchen access</div>
            <p className="mt-2 truncate text-sm font-medium text-white" title={currentUser?.email ?? ''}>{currentUser?.email}</p>
            <button type="button" onClick={() => void signOutUser()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-stone-200 bg-white px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{page.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">{page.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-stone-500">{page.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl bg-stone-50 px-4 py-3 text-right sm:block"><p className="text-xs font-semibold text-stone-500">Today</p><p className="text-sm font-bold text-stone-800">{displayDate}</p></div>
              <button type="button" onClick={() => void signOutUser()} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 lg:hidden"><LogOut className="h-4 w-4" />Sign out</button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
          {workspace === 'overview' && <KitchenOverview onOpenMenu={() => setWorkspace('menu')} onOpenOrders={() => setWorkspace('orders')} />}
          {workspace === 'menu' && <KitchenMenuPlanner />}
          {workspace === 'orders' && (
            <>
              <section className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap items-end gap-4">
                  <label className="text-xs font-bold text-stone-600">Service date · IST
                    <input type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} className="mt-2 block min-h-11 rounded-xl border border-stone-200 px-3 text-sm text-stone-900" />
                  </label>
                  <div role="group" aria-label="Meal service" className="flex rounded-xl bg-stone-100 p-1">
                    {(['lunch', 'dinner'] as const).map(option => (
                      <button key={option} type="button" aria-pressed={shift === option} onClick={() => setShift(option)} className={`min-h-11 rounded-lg px-6 text-sm font-bold capitalize ${shift === option ? 'bg-[#0D6E44] text-white shadow-sm' : 'text-stone-600'}`}>{option}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setDate(istDate(new Date()))} className="min-h-11 px-2 text-sm font-bold text-[#0D6E44] underline underline-offset-4">Today</button>
                </div>
                <div className="flex items-center justify-between gap-4 xl:justify-end">
                  <div className="text-sm text-stone-600"><span className="font-black text-stone-900">{portions(state.orders)} portions</span> across {state.orders.length} orders<p className="mt-1 text-xs">{state.lastUpdated ? `Updated ${time(state.lastUpdated)} IST · refreshes every 15s` : 'Waiting for the latest queue'}</p></div>
                  <button type="button" onClick={() => void activeQueue?.refresh()} disabled={state.loading || !!state.busyId} className="flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 disabled:opacity-50"><RefreshCw size={16} className={state.loading ? 'animate-spin' : ''} />Refresh</button>
                </div>
              </section>

              {state.error && <div role="alert" className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle size={20} className="shrink-0" /><p>{state.error} {state.orders.length > 0 && 'Showing the last successful refresh. Status controls are paused.'}</p></div>}
              <p role="status" aria-live="polite" className="my-3 min-h-5 text-sm text-[#0D6E44]">{state.notice ?? (state.loading && !state.lastUpdated ? 'Loading kitchen orders…' : '')}</p>

              <div className="grid gap-5 lg:grid-cols-3">
                {stages.map(stage => {
                  const stageOrders = state.orders.filter(order => order.status === stage.status);
                  return (
                    <section key={stage.status} aria-label={stage.title} className="min-w-0 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 sm:p-4">
                      <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-lg font-black text-stone-900">{stage.title} <span className="ml-1 text-sm font-medium text-stone-500">{stageOrders.length}</span></h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${stage.color}`}>{portions(stageOrders)} portions</span></div>
                      <p className="mb-4 text-xs text-stone-500">{stage.hint}</p>
                      {!stageOrders.length && <div className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">{state.loading && !state.lastUpdated ? 'Loading…' : state.error ? 'Queue unavailable. Try refreshing.' : 'No orders here for this service.'}</div>}
                      <div className="space-y-4">{stageOrders.map(order => (
                        <article key={order.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                          <p className="break-all font-mono text-[11px] font-semibold text-stone-500">{order.order_number}</p>
                          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-stone-900"><Clock3 size={15} />{slotWindow(order.slot_label) || 'Delivery window unavailable'}</p>
                          <div className="mt-4 space-y-4">{order.items.map(item => (
                            <div key={item.id}>
                              <h3 className="text-base font-black text-stone-900"><span className="mr-2 text-[#0D6E44]">{item.quantity}×</span>{item.meal_name}</h3>
                              <div className="mt-2 flex flex-wrap gap-1.5">{[diets[item.preferences.dietType ?? ''] ?? item.preferences.dietType, item.preferences.spiceLevel, item.preferences.oilLevel].filter(Boolean).map((preference, index) => <span key={index} className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">{preference}</span>)}</div>
                              {item.addons.length > 0 && <ul className="mt-2 space-y-1 text-sm text-stone-600">{item.addons.map(addon => <li key={addon.id}>+ {addon.quantity}× {addon.name} <span className="text-xs text-stone-400">total</span></li>)}</ul>}
                            </div>
                          ))}</div>
                          {order.notes && <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950"><p className="mb-1 text-xs font-bold">Kitchen note</p><p className="whitespace-pre-wrap break-words">{order.notes}</p></div>}
                          <p className="mt-4 text-xs text-stone-400">Placed {time(order.created_at)} IST</p>
                          {order.status === 'ready' ? <p className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800"><Check size={17} />Ready for dispatch</p> : (
                            <button type="button" disabled={!!state.busyId || !!state.error || !state.lastUpdated} onClick={() => void activeQueue?.advance(order.id)} className="mt-3 min-h-11 w-full rounded-xl bg-[#0D6E44] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#095535] disabled:cursor-wait disabled:opacity-50">{state.busyId === order.id ? 'Saving…' : order.status === 'confirmed' ? 'Start preparing' : 'Mark ready'}</button>
                          )}
                        </article>
                      ))}</div>
                    </section>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};


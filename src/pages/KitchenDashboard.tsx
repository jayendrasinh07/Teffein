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
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UtensilsCrossed,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KitchenOverview } from '../components/kitchen/KitchenOverview';
import { KitchenCatalogManager } from '../components/kitchen/KitchenCatalogManager';
import { KitchenMenuPlanner } from '../components/kitchen/KitchenMenuPlanner';
import { istDate } from '../services/availabilityEngine';
import { kitchenService, type KitchenOrder, type KitchenRealtimeStatus, type KitchenShift, type KitchenStatus } from '../services/kitchenService';
import { createKitchenQueue, emptyKitchenQueue, type KitchenQueueState } from '../services/kitchenQueue';

type KitchenWorkspace = 'overview' | 'catalog' | 'menu' | 'orders';
type KitchenSort = 'delivery' | 'oldest' | 'newest';

const pageCopy: Record<KitchenWorkspace, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Control centre', title: 'Kitchen overview', description: "Today's menu, production load, and order progress in one place." },
  catalog: { eyebrow: 'Menu administration', title: 'Meal catalog', description: 'Add meals, update prices and details, or pause availability.' },
  menu: { eyebrow: 'Daily planning', title: 'Daily menu', description: 'Choose catalog meals and publish the full lunch and dinner menu.' },
  orders: { eyebrow: 'Live operations', title: 'Live orders', description: 'See who ordered what and move meals through preparing and ready.' },
};

const navigation: Array<{ id: KitchenWorkspace; label: string; icon: typeof ChefHat }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'catalog', label: 'Meal Catalog', icon: Package },
  { id: 'menu', label: 'Daily Menu', icon: CalendarDays },
  { id: 'orders', label: 'Live Orders', icon: ClipboardList },
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
const fullDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const slotWindow = (label: string) => label.replace(/(\d{2}):(\d{2}):\d{2}/g, (_, hour, minute) =>
  `${Number(hour) % 12 || 12}:${minute} ${Number(hour) < 12 ? 'AM' : 'PM'}`,
);
const slotPriority = (label: string) => {
  const match = label.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.MAX_SAFE_INTEGER;
};
const searchableOrder = (order: KitchenOrder) => [
  order.customer_name, order.customer_phone, order.order_number, order.delivery_address,
  order.delivery_area, order.delivery_pincode, ...order.items.map(item => item.meal_name),
].join(' ').toLocaleLowerCase('en-IN');

export const KitchenDashboard: React.FC = () => {
  const { currentUser, signOutUser } = useApp();
  const [workspace, setWorkspace] = useState<KitchenWorkspace>('overview');
  const [date, setDate] = useState(() => istDate(new Date()));
  const [shift, setShift] = useState<KitchenShift>('lunch');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<KitchenSort>('delivery');
  const [realtimeStatus, setRealtimeStatus] = useState<KitchenRealtimeStatus>('connecting');
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
    let unsubscribe = () => {};
    try {
      unsubscribe = kitchenService.subscribe(date, shift, refresh, setRealtimeStatus);
    } catch {
      setRealtimeStatus('fallback');
    }
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.dispose();
      unsubscribe();
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
  const visibleOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('en-IN');
    return state.orders.filter(order => !query || searchableOrder(order).includes(query)).sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return slotPriority(a.slot_label) - slotPriority(b.slot_label)
        || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [search, sort, state.orders]);
  const productionItems = useMemo(() => {
    const totals = new Map<string, number>();
    visibleOrders.forEach(order => order.items.forEach(item => totals.set(item.meal_name, (totals.get(item.meal_name) ?? 0) + item.quantity)));
    return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b, 'en-IN'));
  }, [visibleOrders]);

  return (
    <div className="min-h-screen bg-[#f5f6f2] lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="bg-[#0d3b2d] text-white print:hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:block lg:border-b-0 lg:px-6 lg:py-7">
          <button type="button" onClick={() => setWorkspace('overview')} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><ChefHat className="h-6 w-6 text-amber-300" /></span>
            <span>
              <span className="block text-lg font-black tracking-[0.12em]">TEFFEIN</span>
              <span className="block text-xs font-semibold text-emerald-100/75">Kitchen Operations</span>
            </span>
          </button>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-100 lg:mt-5 lg:inline-flex lg:items-center lg:gap-1.5">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-300" />Kitchen only
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
        <header className="border-b border-stone-200 bg-white px-4 py-5 print:hidden sm:px-6 lg:px-10 lg:py-7">
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
          {workspace === 'overview' && <KitchenOverview onOpenCatalog={() => setWorkspace('catalog')} onOpenMenu={() => setWorkspace('menu')} onOpenOrders={() => setWorkspace('orders')} />}
          {workspace === 'catalog' && <KitchenCatalogManager />}
          {workspace === 'menu' && <KitchenMenuPlanner />}
          {workspace === 'orders' && (
            <>
              <div className="mb-4 hidden print:block">
                <p className="text-xs font-black uppercase tracking-widest">TEFFEIN Kitchen · Packing list</p>
                <h1 className="mt-1 text-2xl font-black">{fullDate(date)} · {shift === 'lunch' ? 'Lunch' : 'Dinner'}</h1>
              </div>
              <section className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm print:hidden sm:p-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap items-end gap-4">
                  <label className="text-xs font-bold text-stone-600">Service date · IST
                    <input type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} className="mt-2 block min-h-11 rounded-xl border border-stone-200 px-3 text-sm text-stone-900" />
                    <span className="mt-2 block text-sm font-black text-stone-900">{fullDate(date)}</span>
                  </label>
                  <div role="group" aria-label="Meal service" className="flex rounded-xl bg-stone-100 p-1">
                    {(['lunch', 'dinner'] as const).map(option => (
                      <button key={option} type="button" aria-pressed={shift === option} onClick={() => setShift(option)} className={`min-h-11 rounded-lg px-6 text-sm font-bold capitalize ${shift === option ? 'bg-[#0D6E44] text-white shadow-sm' : 'text-stone-600'}`}>{option}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setDate(istDate(new Date()))} className="min-h-11 px-2 text-sm font-bold text-[#0D6E44] underline underline-offset-4">Today</button>
                </div>
                <div className="flex items-center justify-between gap-4 xl:justify-end">
                  <div className="text-sm text-stone-600"><span className="font-black text-stone-900">{portions(state.orders)} portions</span> across {state.orders.length} orders<p className="mt-1 text-xs">{state.lastUpdated ? `Updated ${time(state.lastUpdated)} IST · ${realtimeStatus === 'live' ? 'live updates on' : '15s backup refresh'}` : 'Waiting for the latest queue'}</p></div>
                  <span className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold sm:flex ${realtimeStatus === 'live' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    {realtimeStatus === 'live' ? <Wifi size={14} /> : <WifiOff size={14} />}{realtimeStatus === 'live' ? 'Realtime' : realtimeStatus === 'connecting' ? 'Connecting' : 'Backup mode'}
                  </span>
                  <button type="button" onClick={() => void activeQueue?.refresh()} disabled={state.loading || !!state.busyId} className="flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 disabled:opacity-50"><RefreshCw size={16} className={state.loading ? 'animate-spin' : ''} />Refresh</button>
                </div>
              </section>

              {state.error && <div role="alert" className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 print:hidden"><AlertCircle size={20} className="shrink-0" /><p>{state.error} {state.orders.length > 0 && 'Showing the last successful refresh. Status controls are paused.'}</p></div>}
              <p role="status" aria-live="polite" className="my-3 min-h-5 text-sm text-[#0D6E44] print:hidden">{state.notice ?? (state.loading && !state.lastUpdated ? 'Loading kitchen orders…' : '')}</p>

              <section aria-label="Order tools and production summary" className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm print:border-stone-400 print:shadow-none">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_auto] print:hidden">
                  <label className="text-xs font-bold text-stone-600">Search orders
                    <span className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 px-3 focus-within:border-[#0D6E44]"><Search size={17} /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, phone, order, address or meal" className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none" /></span>
                  </label>
                  <label className="text-xs font-bold text-stone-600">Priority order
                    <select value={sort} onChange={event => setSort(event.target.value as KitchenSort)} className="mt-2 block min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold text-stone-900">
                      <option value="delivery">Delivery time first</option><option value="oldest">Oldest order first</option><option value="newest">Newest order first</option>
                    </select>
                  </label>
                  <button type="button" onClick={() => window.print()} disabled={!visibleOrders.length} className="flex min-h-11 items-center justify-center gap-2 self-end rounded-xl bg-stone-900 px-4 text-sm font-bold text-white disabled:opacity-40"><Printer size={17} />Print packing list</button>
                </div>
                <div className="mt-4 border-t border-stone-100 pt-4 print:mt-0 print:border-0 print:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-wider text-stone-500">Production summary</p><p className="mt-1 text-sm font-bold text-stone-900">{portions(visibleOrders)} portions · {visibleOrders.length} of {state.orders.length} orders</p></div>{search && <button type="button" onClick={() => setSearch('')} className="min-h-10 px-2 text-sm font-bold text-[#0D6E44] underline underline-offset-4 print:hidden">Clear search</button>}</div>
                  {productionItems.length > 0 ? <ul className="mt-3 flex flex-wrap gap-2">{productionItems.map(([name, quantity]) => <li key={name} className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800"><span className="mr-1.5 text-[#0D6E44]">{quantity}×</span>{name}</li>)}</ul> : <p className="mt-3 text-sm text-stone-500">No matching production items.</p>}
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-3 print:block">
                {stages.map(stage => {
                  const stageOrders = visibleOrders.filter(order => order.status === stage.status);
                  return (
                    <section key={stage.status} aria-label={stage.title} className="min-w-0 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 sm:p-4 print:mb-5 print:break-inside-avoid print:bg-white">
                      <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-lg font-black text-stone-900">{stage.title} <span className="ml-1 text-sm font-medium text-stone-500">{stageOrders.length}</span></h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${stage.color}`}>{portions(stageOrders)} portions</span></div>
                      <p className="mb-4 text-xs text-stone-500">{stage.hint}</p>
                      {!stageOrders.length && <div className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">{state.loading && !state.lastUpdated ? 'Loading…' : state.error ? 'Queue unavailable. Try refreshing.' : 'No orders here for this service.'}</div>}
                      <div className="space-y-4">{stageOrders.map(order => (
                        <article key={order.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm print:break-inside-avoid print:shadow-none">
                          <p className="flex items-center gap-2 text-sm font-black text-stone-900"><UserRound size={16} className="text-[#0D6E44]" />{order.customer_name}</p>
                          <p className="break-all font-mono text-[11px] font-semibold text-stone-500">{order.order_number}</p>
                          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-stone-900"><Clock3 size={15} />{slotWindow(order.slot_label) || 'Delivery window unavailable'}</p>
                          <div className="mt-3 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                            <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">Customer & delivery</p>
                            <a href={`tel:${order.customer_phone.replace(/[^\d+]/g, '')}`} className="flex min-h-10 items-center gap-2 text-sm font-bold text-[#0D6E44] underline underline-offset-4"><Phone size={15} />{order.customer_phone}</a>
                            <p className="flex items-start gap-2 break-words text-sm leading-relaxed text-stone-700"><MapPin size={16} className="mt-0.5 shrink-0 text-stone-500" /><span>{order.delivery_address}{order.delivery_area && !order.delivery_address.toLocaleLowerCase('en-IN').includes(order.delivery_area.toLocaleLowerCase('en-IN')) ? `, ${order.delivery_area}` : ''}{order.delivery_pincode && !order.delivery_address.includes(order.delivery_pincode) ? ` – ${order.delivery_pincode}` : ''}</span></p>
                            {order.delivery_instructions && <p className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-700">Instruction: {order.delivery_instructions}</p>}
                          </div>
                          <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-xs"><span className="font-bold text-stone-500">Payment</span><span className={`rounded-full px-2.5 py-1 font-black uppercase ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{order.payment_status} · ₹{order.grand_total.toFixed(2)}</span></div>
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
                            <button type="button" disabled={!!state.busyId || !!state.error || !state.lastUpdated} onClick={() => void activeQueue?.advance(order.id)} className="mt-3 min-h-11 w-full rounded-xl bg-[#0D6E44] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#095535] disabled:cursor-wait disabled:opacity-50 print:hidden">{state.busyId === order.id ? 'Saving…' : order.status === 'confirmed' ? 'Start preparing' : 'Mark ready'}</button>
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


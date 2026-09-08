import React, { useEffect, useState } from 'react';
import { AlertTriangle, Download, IndianRupee, Loader2, RefreshCw, ShoppingBag, UtensilsCrossed, XCircle } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { istDate } from '../../services/availabilityEngine';
import { kitchenAnalyticsService, type KitchenAnalyticsDocument } from '../../services/kitchenAnalyticsService';

const initialRange = () => {
  const end = istDate(new Date());
  const startDate = new Date(`${end}T12:00:00`);
  startDate.setDate(startDate.getDate() - 29);
  return { start: istDate(startDate), end };
};
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());

export const KitchenBusinessAnalytics: React.FC = () => {
  const defaults = initialRange();
  const [start, setStart] = useState(defaults.start);
  const [end, setEnd] = useState(defaults.end);
  const [report, setReport] = useState<KitchenAnalyticsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setReport(await kitchenAnalyticsService.get(start, end)); }
    catch (cause) { setError((cause as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const exportCsv = () => {
    if (!report) return;
    const rows = [['Date', 'Orders', 'Cancelled', 'Portions', 'Booked order value (INR)'],
      ...report.daily.map(row => [row.date, row.orders, row.cancelled, row.portions, row.booked_value])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `teffein-report-${report.start_date}-${report.end_date}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="text-xs font-bold text-stone-600">From<input type="date" value={start} max={end} onChange={event => setStart(event.target.value)} className="mt-2 block min-h-11 rounded-xl border border-stone-200 px-3 text-sm" /></label>
            <label className="text-xs font-bold text-stone-600">To<input type="date" value={end} min={start} onChange={event => setEnd(event.target.value)} className="mt-2 block min-h-11 rounded-xl border border-stone-200 px-3 text-sm" /></label>
            <button type="button" onClick={() => void load()} disabled={loading} className="flex min-h-11 items-center gap-2 self-end rounded-xl bg-[#0D6E44] px-5 text-sm font-black text-white disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Generate report
            </button>
          </div>
          <button type="button" onClick={exportCsv} disabled={!report} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 text-sm font-bold text-stone-700 disabled:opacity-50"><Download className="h-4 w-4" />Download daily CSV</button>
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">Booked order value is an operational estimate. It is not collected revenue until online payment or manual settlement is recorded.</p>
      </section>

      {error && <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
      {loading && !report && <div className="flex min-h-64 items-center justify-center rounded-3xl border border-stone-200 bg-white"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>}

      {report && <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric icon={ShoppingBag} title="Total orders" value={String(report.summary.total_orders)} detail={`${report.summary.active_orders} active`} />
          <Metric icon={UtensilsCrossed} title="Portions booked" value={String(report.summary.total_portions)} detail="Cancelled excluded" />
          <Metric icon={IndianRupee} title="Booked value" value={money(report.summary.booked_value)} detail={`Average ${money(report.summary.average_order_value)}`} />
          <Metric icon={IndianRupee} title="Payment pending" value={money(report.summary.pending_value)} detail={`Paid ${money(report.summary.paid_value)}`} />
          <Metric icon={XCircle} title="Cancellation" value={`${report.summary.cancellation_rate}%`} detail={`${report.summary.cancelled_orders} orders`} />
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-stone-900">Daily order trend</h2>
          <p className="mt-1 text-xs text-stone-500">Orders and portions across the selected dates</p>
          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.daily} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" /><XAxis dataKey="date" tickFormatter={shortDate} fontSize={11} /><YAxis allowDecimals={false} fontSize={11} />
                <Tooltip labelFormatter={value => shortDate(String(value))} /><Line type="monotone" dataKey="orders" name="Orders" stroke="#0D6E44" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="portions" name="Portions" stroke="#d97706" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Breakdown title="Order status" rows={report.statuses.map(row => ({ name: label(row.status), value: `${row.orders} orders` }))} />
          <Breakdown title="Meal service" rows={report.meal_types.map(row => ({ name: label(row.meal_type), value: `${row.orders} orders · ${row.portions} portions` }))} />
          <Breakdown title="Payment status" rows={report.payments.map(row => ({ name: label(row.payment_status), value: `${row.orders} · ${money(row.value)}` }))} />
        </section>
        <Breakdown title="Top meals" rows={report.top_meals.map((row, index) => ({ name: `${index + 1}. ${row.meal_name}`, value: `${row.portions} portions` }))} empty="No meals in this date range." />
      </>}
    </div>
  );
};

const Metric = ({ icon: Icon, title, value, detail }: { icon: typeof ShoppingBag; title: string; value: string; detail: string }) => <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-xs font-bold text-stone-500">{title}</p><p className="mt-1 break-words text-2xl font-black text-stone-900">{value}</p><p className="mt-1 text-xs text-stone-500">{detail}</p></article>;
const Breakdown = ({ title, rows, empty = 'No data in this date range.' }: { title: string; rows: Array<{ name: string; value: string }>; empty?: string }) => <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-stone-900">{title}</h2><div className="mt-4 divide-y divide-stone-100">{rows.length ? rows.map(row => <div key={row.name} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="font-semibold text-stone-700">{row.name}</span><span className="text-right font-black text-stone-900">{row.value}</span></div>) : <p className="py-5 text-sm text-stone-500">{empty}</p>}</div></section>;

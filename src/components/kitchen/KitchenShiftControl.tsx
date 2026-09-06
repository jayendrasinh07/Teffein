import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardPen, RefreshCw, Save } from 'lucide-react';
import { istDate } from '../../services/availabilityEngine';
import type { KitchenShift } from '../../services/kitchenService';
import {
  KitchenShiftError,
  kitchenShiftService,
  type KitchenCapacitySlot,
  type KitchenShiftBrief,
} from '../../services/kitchenShiftService';

const shifts: KitchenShift[] = ['lunch', 'dinner'];
const slotTime = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
};
const slotTone = (slot: KitchenCapacitySlot) => slot.max_portions === 0 || slot.remaining_portions === 0
  ? { label: 'Full', badge: 'bg-red-100 text-red-800', bar: 'bg-red-600' }
  : slot.utilization_percent >= 85
    ? { label: 'Almost full', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' }
    : slot.utilization_percent >= 70
      ? { label: 'Watch', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' }
      : { label: 'Available', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-600' };

export const KitchenShiftControl = () => {
  const today = useMemo(() => istDate(new Date()), []);
  const [briefs, setBriefs] = useState<Partial<Record<KitchenShift, KitchenShiftBrief>>>({});
  const [shift, setShift] = useState<KitchenShift>('lunch');
  const [draft, setDraft] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [lunch, dinner] = await Promise.all([
        kitchenShiftService.get(today, 'lunch'),
        kitchenShiftService.get(today, 'dinner'),
      ]);
      setBriefs({ lunch, dinner });
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Shift controls could not be refreshed.');
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const selected = briefs[shift];
  useEffect(() => {
    if (!dirty) setDraft(selected?.handover.note ?? '');
  }, [dirty, selected]);

  const save = async () => {
    if (!selected || saving || !dirty) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await kitchenShiftService.save(today, shift, draft, selected.handover.updated_at);
      setBriefs(current => ({ ...current, [shift]: updated }));
      setDraft(updated.handover.note);
      setDirty(false);
      setNotice(`${shift === 'lunch' ? 'Lunch' : 'Dinner'} handover saved.`);
    } catch (saveError) {
      const failure = saveError instanceof KitchenShiftError ? saveError : new KitchenShiftError('CONNECTION');
      setError(failure.message);
      if (failure.code === '40001') {
        setDirty(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const allSlots = shifts.flatMap(item => briefs[item]?.slots ?? []);
  const urgent = allSlots.filter(slot => slot.max_portions === 0
    || slot.remaining_portions === 0 || slot.utilization_percent >= 85);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Shift control</p>
          <h2 className="mt-1 text-xl font-bold text-stone-900">Capacity & handover</h2>
          <p className="mt-1 text-sm text-stone-500">Live portion load for today and one shared note per service.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm font-bold text-stone-700 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Refresh
        </button>
      </div>

      {error && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900"><AlertTriangle className="mt-0.5 shrink-0" size={18} />{error}</div>}
      {urgent.length > 0 && <div className="mt-4 flex gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-900"><AlertTriangle className="mt-0.5 shrink-0" size={18} />{urgent.length} delivery {urgent.length === 1 ? 'slot needs' : 'slots need'} attention at 85%+ capacity.</div>}
      {!loading && allSlots.length === 0 && <p className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">No active delivery slots are configured.</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shifts.flatMap(item => (briefs[item]?.slots ?? []).map(slot => (
          <CapacityCard key={slot.id} slot={slot} shift={item} />
        )))}
      </div>

      <div className="mt-6 border-t border-stone-100 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-stone-900"><ClipboardPen className="h-5 w-5 text-emerald-700" />Shift handover</div>
          <div role="group" aria-label="Handover service" className="flex rounded-xl bg-stone-100 p-1">
            {shifts.map(item => (
              <button key={item} type="button" onClick={() => { setShift(item); setDirty(false); setNotice(null); }} aria-pressed={shift === item} className={`rounded-lg px-4 py-2 text-sm font-bold capitalize ${shift === item ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-600'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <textarea value={draft} maxLength={2000} onChange={event => { setDraft(event.target.value); setDirty(true); setNotice(null); }} rows={4} placeholder="Stock shortage, prep pending, special instructions, equipment issue…" className="mt-3 w-full resize-y rounded-2xl border border-stone-200 p-4 text-sm text-stone-900 outline-none focus:border-emerald-600" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            {selected?.handover.updated_at
              ? `Updated by ${selected.handover.updated_by ?? 'Kitchen team'} · ${new Date(selected.handover.updated_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`
              : 'No handover saved yet.'}
            {notice && <span className="ml-2 font-bold text-emerald-700">{notice}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span>{draft.length}/2000</span>
            <button type="button" onClick={() => void save()} disabled={!selected || !dirty || saving} className="flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 font-bold text-white disabled:opacity-40">
              <Save size={15} />{saving ? 'Saving…' : 'Save handover'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const CapacityCard = ({ slot, shift }: { slot: KitchenCapacitySlot; shift: KitchenShift }) => {
  const tone = slotTone(slot);
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs font-black uppercase tracking-wider text-stone-500">{shift}</p><p className="mt-1 font-bold text-stone-900">{slot.name}</p><p className="text-xs text-stone-500">{slotTime(slot.start_time)}–{slotTime(slot.end_time)}</p></div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone.badge}`}>{tone.label}</span>
      </div>
      <div className="mt-4 flex items-end justify-between"><p className="text-2xl font-black text-stone-900">{slot.booked_portions}<span className="text-sm font-semibold text-stone-400">/{slot.max_portions}</span></p><p className="text-xs font-bold text-stone-600">{slot.remaining_portions} left</p></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(slot.utilization_percent, 100)}%` }} /></div>
      <p className="mt-2 flex items-center gap-1 text-xs text-stone-500">{tone.label === 'Available' && <CheckCircle2 size={13} className="text-emerald-600" />}{slot.utilization_percent.toFixed(1)}% booked</p>
    </div>
  );
};


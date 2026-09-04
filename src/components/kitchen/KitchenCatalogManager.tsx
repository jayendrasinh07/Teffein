import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CircleOff,
  Image as ImageIcon,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { dietLabel } from '../../services/menuService';
import {
  kitchenCatalogService,
  type KitchenCatalogDietType,
  type KitchenCatalogMeal,
  type KitchenCatalogMealInput,
  type KitchenCatalogMealType,
} from '../../services/kitchenCatalogService';

const emptyMeal = (): KitchenCatalogMealInput => ({
  name: '',
  description: '',
  imageUrl: '',
  mealType: 'lunch',
  dietType: 'standard_gujarati',
  basePrice: 89,
  isActive: true,
});

const toInput = (meal: KitchenCatalogMeal): KitchenCatalogMealInput => ({
  id: meal.id,
  name: meal.name,
  description: meal.description,
  imageUrl: meal.imageUrl,
  mealType: meal.mealType,
  dietType: meal.dietType,
  basePrice: meal.basePrice,
  isActive: meal.isActive,
});

const mealTypeLabel = (value: KitchenCatalogMealType) =>
  value === 'both' ? 'Lunch & dinner' : value[0].toUpperCase() + value.slice(1);

export const KitchenCatalogManager = () => {
  const [meals, setMeals] = useState<KitchenCatalogMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<KitchenCatalogMealInput | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMeals(await kitchenCatalogService.list());
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('en-IN');
    return term
      ? meals.filter(meal => `${meal.name} ${dietLabel(meal.dietType)} ${meal.mealType}`.toLocaleLowerCase('en-IN').includes(term))
      : meals;
  }, [meals, query]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor || saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const next = await kitchenCatalogService.save(editor);
      setMeals(next);
      setNotice(editor.id ? 'Meal updated. New customer orders will use the latest catalog details.' : 'Meal added to the catalog. It is ready for Daily Menu selection.');
      setEditor(null);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-label="Meal catalog" className="space-y-5">
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Master catalog</p>
            <h2 className="mt-1 text-2xl font-black text-stone-900">Meals and prices</h2>
            <p className="mt-1 max-w-2xl text-sm text-stone-600">Add meals here, edit their price and details, or pause availability. Existing orders always keep the name and price captured at checkout.</p>
          </div>
          <button type="button" onClick={() => { setEditor(emptyMeal()); setNotice(''); }}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0D6E44] px-5 text-sm font-black text-white transition hover:bg-[#095535]">
            <PackagePlus size={18} /> Add meal
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
          <label className="relative min-w-[240px] flex-1 sm:max-w-md">
            <span className="sr-only">Search meals</span>
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search meal or style"
              className="min-h-11 w-full rounded-xl border border-stone-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" />
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500"><b className="text-stone-900">{meals.filter(meal => meal.isActive).length}</b> active · {meals.length} total</span>
            <button type="button" onClick={() => void load()} disabled={loading}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-bold text-stone-700 disabled:opacity-50">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle size={20} className="shrink-0" /><p>{error}</p></div>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">{notice}</p>}

      {loading && meals.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-stone-500">Loading meal catalog…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-500">No meals match this search.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(meal => (
            <article key={meal.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${meal.isActive ? 'border-stone-200' : 'border-stone-300 opacity-75'}`}>
              {meal.imageUrl ? <img src={meal.imageUrl} alt="" className="h-36 w-full object-cover" /> : (
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 text-emerald-700"><ImageIcon size={30} /></div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-stone-900">{meal.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-stone-500">{mealTypeLabel(meal.mealType)} · {dietLabel(meal.dietType)}</p>
                  </div>
                  <b className="shrink-0 text-lg text-[#0D6E44]">₹{meal.basePrice.toFixed(2)}</b>
                </div>
                {meal.description && <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-stone-600">{meal.description}</p>}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meal.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                    {meal.isActive ? <CheckCircle2 size={14} /> : <CircleOff size={14} />}{meal.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button type="button" onClick={() => { setEditor(toInput(meal)); setNotice(''); }} className="flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 px-3 text-sm font-bold text-stone-700 hover:bg-stone-50"><Pencil size={15} /> Edit</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setEditor(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="meal-editor-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 sm:px-6">
              <div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">Meal catalog</p><h2 id="meal-editor-title" className="text-xl font-black text-stone-900">{editor.id ? 'Edit meal' : 'Add new meal'}</h2></div>
              <button type="button" onClick={() => setEditor(null)} disabled={saving} aria-label="Close meal editor" className="rounded-xl border border-stone-200 p-2.5 text-stone-600"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-bold text-stone-700">Meal name
                  <input required minLength={3} maxLength={120} value={editor.name} onChange={event => setEditor({ ...editor, name: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 px-3 font-normal outline-none focus:border-emerald-600" placeholder="e.g. Gujarati Executive Thali" />
                </label>
                <label className="text-sm font-bold text-stone-700">Service
                  <select value={editor.mealType} onChange={event => setEditor({ ...editor, mealType: event.target.value as KitchenCatalogMealType })} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 font-normal">
                    <option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="both">Lunch & dinner</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-stone-700">Meal style
                  <select value={editor.dietType} onChange={event => setEditor({ ...editor, dietType: event.target.value as KitchenCatalogDietType })} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 font-normal">
                    {(['standard_gujarati', 'jain_satvik', 'kathiyawadi', 'low_oil_fit', 'north_indian'] as const).map(value => <option key={value} value={value}>{dietLabel(value)}</option>)}
                  </select>
                </label>
                <label className="text-sm font-bold text-stone-700">Price (₹)
                  <input required type="number" min="0.01" max="10000" step="0.01" value={editor.basePrice} onChange={event => setEditor({ ...editor, basePrice: Number(event.target.value) })} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 px-3 font-normal outline-none focus:border-emerald-600" />
                </label>
                <label className="flex min-h-[70px] items-center justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700">
                  <span><span className="block">Available to use</span><span className="mt-1 block text-xs font-normal text-stone-500">Inactive meals cannot be added to a daily menu.</span></span>
                  <input type="checkbox" checked={editor.isActive} onChange={event => setEditor({ ...editor, isActive: event.target.checked })} className="h-5 w-5 accent-emerald-700" />
                </label>
                <label className="sm:col-span-2 text-sm font-bold text-stone-700">Description
                  <textarea maxLength={1000} rows={4} value={editor.description} onChange={event => setEditor({ ...editor, description: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-200 p-3 font-normal outline-none focus:border-emerald-600" placeholder="What is included in this meal?" />
                </label>
                <label className="sm:col-span-2 text-sm font-bold text-stone-700">Image URL <span className="font-normal text-stone-400">(optional)</span>
                  <input type="url" maxLength={2048} pattern="https://.*" value={editor.imageUrl} onChange={event => setEditor({ ...editor, imageUrl: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 px-3 font-normal outline-none focus:border-emerald-600" placeholder="https://…" />
                </label>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
                <p className="max-w-md text-xs leading-relaxed text-stone-500">Catalog updates affect future checkouts. Orders already placed retain their captured meal name, preferences, add-ons, and price.</p>
                <div className="flex gap-2"><button type="button" onClick={() => setEditor(null)} disabled={saving} className="min-h-11 rounded-xl border border-stone-300 px-5 text-sm font-bold text-stone-700">Cancel</button><button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-[#0D6E44] px-5 text-sm font-black text-white disabled:opacity-50">{saving ? 'Saving…' : editor.id ? 'Save changes' : 'Add meal'}</button></div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};


import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CalendarDays, Leaf, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/images';
import { istDate } from '../../services/availabilityEngine';
import { DatabaseMeal, dietLabel, menuService } from '../../services/menuService';
import { SmartImage } from '../common/SmartImage';

export const HomeMealPreview = () => {
  const { setActiveTab } = useApp();
  const [meal, setMeal] = useState<DatabaseMeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    menuService
      .getMenuForDate(istDate())
      .then(menu => {
        if (!active) return;
        const featuredMeal = menu?.meals.find(item => item.mealType === 'lunch' || item.mealType === 'both') ?? menu?.meals[0] ?? null;
        setMeal(featuredMeal);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openMenu = () => {
    setActiveTab('todays_menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startOrder = () => {
    setActiveTab('order_once');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5] border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Today's Kitchen
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">Today's Published Meal</h2>
            <p className="text-stone-600 text-sm mt-1">The same live menu and price used during checkout.</p>
          </div>

          <button
            id="preview-view-full-menu-btn"
            onClick={openMenu}
            className="inline-flex items-center gap-1.5 text-sm font-black text-[#0D6E44] hover:text-[#08482C] hover:underline cursor-pointer group"
          >
            <span>See published menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl min-h-64 border border-stone-200 flex flex-col items-center justify-center text-stone-600">
            <Loader2 className="w-7 h-7 animate-spin text-[#0D6E44]" />
            <span className="mt-3 text-sm font-bold">Loading today's menu…</span>
          </div>
        ) : !meal ? (
          <div className="bg-white rounded-3xl min-h-64 border border-stone-200 flex flex-col items-center justify-center text-center px-6">
            {loadFailed ? <AlertCircle className="w-9 h-9 text-amber-600" /> : <CalendarDays className="w-9 h-9 text-stone-400" />}
            <h3 className="mt-3 text-xl font-black text-stone-900">
              {loadFailed ? 'Menu could not be loaded' : "Today's menu is being prepared"}
            </h3>
            <p className="mt-1 text-sm text-stone-600 max-w-md">
              {loadFailed ? 'Open the menu to try again.' : 'A meal will appear here as soon as the kitchen publishes it.'}
            </p>
            <button onClick={openMenu} className="mt-5 rounded-xl bg-[#0D6E44] text-white px-5 py-3 text-sm font-black">
              Open menu
            </button>
          </div>
        ) : (
          <article className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-sm aspect-4/3 max-h-[320px] bg-stone-100 group">
                <SmartImage
                  src={meal.imageUrl || IMAGES.hero.thaliSpread}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Kitchen published
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#0D6E44] uppercase tracking-wider flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5" /> {dietLabel(meal.dietType)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full capitalize">
                      <Sparkles className="w-3 h-3" /> {meal.mealType} service
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">{meal.name}</h3>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    {meal.description || 'Freshly prepared by the TEFFEIN kitchen.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-stone-500 font-medium">Kitchen price</div>
                    <div className="text-3xl font-black text-stone-900 leading-tight">₹{meal.basePrice}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      id="preview-order-meal-btn"
                      onClick={startOrder}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      Order meal <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      id="preview-see-full-menu-btn"
                      onClick={openMenu}
                      className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold transition-all cursor-pointer"
                    >
                      Full menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

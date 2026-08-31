import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, Sparkles, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

export const MealCalculator: React.FC = () => {
  const { openCheckoutForPlan } = useApp();

  const [mealsPerDay, setMealsPerDay] = useState<1 | 2>(1);
  const [daysCount, setDaysCount] = useState<15 | 20 | 26 | 30>(26);

  // Configurable base calculation
  const totalMeals = mealsPerDay * daysCount;
  
  // Rate logic: higher volume gives lower rate per meal
  let ratePerMeal = 82;
  if (totalMeals <= 15) ratePerMeal = 85;
  else if (totalMeals <= 30) ratePerMeal = 79;
  else ratePerMeal = 74;

  const estimatedMonthlyCost = totalMeals * ratePerMeal;
  // Compare against outside restaurant/Swiggy average of ₹220/meal
  const outsideCost = totalMeals * 220;
  const estimatedSavings = outsideCost - estimatedMonthlyCost;

  return (
    <section className="py-20 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-12 border border-stone-200 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#107048] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Interactive Routine Cost Calculator</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
                  How many meals do you need per month?
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Adjust your weekly routine and see transparent pricing with zero surprise charges.
                </p>
              </div>

              {/* Selector 1: 1 meal/day vs 2 meals/day */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  1. Meals Per Day
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMealsPerDay(1)}
                    className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all ${
                      mealsPerDay === 1
                        ? 'border-emerald-600 bg-white text-emerald-950 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-white'
                    }`}
                  >
                    1 Meal / Day (Lunch or Dinner)
                  </button>

                  <button
                    type="button"
                    onClick={() => setMealsPerDay(2)}
                    className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all ${
                      mealsPerDay === 2
                        ? 'border-emerald-600 bg-white text-emerald-950 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-white'
                    }`}
                  >
                    2 Meals / Day (Lunch + Dinner)
                  </button>
                </div>
              </div>

              {/* Selector 2: Number of days (15 / 20 / 26 / 30) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  2. Active Routine Days per Month
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 26, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysCount(days as 15 | 20 | 26 | 30)}
                      className={`py-3 rounded-2xl border font-extrabold text-sm transition-all ${
                        daysCount === days
                          ? 'border-emerald-600 bg-[#107048] text-white shadow-md'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{days} Days</span>
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                        {days === 15 ? 'Half Month' : days === 20 ? 'Weekdays (4 Wks)' : days === 26 ? 'Mon-Sat' : 'Full Month'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Cost Summary Card (Section 16 Blueprint) */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Total Monthly Volume</span>
                    <div className="text-2xl font-black text-stone-900">{totalMeals} Fresh Meals</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400">Calculated Rate</span>
                    <div className="text-lg font-black text-emerald-700">₹{ratePerMeal} / meal</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Estimated Monthly Cost:</span>
                    <span className="text-xl font-black text-stone-900">₹{estimatedMonthlyCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Outside Restaurant Avg (₹220/meal):</span>
                    <span className="text-stone-400 line-through">₹{outsideCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                    <span className="font-bold flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-emerald-700" />
                      <span>Estimated Routine Savings:</span>
                    </span>
                    <span className="font-black text-emerald-800 text-sm">₹{estimatedSavings.toLocaleString('en-IN')} / month</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => openCheckoutForPlan(daysCount === 30 ? 'monthly_30' : 'half_month_15')}
                    className="w-full py-3.5 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Start This {daysCount}-Day Routine</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-2">
                    Free doorstep delivery in Gandhinagar • Rollover pause protection included
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

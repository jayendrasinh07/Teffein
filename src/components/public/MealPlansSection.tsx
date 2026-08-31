import React from 'react';
import { useApp } from '../../context/AppContext';
import { MEAL_PLANS } from '../../data/config';
import { Check, Sparkles, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { PlanDuration } from '../../types';

export const MealPlansSection: React.FC = () => {
  const { openCheckoutForPlan, setIsCorporateModalOpen } = useApp();

  return (
    <section id="meal-plans-section" className="py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 text-[#0D6E44] text-xs font-black uppercase tracking-wider mb-3">
            <span>Transparent Subscription Tiers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Predictable daily home meals, <br />
            <span className="text-[#0D6E44]">Zero daily order fatigue.</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Zero surge delivery fees, zero hidden packaging surcharges. Fresh hot food delivered across Gandhinagar with complete rollover protection.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MEAL_PLANS.filter((p) => p.id !== 'corporate_custom').map((plan) => {
            const isPopular = plan.isPopular;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl border transition-all flex flex-col justify-between relative group hover:-translate-y-1 ${
                  isPopular
                    ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-emerald-950/10'
                    : 'border-stone-200/90'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xl text-stone-900">{plan.name}</h3>
                    {plan.savingsPercentage > 0 && (
                      <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Save {plan.savingsPercentage}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 mt-1.5 min-h-[32px] leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Editorial Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[9px] font-bold text-[#0D6E44] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      100% Home-Style
                    </span>
                    <span className="text-[9px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                      Controlled Oil
                    </span>
                    <span className="text-[9px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                      Free Chaas
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-5 pb-5 border-b border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-stone-900">₹{plan.pricePerMeal}</span>
                      <span className="text-xs font-semibold text-stone-500">/ meal</span>
                    </div>
                    <div className="text-xs text-[#0D6E44] font-bold mt-1">
                      Total ₹{plan.totalPrice} for {plan.totalMeals} {plan.totalMeals === 1 ? 'meal' : 'meals'}
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="mt-5 space-y-2.5 text-xs text-stone-700 font-medium">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0D6E44] mt-0.5 shrink-0" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div className="mt-8 pt-4">
                  <button
                    id={`btn-plan-${plan.id}`}
                    onClick={() => openCheckoutForPlan(plan.id)}
                    className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                      isPopular
                        ? 'bg-[#0D6E44] hover:bg-[#08482C] text-white shadow-emerald-950/20'
                        : 'bg-stone-900 hover:bg-[#0D6E44] text-white'
                    }`}
                  >
                    <span>Start {plan.name}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>

                  <div className="text-center text-[10px] text-stone-500 font-semibold mt-2">
                    {plan.flexibility.pauseAllowedDays > 0
                      ? `Pause up to ${plan.flexibility.pauseAllowedDays} days anytime`
                      : 'Try once with zero commitment'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Custom Enterprise Banner */}
        <div className="mt-10 bg-gradient-to-r from-[#1C2621] to-[#0E2319] rounded-3xl p-6 sm:p-8 lg:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-stone-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corporate & Factory Catering (15+ Employees)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Looking for reliable employee lunch catering in Gandhinagar?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Subsidized corporate rates from ₹68/meal with hot thermo-crates, customized diet splits (Gujarati/Jain/Low-oil), and consolidated monthly GST invoicing.
            </p>
          </div>

          <button
            onClick={() => setIsCorporateModalOpen(true)}
            className="shrink-0 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Request Corporate Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

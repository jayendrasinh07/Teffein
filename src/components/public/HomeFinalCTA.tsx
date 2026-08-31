import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const HomeFinalCTA: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl overflow-hidden bg-[#132A1F] text-white p-8 sm:p-12 lg:p-14 shadow-2xl">
          {/* Subtle background image overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
            <SmartImage
              src={IMAGES.hero.warmRotis}
              alt="Warm home cooking background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative max-w-2xl space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Gandhinagar's Daily Kitchen
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Your next meal is sorted.
            </h2>

            <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed">
              Fresh home-style food, whenever you need it. Order a single hot meal or start a flexible plan today.
            </p>

            {/* Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                id="final-cta-order-meal"
                onClick={() => {
                  setActiveTab('order_once');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-base font-black shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Order a Meal</span>
                <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="final-cta-view-plans"
                onClick={() => {
                  setActiveTab('meal_plans');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-base font-black border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Plans</span>
              </button>
            </div>

            {/* Trust check */}
            <div className="pt-2 flex items-center gap-2 text-xs text-stone-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero cancellation fee • Free cluster delivery across Sectors 1–30</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

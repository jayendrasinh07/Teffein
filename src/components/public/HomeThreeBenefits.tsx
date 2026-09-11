import React from 'react';
import { Clock3, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';

export const HomeThreeBenefits: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Why Thalimitra
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">
            Everything clear before you order
          </h2>
          <p className="text-stone-500 text-sm mt-1 font-medium">
            No guessing about the meal, price, delivery window or cancellation cutoff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Benefit 1: Freshly Cooked */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/90 flex flex-col items-center text-center space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-[#0D6E44] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              See exactly what’s cooking
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              The Customer menu shows only meals and prices published by the Kitchen for the selected date.
            </p>
          </div>

          {/* Benefit 2: Home-Style */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/90 flex flex-col items-center text-center space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Make it your way
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Choose available spice, oil and add-on preferences before the final order total is confirmed.
            </p>
          </div>

          {/* Benefit 3: Flexible */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/90 flex flex-col items-center text-center space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="w-13 h-13 rounded-2xl bg-sky-100/80 text-sky-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Clock3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Know the cutoff
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Breakfast closes the previous night at 10:00 PM, lunch at 10:30 AM, and dinner at 5:30 PM. Confirmed orders can be cancelled before cutoff.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

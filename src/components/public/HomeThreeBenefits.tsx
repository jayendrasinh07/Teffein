import React from 'react';
import { Flame, Heart, RefreshCw } from 'lucide-react';

export const HomeThreeBenefits: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Why TEFFEIN
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">
            Real food, cooked with care
          </h2>
          <p className="text-stone-500 text-sm mt-1 font-medium">
            Everything your everyday routine needs — without restaurant heaviness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Benefit 1: Freshly Cooked */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/90 flex flex-col items-center text-center space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-[#0D6E44] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Freshly Cooked
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Prepared for the day's meals in small batches. Zero frozen food, zero stale gravies, zero re-used oil.
            </p>
          </div>

          {/* Benefit 2: Home-Style */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/90 flex flex-col items-center text-center space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Home-Style
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Simple everyday Indian food. Light on spices, balanced nutrition, easy on the stomach 365 days a year.
            </p>
          </div>

          {/* Benefit 3: Flexible */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200/90 flex flex-col items-center text-center space-y-3 group hover:border-emerald-300 transition-colors">
            <div className="w-13 h-13 rounded-2xl bg-sky-100/80 text-sky-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Flexible
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Order once when you're hungry or subscribe for 7, 15, or 30 days with 1-click pause and meal rollover.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

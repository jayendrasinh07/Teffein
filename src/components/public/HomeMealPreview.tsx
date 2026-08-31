import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles, Check, Clock } from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const HomeMealPreview: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5] border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Today's Kitchen
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">
              Today's Meal
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Cooked fresh every morning in pure groundnut oil with zero preservatives.
            </p>
          </div>

          <button
            id="preview-view-full-menu-btn"
            onClick={() => {
              setActiveTab('todays_menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#0D6E44] hover:text-[#08482C] hover:underline cursor-pointer group"
          >
            <span>See Full 7-Day Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Large 2-Column Food Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Large Food Visual */}
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-sm aspect-4/3 max-h-[320px] bg-stone-100 group">
              <SmartImage
                src={IMAGES.hero.thaliSpread}
                alt="Gujarati Home-Style Meal with dal, sabji, rotis, rice and salad"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Available Today</span>
              </div>
            </div>

            {/* Right: Meal Details & Direct Ordering */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Pure Home-Style Thali
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Fresh Batch
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  Gujarati Home-Style Meal
                </h3>
                <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                  Traditional yellow toor dal tadka, seasonal fresh sabji, 4 soft MP Sharbati wheat phulkas, steamed jeera rice, crisp kachumber salad, and digestive masala chaas.
                </p>
              </div>

              {/* Items List */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold text-stone-700">
                <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0D6E44]" /> Dal Tadka
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0D6E44]" /> Seasonal Sabji
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0D6E44]" /> 4 Phulkas
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0D6E44]" /> Steamed Jeera Rice
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0D6E44]" /> Kachumber & Chaas
                </span>
              </div>

              {/* Price & Action Row */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Single Meal Price</div>
                  <div className="text-2xl font-black text-stone-900 leading-tight">
                    ₹119 <span className="text-xs text-stone-500 font-normal">/ (From ₹76 on Plan)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    id="preview-order-meal-btn"
                    onClick={() => {
                      setActiveTab('order_once');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Order This Meal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="preview-see-full-menu-btn"
                    onClick={() => {
                      setActiveTab('todays_menu');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    <span>See Full Menu</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

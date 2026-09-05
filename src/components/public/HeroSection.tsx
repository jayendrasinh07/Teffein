import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  MapPin 
} from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const HeroSection: React.FC = () => {
  const { 
    setActiveTab, 
    setIsLocationModalOpen,
    centralLocation,
    activeDeliveryAddress 
  } = useApp();

  const currentArea = centralLocation?.confirmedAddress?.sector || 
    centralLocation?.confirmedAddress?.area || 
    centralLocation?.area || 
    activeDeliveryAddress?.sector || 
    activeDeliveryAddress?.area || 
    'Gandhinagar';

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:py-16 bg-[#FAF8F5]">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-4 left-10 w-80 h-80 bg-amber-100/25 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Copy & Clear CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Subtle Location Context */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-[#0D6E44] shrink-0" />
                <span>Delivering to <strong className="text-stone-900 font-black">{currentArea}</strong></span>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-[11px] font-bold text-[#0D6E44] hover:text-[#08482C] underline ml-1 cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.08]">
              Roz ka khana. <br />
              <span className="text-[#0D6E44]">Sahi khana.</span>
            </h1>

            {/* Short supporting text */}
            <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-lg">
              Fresh home-style meals for your everyday routine. Cooked daily in pure groundnut oil, delivered hot to your doorstep across Gandhinagar.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="hero-primary-order-btn"
                onClick={() => {
                  setActiveTab('order_once');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-base font-black shadow-lg shadow-emerald-950/15 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Order a Meal</span>
                <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-secondary-menu-btn"
                onClick={() => {
                  setActiveTab('todays_menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 text-base font-bold border border-stone-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Today's Menu</span>
              </button>
            </div>

            {/* Trust Line */}
            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D6E44] shrink-0" />
                <span>No subscription required</span>
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D6E44] shrink-0" />
                <span>Freshly cooked</span>
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D6E44] shrink-0" />
                <span>No junk-focused menu</span>
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Large Clean Food Showcase Card (40-45% width) */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-stone-200/90 overflow-hidden group">
              
              {/* Photo Area */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-inner bg-stone-100">
                <SmartImage
                  src={IMAGES.hero.mainThali}
                  alt="Fresh wholesome Indian thali with dal, sabji, rotis, rice, salad and chaas"
                  priority={true}
                  aspectRatio="auto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Subtle Image Tag */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Freshly Cooked Today</span>
                </div>
              </div>

              {/* Clean Information Area below photograph */}
              <div className="pt-3 px-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-black text-stone-900 leading-snug">
                      Dal Tadka • Seasonal Sabji
                    </div>
                    <div className="text-xs text-stone-600 font-medium mt-0.5">
                      4 Phulkas • Steamed Jeera Rice • Kachumber • Masala Chaas
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase block text-emerald-800 font-bold leading-tight">Live</span>
                    <span className="text-base font-black text-[#0D6E44] leading-tight">Menu</span>
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    100% Pure Vegetarian
                  </span>
                  <span>Gandhinagar Kitchen</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

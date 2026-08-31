import React from 'react';
import { 
  Utensils, 
  Sparkles, 
  Check, 
  Flame, 
  Droplets, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SmartImage } from '../common/SmartImage';
import { DayMealDetails } from '../../services/orderCustomizationEngine';

interface OrderMealShowcaseProps {
  mealDetails: DayMealDetails;
  basePrice: number;
  onCustomizeClick: () => void;
  isCustomizing: boolean;
}

export const OrderMealShowcase: React.FC<OrderMealShowcaseProps> = ({
  mealDetails,
  basePrice,
  onCustomizeClick,
  isCustomizing
}) => {
  // Sabji names
  const sabjiNames = mealDetails.dishes.sabji.map((s) => s.name).join(' & ') || 'Seasonal Fresh Sabji';
  const dalName = mealDetails.dishes.dal[0]?.name || 'Panchmel Dal Tadka / Gujarati Kadhi';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6">
      {/* Top Banner: Dish Title & Price */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {mealDetails.dayName}'s {mealDetails.mealSlot === 'lunch' ? 'Lunch' : 'Dinner'} Menu
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              Fresh Steam Kitchen
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1.5 tracking-tight">
            {mealDetails.title}
          </h2>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end justify-between">
          <div className="text-right">
            <span className="text-xs text-stone-500 font-medium block">Complete Meal</span>
            <span className="text-2xl font-black text-stone-900">₹{basePrice}</span>
          </div>
        </div>
      </div>

      {/* Dominant Food Photograph */}
      <div className="relative rounded-2xl overflow-hidden shadow-inner aspect-16/9 sm:aspect-21/9 max-h-[320px] bg-stone-100 group">
        <SmartImage
          src={mealDetails.image}
          alt={mealDetails.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Quality Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Reused Oil</span>
          </span>
          <span className="bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MP Sharbati Wheat</span>
          </span>
        </div>

        {/* Nutrition Badge */}
        <div className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
          <span>🔥 ~{mealDetails.nutrition.calories} kcal</span>
          <span>•</span>
          <span>💪 {mealDetails.nutrition.proteinGrams}g Protein</span>
        </div>
      </div>

      {/* What's Included Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-stone-700">
            What's Included in This Meal
          </span>
          <span className="text-[11px] text-stone-500">
            Piping hot • Heat-sealed tray
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-150">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D6E44] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Sabji: {sabjiNames}</p>
              <p className="text-[11px] text-stone-500 leading-tight">Fresh seasonal vegetable in mild home spices</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-150">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D6E44] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Dal: {dalName}</p>
              <p className="text-[11px] text-stone-500 leading-tight">Slow simmered with hing & mustard tadka</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-150">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D6E44] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">4 Whole Wheat Phulkas</p>
              <p className="text-[11px] text-stone-500 leading-tight">Soft, puffy tawa rotis with desi ghee touch</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-150">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D6E44] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Steamed Rice & Fresh Salad</p>
              <p className="text-[11px] text-stone-500 leading-tight">Long-grain jeera rice + crisp kachumber</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chef Note */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
        <span className="text-base shrink-0">👨‍🍳</span>
        <span>
          <strong className="font-bold">Chef's Note:</strong> {mealDetails.chefNote}
        </span>
      </div>

      {/* Quick Customize Action Button */}
      <button
        type="button"
        id="btn-customize-meal-trigger"
        onClick={onCustomizeClick}
        className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isCustomizing
            ? 'bg-stone-900 text-white shadow-md'
            : 'bg-emerald-50 text-[#0D6E44] hover:bg-emerald-100 border border-emerald-200'
        }`}
      >
        <Utensils className="w-4 h-4" />
        <span>{isCustomizing ? 'Hide Customization' : 'Customize Roti, Rice & Taste →'}</span>
      </button>
    </div>
  );
};

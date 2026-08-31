import React from 'react';
import { 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Droplet, 
  Sparkles,
  Utensils,
  Leaf
} from 'lucide-react';
import { SingleMealCustomization, DayMealDetails } from '../../services/orderCustomizationEngine';

interface MealCustomizerProps {
  customization: SingleMealCustomization;
  onChange: (updated: SingleMealCustomization) => void;
  mealDetails: DayMealDetails;
}

export const MealCustomizer: React.FC<MealCustomizerProps> = ({
  customization,
  onChange,
  mealDetails
}) => {
  const sabjiName = mealDetails.dishes.sabji[0]?.name || 'Seasonal Sabji';
  const dalName = mealDetails.dishes.dal[0]?.name || 'Home Dal / Kadhi';

  const handleRotiChange = (delta: number) => {
    const nextCount = Math.max(2, Math.min(8, customization.rotiCount + delta));
    onChange({ ...customization, rotiCount: nextCount });
  };

  const extraRotiPrice = customization.rotiCount > 4 ? (customization.rotiCount - 4) * 10 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Roti Customization Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🫓</span>
              <h4 className="text-xs sm:text-sm font-black text-stone-900">
                Phulka Rotis
              </h4>
              <span className="text-[10px] font-bold text-[#0D6E44] bg-emerald-100 px-2 py-0.5 rounded-full">
                4 Included
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              100% MP Sharbati whole wheat • Light ghee brush
            </p>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-300 p-1 shadow-sm">
            <button
              type="button"
              id="btn-roti-minus"
              onClick={() => handleRotiChange(-1)}
              disabled={customization.rotiCount <= 2}
              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 text-stone-800 flex items-center justify-center font-black cursor-pointer transition-colors"
              aria-label="Decrease Roti Count"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center font-black text-sm text-stone-900 font-mono">
              {customization.rotiCount}
            </span>

            <button
              type="button"
              id="btn-roti-plus"
              onClick={() => handleRotiChange(1)}
              disabled={customization.rotiCount >= 8}
              className="w-8 h-8 rounded-lg bg-[#0D6E44] hover:bg-[#08482C] disabled:opacity-40 text-white flex items-center justify-center font-black cursor-pointer transition-colors shadow-sm"
              aria-label="Increase Roti Count"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Extra pricing indicator */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/60">
          <span className="text-stone-500">
            {customization.rotiCount === 4 ? 'Standard portion included' : `${customization.rotiCount} Phulkas selected`}
          </span>
          <span className="font-black text-stone-900">
            {extraRotiPrice > 0 ? (
              <span className="text-[#0D6E44] bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                +{customization.rotiCount - 4} Extra (₹{extraRotiPrice})
              </span>
            ) : (
              <span className="text-stone-500">₹0 Extra</span>
            )}
          </span>
        </div>
      </div>

      {/* 2. Rice Customization Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🍚</span>
              <h4 className="text-xs sm:text-sm font-black text-stone-900">
                Steamed Rice / Khichdi
              </h4>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Long-grain jeera rice or daily wholesome grain
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...customization, ricePortion: 'regular' })}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
              customization.ricePortion === 'regular'
                ? 'bg-white border-[#0D6E44] text-[#0D6E44] shadow-sm'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
            }`}
          >
            <span>Regular (Included)</span>
            <span className="text-[10px] opacity-75">₹0</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...customization, ricePortion: 'extra' })}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
              customization.ricePortion === 'extra'
                ? 'bg-white border-[#0D6E44] text-[#0D6E44] shadow-sm'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
            }`}
          >
            <span>Extra Rice Portion</span>
            <span className="text-[10px] font-black text-[#0D6E44] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+₹15</span>
          </button>
        </div>
      </div>

      {/* 3. Sabji & Dal Portions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sabji portion */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🥘</span>
            <div>
              <h4 className="text-xs font-black text-stone-900 leading-tight truncate max-w-[170px]">
                {sabjiName}
              </h4>
              <span className="text-[10px] text-stone-500">Fresh vegetable</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...customization, sabjiPortion: 'regular' })}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                customization.sabjiPortion === 'regular'
                  ? 'bg-white border-[#0D6E44] text-[#0D6E44] shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              Regular
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...customization, sabjiPortion: 'extra' })}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                customization.sabjiPortion === 'extra'
                  ? 'bg-white border-[#0D6E44] text-[#0D6E44] shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              Extra (+₹25)
            </button>
          </div>
        </div>

        {/* Dal portion */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🥣</span>
            <div>
              <h4 className="text-xs font-black text-stone-900 leading-tight truncate max-w-[170px]">
                {dalName}
              </h4>
              <span className="text-[10px] text-stone-500">Home lentil soup</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...customization, dalPortion: 'regular' })}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                customization.dalPortion === 'regular'
                  ? 'bg-white border-[#0D6E44] text-[#0D6E44] shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              Regular
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...customization, dalPortion: 'extra' })}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                customization.dalPortion === 'extra'
                  ? 'bg-white border-[#0D6E44] text-[#0D6E44] shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              Extra (+₹15)
            </button>
          </div>
        </div>
      </div>

      {/* 4. Chaas & Salad Quick Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Chaas Toggle Card */}
        <div
          onClick={() => onChange({ ...customization, hasChaas: !customization.hasChaas })}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            customization.hasChaas
              ? 'bg-emerald-50/70 border-[#0D6E44] shadow-xs'
              : 'bg-[#FAF8F5] border-stone-200 hover:bg-stone-100/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🥛</span>
            <div>
              <h4 className="text-xs font-black text-stone-900">
                Fresh Masala Chaas (250ml)
              </h4>
              <p className="text-[10px] text-stone-500">Chilled cumin buttermilk</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`text-xs font-black block ${customization.hasChaas ? 'text-[#0D6E44]' : 'text-stone-900'}`}>
              +₹15
            </span>
            <span className={`text-[10px] font-bold ${customization.hasChaas ? 'text-[#0D6E44]' : 'text-stone-400'}`}>
              {customization.hasChaas ? '✓ Added' : '+ Add'}
            </span>
          </div>
        </div>

        {/* Extra Salad Toggle */}
        <div
          onClick={() => onChange({ ...customization, extraSalad: !customization.extraSalad })}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            customization.extraSalad
              ? 'bg-emerald-50/70 border-[#0D6E44] shadow-xs'
              : 'bg-[#FAF8F5] border-stone-200 hover:bg-stone-100/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🥗</span>
            <div>
              <h4 className="text-xs font-black text-stone-900">
                Extra Salad Bowl
              </h4>
              <p className="text-[10px] text-stone-500">Crisp cucumber & radish</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`text-xs font-black block ${customization.extraSalad ? 'text-[#0D6E44]' : 'text-stone-900'}`}>
              +₹10
            </span>
            <span className={`text-[10px] font-bold ${customization.extraSalad ? 'text-[#0D6E44]' : 'text-stone-400'}`}>
              {customization.extraSalad ? '✓ Added' : '+ Add'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Food & Dietary Preferences (Kitchen Fulfillable) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0D6E44]" />
            <span>Preparation & Dietary Preference</span>
          </label>
          <span className="text-[10px] text-stone-500">Zero extra charge</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Regular */}
          <button
            type="button"
            onClick={() => onChange({ 
              ...customization, 
              dietVariant: 'Standard Gujarati', 
              spiceLevel: 'Regular', 
              oilLevel: 'Standard' 
            })}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
              customization.dietVariant === 'Standard Gujarati' && customization.spiceLevel === 'Regular'
                ? 'bg-[#0D6E44] text-white border-[#0D6E44] shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Standard Home
          </button>

          {/* Less Spicy */}
          <button
            type="button"
            onClick={() => onChange({ 
              ...customization, 
              spiceLevel: customization.spiceLevel === 'Less Spicy' ? 'Regular' : 'Less Spicy' 
            })}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
              customization.spiceLevel === 'Less Spicy'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            🔥 Less Spicy
          </button>

          {/* Less Oil */}
          <button
            type="button"
            onClick={() => onChange({ 
              ...customization, 
              oilLevel: customization.oilLevel === 'Less Oil (Fit)' ? 'Standard' : 'Less Oil (Fit)' 
            })}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
              customization.oilLevel === 'Less Oil (Fit)'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            💧 Less Oil (Fit)
          </button>

          {/* Jain Satvik */}
          <button
            type="button"
            onClick={() => onChange({ 
              ...customization, 
              dietVariant: customization.dietVariant === 'Jain Satvik' ? 'Standard Gujarati' : 'Jain Satvik' 
            })}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
              customization.dietVariant === 'Jain Satvik'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            🌱 Jain Satvik
          </button>
        </div>
      </div>
    </div>
  );
};

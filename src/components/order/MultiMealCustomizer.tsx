import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Users, 
  Sliders, 
  Sparkles, 
  Check, 
  User,
  Utensils
} from 'lucide-react';
import { 
  SingleMealCustomization, 
  DayMealDetails,
  createDefaultMealCustomization 
} from '../../services/orderCustomizationEngine';
import { MealCustomizer } from './MealCustomizer';

interface MultiMealCustomizerProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  applySameCustomization: boolean;
  onApplySameChange: (applySame: boolean) => void;
  mealCustomizations: SingleMealCustomization[];
  onCustomizationsChange: (updated: SingleMealCustomization[]) => void;
  mealDetails: DayMealDetails;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const MultiMealCustomizer: React.FC<MultiMealCustomizerProps> = ({
  quantity,
  onQuantityChange,
  applySameCustomization,
  onApplySameChange,
  mealCustomizations,
  onCustomizationsChange,
  mealDetails,
  isExpanded,
  onToggleExpand
}) => {
  const [activeMealTab, setActiveMealTab] = useState<number>(0);

  // Ensure customizations array length matches quantity
  const ensureCustomizationsLength = (newQty: number) => {
    let updated = [...mealCustomizations];
    if (updated.length < newQty) {
      for (let i = updated.length; i < newQty; i++) {
        updated.push(createDefaultMealCustomization(i, `Meal ${i + 1}`));
      }
    } else if (updated.length > newQty) {
      updated = updated.slice(0, newQty);
    }
    return updated;
  };

  const handleQtyChange = (delta: number) => {
    const nextQty = Math.max(1, Math.min(10, quantity + delta));
    onQuantityChange(nextQty);
    const updated = ensureCustomizationsLength(nextQty);
    onCustomizationsChange(updated);
    if (activeMealTab >= nextQty) {
      setActiveMealTab(0);
    }
  };

  const handleSingleMealChange = (index: number, updatedMeal: SingleMealCustomization) => {
    const nextList = [...mealCustomizations];
    nextList[index] = updatedMeal;
    onCustomizationsChange(nextList);
  };

  const activeCustomization = mealCustomizations[activeMealTab] || createDefaultMealCustomization(0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6">
      
      {/* 1. Meal Quantity Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#0D6E44]" />
              <span>How many meals?</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Single order for yourself, family, or office group
          </p>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center gap-3 bg-[#FAF8F5] rounded-2xl border border-stone-300 p-1.5 self-start sm:self-auto">
          <button
            type="button"
            id="btn-meal-qty-minus"
            onClick={() => handleQtyChange(-1)}
            disabled={quantity <= 1}
            className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-800 flex items-center justify-center font-black cursor-pointer shadow-xs transition-colors"
            aria-label="Decrease Meal Quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="px-3 text-center">
            <span className="font-black text-lg text-stone-900 font-mono block leading-none">
              {quantity}
            </span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {quantity === 1 ? 'Meal' : 'Meals'}
            </span>
          </div>

          <button
            type="button"
            id="btn-meal-qty-plus"
            onClick={() => handleQtyChange(1)}
            disabled={quantity >= 10}
            className="w-9 h-9 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] disabled:opacity-40 text-white flex items-center justify-center font-black cursor-pointer shadow-sm transition-colors"
            aria-label="Increase Meal Quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Multi-meal customizer toggle (if quantity > 1) */}
      {quantity > 1 && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#0D6E44] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900">
                Same customization for all {quantity} meals?
              </h4>
              <p className="text-[11px] text-stone-600">
                {applySameCustomization 
                  ? 'All meals will share the exact same Roti count, spice & diet' 
                  : 'Customize each person\'s meal separately below'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApplySameChange(!applySameCustomization)}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border ${
              applySameCustomization
                ? 'bg-[#0D6E44] text-white border-[#0D6E44]'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${applySameCustomization ? 'opacity-100' : 'opacity-0'}`} />
            <span>{applySameCustomization ? 'Same for all' : 'Individual custom'}</span>
          </button>
        </div>
      )}

      {/* 3. Individual meal tabs (if quantity > 1 and applySameCustomization is false) */}
      {quantity > 1 && !applySameCustomization && (
        <div className="space-y-2">
          <span className="text-xs font-black text-stone-700 uppercase tracking-wider block">
            Select meal to customize:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {Array.from({ length: quantity }).map((_, idx) => {
              const isActive = activeMealTab === idx;
              const mealCustom = mealCustomizations[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMealTab(idx)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Meal {idx + 1}</span>
                  {mealCustom && mealCustom.rotiCount > 4 && (
                    <span className="text-[10px] bg-amber-400 text-stone-950 px-1 rounded-sm font-mono">
                      {mealCustom.rotiCount}R
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Active Meal Customization Body */}
      {isExpanded ? (
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0D6E44]" />
              <span>
                {quantity > 1 && !applySameCustomization
                  ? `Customizing Meal ${activeMealTab + 1}`
                  : 'Customize Roti, Rice & Taste'}
              </span>
            </h3>
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              Hide
            </button>
          </div>

          <MealCustomizer
            customization={activeCustomization}
            onChange={(updated) => {
              if (applySameCustomization) {
                // Apply to all
                const allUpdated = Array.from({ length: quantity }).map((_, i) => ({
                  ...updated,
                  mealIndex: i,
                  label: `Meal ${i + 1}`
                }));
                onCustomizationsChange(allUpdated);
              } else {
                handleSingleMealChange(activeMealTab, updated);
              }
            }}
            mealDetails={mealDetails}
          />
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-dashed border-stone-300 flex items-center justify-between">
          <div className="text-xs text-stone-600">
            <strong className="text-stone-900 font-bold">Standard configuration selected:</strong> 4 Rotis, Steamed Rice, Standard Spice, Zero Soda.
          </div>
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-xs font-black text-[#0D6E44] hover:underline cursor-pointer shrink-0 ml-2"
          >
            Customize Details →
          </button>
        </div>
      )}
    </div>
  );
};

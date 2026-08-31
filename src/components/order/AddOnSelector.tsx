import React from 'react';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  ShoppingBag, 
  Check 
} from 'lucide-react';
import { ORDER_ADDON_CATALOG } from '../../services/orderCustomizationEngine';
import { SmartImage } from '../common/SmartImage';

interface AddOnSelectorProps {
  selectedAddons: { [id: string]: number };
  onAddonToggle: (id: string, delta: number) => void;
}

export const AddOnSelector: React.FC<AddOnSelectorProps> = ({
  selectedAddons,
  onAddonToggle
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Add Something Extra</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Freshly prepared sides, beverages & desserts to complete your meal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ORDER_ADDON_CATALOG.map((item) => {
          const qty = selectedAddons[item.id] || 0;
          const isAdded = qty > 0;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isAdded
                  ? 'bg-emerald-50/50 border-[#0D6E44] shadow-xs'
                  : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Addon Image / Thumbnail */}
                {item.image && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden shadow-inner shrink-0 bg-stone-200">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-xs font-black text-stone-900 leading-tight">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-stone-500 block">
                    Per {item.unit}
                  </span>
                  <div className="text-xs font-black text-stone-900">
                    ₹{item.price}
                  </div>
                </div>
              </div>

              {/* Action Button: Add or Stepper */}
              <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-500">
                  {isAdded ? `Qty: ${qty}` : 'Ready to pack'}
                </span>

                {isAdded ? (
                  <div className="flex items-center gap-1.5 bg-white rounded-xl border border-stone-300 p-0.5 shadow-xs">
                    <button
                      type="button"
                      onClick={() => onAddonToggle(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-black cursor-pointer transition-colors"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="w-6 text-center font-black text-xs text-stone-900 font-mono">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => onAddonToggle(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-[#0D6E44] hover:bg-[#08482C] text-white flex items-center justify-center font-black cursor-pointer transition-colors"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddonToggle(item.id, 1)}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-[#0D6E44] hover:text-[#08482C] border border-stone-300 hover:border-[#0D6E44] text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

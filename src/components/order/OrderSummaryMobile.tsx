import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronUp, 
  ChevronDown, 
  X, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Utensils 
} from 'lucide-react';
import { OrderPricingBreakdown, DayMealDetails } from '../../services/orderCustomizationEngine';
import { CustomerAddress, DeliverySlot } from '../../types';

interface OrderSummaryMobileProps {
  mealDetails: DayMealDetails;
  dateLabel: string;
  mealSlot: 'lunch' | 'dinner';
  pricing: OrderPricingBreakdown;
  selectedSlot?: DeliverySlot;
  selectedAddress?: CustomerAddress;
  currentStep: number;
  onContinue: () => void;
  isSubmitting?: boolean;
  isAvailable: boolean;
}

export const OrderSummaryMobile: React.FC<OrderSummaryMobileProps> = ({
  mealDetails,
  dateLabel,
  mealSlot,
  pricing,
  selectedSlot,
  selectedAddress,
  currentStep,
  onContinue,
  isSubmitting,
  isAvailable
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getButtonText = () => {
    if (isSubmitting) return 'Confirming...';
    if (!isAvailable) return 'Slot Closed';
    if (currentStep === 1) return 'Delivery →';
    if (currentStep === 2) return 'Payment →';
    return `Pay ₹${pricing.total}`;
  };

  return (
    <>
      {/* 1. Sticky Mobile Bottom Floating Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3.5 px-4 shadow-2xl safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Price & Expand Trigger */}
          <div 
            onClick={() => setIsSheetOpen(true)}
            className="cursor-pointer space-y-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-stone-900 font-mono">
                ₹{pricing.total}
              </span>
              <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span>View</span>
                <ChevronUp className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] text-stone-500 truncate max-w-[140px]">
              {pricing.quantity}x {mealSlot === 'lunch' ? 'Lunch' : 'Dinner'} • Free Delivery
            </p>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            id="btn-mobile-order-action"
            disabled={isSubmitting || !isAvailable}
            onClick={onContinue}
            className="py-3 px-6 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all"
          >
            <span>{getButtonText()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Slide-up Detail Bottom Sheet for Mobile */}
      {isSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {dateLabel} • {mealSlot === 'lunch' ? 'Lunch' : 'Dinner'}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">
                  {pricing.quantity}x {mealDetails.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>Home-Style Meal (×{pricing.quantity})</span>
                <span>₹{pricing.mealsSubtotal}</span>
              </div>

              {pricing.customizationLineItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-stone-600 pl-2 border-l-2 border-emerald-200">
                  <span>{item.label}</span>
                  <span className="font-medium text-stone-800">+₹{item.amount}</span>
                </div>
              ))}

              {pricing.addOnLineItems.map((addon, idx) => (
                <div key={idx} className="flex items-center justify-between text-stone-600 pl-2 border-l-2 border-amber-200">
                  <span>{addon.name} (×{addon.qty})</span>
                  <span className="font-medium text-stone-800">+₹{addon.total}</span>
                </div>
              ))}

              <div className="flex items-center justify-between text-stone-600 pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <span>Cluster Doorstep Delivery</span>
                  <span className="text-[9px] bg-emerald-100 text-[#0D6E44] px-1 py-0.2 rounded font-black">FREE</span>
                </span>
                <span className="font-black text-[#0D6E44]">₹0</span>
              </div>

              {selectedSlot && (
                <div className="p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Clock className="w-3.5 h-3.5 text-[#0D6E44]" />
                    <span>{selectedSlot.windowLabel}</span>
                  </span>
                  <span className="text-stone-500 font-semibold">Delivery Window</span>
                </div>
              )}
            </div>

            {/* Total Card in Sheet */}
            <div className="p-3.5 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block">Grand Total</span>
                <span className="text-xs text-emerald-400 font-bold">Inclusive of taxes</span>
              </div>
              <span className="text-2xl font-black text-amber-300 font-mono">
                ₹{pricing.total}
              </span>
            </div>

            {/* Primary Action Button inside Sheet */}
            <button
              type="button"
              disabled={isSubmitting || !isAvailable}
              onClick={() => {
                setIsSheetOpen(false);
                onContinue();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <span>{getButtonText()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  MapPin, 
  Utensils,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { OrderPricingBreakdown, DayMealDetails } from '../../services/orderCustomizationEngine';
import { CustomerAddress, DeliverySlot } from '../../types';

interface OrderSummaryDesktopProps {
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

export const OrderSummaryDesktop: React.FC<OrderSummaryDesktopProps> = ({
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
  const getButtonText = () => {
    if (isSubmitting) return 'Confirming Order...';
    if (!isAvailable) return 'Select Available Slot';
    if (currentStep === 1) return 'Continue to Delivery & Pay →';
    if (currentStep === 2) return 'Proceed to Payment →';
    return `Place Order • ₹${pricing.total}`;
  };

  return (
    <aside aria-label="Order summary breakdown" className="sticky top-24 bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
      {/* Header */}
      <div className="border-b border-stone-150 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Order Summary
          </span>
          <span className="text-xs font-bold text-stone-500">
            {dateLabel} • {mealSlot === 'lunch' ? 'Lunch' : 'Dinner'}
          </span>
        </div>
        <h3 className="text-lg font-black text-stone-900 mt-2">
          {pricing.quantity}x {mealDetails.title}
        </h3>
      </div>

      {/* Itemized Breakdown */}
      <div className="space-y-3 text-xs">
        {/* Base Meals */}
        <div className="flex items-center justify-between font-bold text-stone-900">
          <span>Home-Style Meal (×{pricing.quantity})</span>
          <span>₹{pricing.mealsSubtotal}</span>
        </div>

        {/* Customization Extra Lines */}
        {pricing.customizationLineItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-stone-600 pl-2 border-l-2 border-emerald-200">
            <span>{item.label}</span>
            <span className="font-medium text-stone-800">+₹{item.amount}</span>
          </div>
        ))}

        {/* Standalone Addons */}
        {pricing.addOnLineItems.map((addon, idx) => (
          <div key={idx} className="flex items-center justify-between text-stone-600 pl-2 border-l-2 border-amber-200">
            <span>{addon.name} (×{addon.qty})</span>
            <span className="font-medium text-stone-800">+₹{addon.total}</span>
          </div>
        ))}

        {/* Delivery Fee */}
        <div className="flex items-center justify-between text-stone-600 pt-2 border-t border-stone-100">
          <span className="flex items-center gap-1">
            <span>Cluster Doorstep Delivery</span>
            <span className="text-[10px] bg-emerald-100 text-[#0D6E44] px-1.5 py-0.2 rounded font-black">FREE</span>
          </span>
          <span className="font-black text-[#0D6E44]">₹0</span>
        </div>

        {/* Delivery Slot info if selected */}
        {selectedSlot && (
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-stone-800">
              <Clock className="w-3.5 h-3.5 text-[#0D6E44]" />
              <span>{selectedSlot.windowLabel}</span>
            </span>
            <span className="text-stone-400 font-mono">Slot</span>
          </div>
        )}

        {/* Delivery Address info if selected */}
        {selectedAddress && (
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#0D6E44] shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="font-bold text-stone-800 block truncate">{selectedAddress.label} • {selectedAddress.fullName}</span>
              <span className="text-stone-500 block truncate">{selectedAddress.addressLine}</span>
            </div>
          </div>
        )}
      </div>

      {/* Total Amount Card */}
      <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-1 shadow-inner">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Final Payable</span>
          <span>Inclusive of all taxes</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold text-emerald-400">Grand Total</span>
          <span className="text-3xl font-black text-amber-300 font-mono tracking-tight">
            ₹{pricing.total}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        id="btn-desktop-order-action"
        disabled={isSubmitting || !isAvailable}
        onClick={onContinue}
        className="w-full py-4 px-6 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] disabled:opacity-50 disabled:hover:bg-[#0D6E44] text-white font-black text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{getButtonText()}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Trust & Guarantee Badges */}
      <div className="space-y-2 pt-2 border-t border-stone-150">
        <div className="flex items-center gap-2 text-[11px] text-stone-600">
          <ShieldCheck className="w-4 h-4 text-[#0D6E44] shrink-0" />
          <span>FSSAI Certified • Fresh Groundnut Oil Guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-600">
          <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>Secure instant UPI / QR / COD verification</span>
        </div>
      </div>
    </aside>
  );
};

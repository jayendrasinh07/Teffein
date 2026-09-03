import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  ChefHat, 
  PackageCheck,
  Calendar,
  Utensils,
  Home
} from 'lucide-react';
import { OneTimeOrder } from '../../types';
import { useApp } from '../../context/AppContext';

interface OrderSuccessViewProps {
  order: OneTimeOrder;
  onOrderAnother: () => void;
  onTrackOrder: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  onOrderAnother,
  onTrackOrder
}) => {
  const { setActiveTab } = useApp();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400 py-4">
      {/* 1. Main Celebration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 text-[#0D6E44] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed 🎉
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            Your fresh meal is in the kitchen queue!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Order Reference: <strong className="text-stone-900 font-mono font-black">{order.id}</strong>
          </p>
        </div>

        {/* 2. Order Details Summary Snapshot */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
            <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#0D6E44]" />
              <span>{order.quantity}x {order.mealName}</span>
            </span>
            <span className="text-xs font-mono font-black text-stone-900">
              ₹{order.total}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#0D6E44] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Date & Window</span>
                <span>{order.scheduledDateLabel} ({order.deliverySlotLabel})</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#0D6E44] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Delivery Address</span>
                <span className="line-clamp-2">{order.address?.addressLine || 'Gandhinagar'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            id="success-track-order-btn"
            onClick={onTrackOrder}
            className="px-6 py-3.5 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-amber-300" />
            <span>Track Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="success-order-another-btn"
            onClick={onOrderAnother}
            className="px-5 py-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-stone-600" />
            <span>Order Another Meal</span>
          </button>

          <button
            type="button"
            id="success-back-home-btn"
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

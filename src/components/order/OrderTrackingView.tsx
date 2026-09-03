import React from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChefHat, 
  PackageCheck, 
  ShieldCheck, 
  ArrowLeft, 
  Utensils, 
  RotateCcw,
  Sparkles,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { OneTimeOrder } from '../../types';
import { useApp } from '../../context/AppContext';

interface OrderTrackingViewProps {
  order: OneTimeOrder;
  onBackToMenu: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onBackToMenu
}) => {
  const { setActiveTab } = useApp();

  // Status mapping
  const status = order.orderStatus?.toLowerCase() || 'confirmed';

  const isConfirmed = true;
  const isPreparing = ['preparing', 'packed', 'dispatched', 'out_for_delivery', 'delivered'].includes(status);
  const isPacked = ['packed', 'dispatched', 'out_for_delivery', 'delivered'].includes(status);
  const isOutForDelivery = ['dispatched', 'out_for_delivery', 'delivered'].includes(status);
  const isDelivered = status === 'delivered';

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 sm:px-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToMenu}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ordering</span>
        </button>

        <span className="text-xs font-bold text-stone-500">
          Live Order Status
        </span>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-lg space-y-6">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active One-Time Order
              </span>
              <span className="text-xs font-mono font-bold text-stone-500">
                #{order.id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 tracking-tight">
              {isDelivered ? 'Meal Delivered! Enjoy your food.' : isOutForDelivery ? 'Out for Delivery' : isPreparing ? 'Meal is Being Prepared' : 'Order Confirmed'}
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-500 block">Expected Arrival</span>
            <span className="text-sm sm:text-base font-black text-stone-900">
              {order.deliverySlotLabel || '12:00 PM – 12:30 PM'}
            </span>
          </div>
        </div>

        {/* 1. Visual Status Stepper */}
        <div className="py-4">
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Step 1: Confirmed */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-[#0D6E44] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black text-stone-900 block">Confirmed</span>
                <span className="text-[10px] text-stone-500">Queue #28</span>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isPreparing 
                  ? 'bg-[#0D6E44] text-white shadow-xs' 
                  : 'bg-stone-100 text-stone-400 border border-stone-200'
              }`}>
                <ChefHat className={`w-5 h-5 ${isPreparing && !isPacked ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <span className={`text-xs font-black block ${isPreparing ? 'text-stone-900' : 'text-stone-400'}`}>
                  Cooking
                </span>
                <span className="text-[10px] text-stone-500">Fresh Steam</span>
              </div>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isOutForDelivery 
                  ? 'bg-[#0D6E44] text-white shadow-xs' 
                  : 'bg-stone-100 text-stone-400 border border-stone-200'
              }`}>
                <Truck className={`w-5 h-5 ${isOutForDelivery && !isDelivered ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <span className={`text-xs font-black block ${isOutForDelivery ? 'text-stone-900' : 'text-stone-400'}`}>
                  In Transit
                </span>
                <span className="text-[10px] text-stone-500">Cluster Van</span>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isDelivered 
                  ? 'bg-[#0D6E44] text-white shadow-xs' 
                  : 'bg-stone-100 text-stone-400 border border-stone-200'
              }`}>
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-xs font-black block ${isDelivered ? 'text-stone-900' : 'text-stone-400'}`}>
                  Delivered
                </span>
                <span className="text-[10px] text-stone-500">Doorstep</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Order Information Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#0D6E44]" />
              <h3 className="text-sm font-black text-stone-900">
                {order.quantity}x {order.mealName}
              </h3>
            </div>
            <span className="text-sm font-mono font-black text-stone-900">
              ₹{order.total}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                Delivery Location
              </span>
              <p className="font-bold text-stone-900 leading-snug">
                {order.address?.fullName} ({order.address?.phone})
              </p>
              <p className="text-stone-600">
                {order.address?.addressLine || 'Gandhinagar'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                Kitchen Quality Log
              </span>
              <p className="text-stone-700">
                Pure Filtered Groundnut Oil • Zero Reused Oil
              </p>
              <p className="text-[#0D6E44] font-bold">
                ✓ Sealed Steam Tray with Thermal Insulation
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-bold transition-all text-center cursor-pointer"
          >
            Back to Home
          </button>

          <button
            type="button"
            onClick={onBackToMenu}
            className="px-5 py-2.5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Order Another Meal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

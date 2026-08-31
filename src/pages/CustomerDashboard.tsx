import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Pause, 
  Play, 
  SkipForward, 
  Sliders, 
  Utensils, 
  MapPin, 
  CheckCircle2, 
  Star, 
  QrCode, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  Plus,
  ShoppingBag
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { 
    subscription, 
    pauseSubscription, 
    resumeSubscription, 
    skipTomorrowMeal, 
    setActiveTab, 
    setIsFeedbackModalOpen,
    lookupMealTraceability,
    setIsSubscribeModalOpen,
    setIsOrderOnceModalOpen,
    oneTimeOrders
  } = useApp();

  const isPaused = subscription.status === 'paused';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const isTomorrowSkipped = subscription.skippedDates.includes(tomorrowStr);

  // Check for in-flight active one-time orders
  const activeOneTimeOrders = oneTimeOrders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                Verified Subscriber
              </span>
              <span className="text-xs text-stone-500 font-mono">ID: {subscription.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Namaste, {subscription.userName || 'Subscriber'}! 🙏
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Your {subscription.planName} is active in {subscription.deliveryAddress.area}, Gandhinagar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
            <button
              onClick={() => setIsOrderOnceModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>🍱</span>
              <span>Order Extra Meal</span>
            </button>

            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Rate Meal</span>
            </button>

            <button
              onClick={() => lookupMealTraceability('GDM-2841')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>Audit QR</span>
            </button>
          </div>
        </div>

        {/* Active In-flight Single Meal Orders Banner */}
        {activeOneTimeOrders.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#0A4D30] text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs uppercase font-black tracking-wider text-amber-300">
                  Live Single Meal In-Flight
                </span>
              </div>
              <button
                onClick={() => setActiveTab('order_history')}
                className="text-xs font-bold text-emerald-200 hover:text-white underline"
              >
                View Full Tracking
              </button>
            </div>

            {activeOneTimeOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300">#{order.id}</span>
                    <span className="text-xs text-white font-bold">{order.mealName} (x{order.quantity})</span>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-black uppercase">
                      {(order.orderStatus || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/80">
                    Window: {order.deliverySlotLabel} • Estimated: {order.estimatedDeliveryTime}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => lookupMealTraceability('GDM-2841')}
                    className="px-3.5 py-2 rounded-xl bg-white text-stone-900 text-xs font-bold hover:bg-stone-100 transition-colors"
                  >
                    Scan Kitchen QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Core Plan Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Active Plan Controls */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Subscription Status</span>
                  <h2 className="text-xl font-black text-stone-900">{subscription.planName}</h2>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    isPaused ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {isPaused ? 'Subscription Paused' : 'Active Routine'}
                  </span>
                </div>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Days Remaining</span>
                  <div className="text-3xl font-black text-[#107048] mt-1">
                    {subscription.daysRemaining} <span className="text-xs font-normal text-stone-500">Days</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Total {subscription.totalDays} Days Cycle</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Next Scheduled Meal</span>
                  <div className="text-base font-extrabold text-stone-900 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{isTomorrowSkipped ? 'Skipped (Credit Saved)' : isPaused ? 'On Pause' : 'Tomorrow • 12:30 PM'}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 capitalize">
                    {subscription.slot} ({(subscription.dietType || '').replace(/_/g, ' ')} Diet)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Delivery Address</span>
                  <div className="text-xs font-bold text-stone-900 mt-1 truncate">
                    {subscription.deliveryAddress.area}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    {subscription.deliveryAddress.sector}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
                {isPaused ? (
                  <button
                    onClick={resumeSubscription}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => pauseSubscription(3)}
                    className="py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause Plan</span>
                  </button>
                )}

                <button
                  onClick={() => skipTomorrowMeal(subscription.slot)}
                  disabled={isTomorrowSkipped}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    isTomorrowSkipped
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-300'
                  }`}
                >
                  <SkipForward className="w-4 h-4" />
                  <span>{isTomorrowSkipped ? 'Tomorrow Skipped' : 'Skip Tomorrow'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('meal_preferences')}
                  className="py-3 px-4 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Diet & Rotis</span>
                </button>

                <button
                  onClick={() => setActiveTab('todays_menu')}
                  className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Utensils className="w-4 h-4 text-emerald-700" />
                  <span>Weekly Menu</span>
                </button>
              </div>
            </div>

            {/* Today's Meal Preview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Today’s Fresh Thali
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">Kathiyawadi Ringan Olo & Sev Tameta</h3>
                </div>
                <button
                  onClick={() => lookupMealTraceability('GDM-2841')}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Audit ID #GDM-2841</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Rotis</span>
                  <span className="font-bold text-stone-800">
                    {subscription.portionSize === 'jumbo' ? '6 Phulkas' : subscription.portionSize === 'mini' ? '3 Phulkas' : '4 Soft Phulkas (Ghee)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Dal / Kadhi</span>
                  <span className="font-bold text-stone-800">Gujarati Toor Dal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Rice</span>
                  <span className="font-bold text-stone-800">Jeera Rice</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Chaas Add-on</span>
                  <span className="font-bold text-emerald-800">{subscription.addons.chaasDaily ? 'Included (Chilled)' : 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Order Once Ad */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍱</span>
                <h3 className="font-black text-sm text-stone-900">Want an extra meal today?</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hosting a friend or staying late at office? Order a single hot thali without modifying your monthly plan.
              </p>
              <button
                onClick={() => setIsOrderOnceModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Order Single Thali (₹119)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Delivery Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Delivery Address</span>
              </h3>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
                <div className="font-bold text-stone-900">{subscription.deliveryAddress.street}</div>
                <div>{subscription.deliveryAddress.area}, {subscription.deliveryAddress.sector}</div>
                <div>Gandhinagar, Gujarat - {subscription.deliveryAddress.pincode}</div>
                <div className="pt-2 text-[10px] text-emerald-800 font-bold">
                  Cluster Route: {subscription.deliveryAddress.clusterId.toUpperCase()} • Window: {subscription.deliveryAddress.deliveryTimeSlot}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('meal_preferences')}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Edit Delivery Address & Timing
              </button>
            </div>

            {/* Invoices & Quick History */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
              <h3 className="font-bold text-base text-stone-900">Recent Invoices</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">Invoice #RZB-2026-081</div>
                    <span className="text-[10px] text-stone-500">Paid on 10 Aug 2026</span>
                  </div>
                  <span className="font-black text-stone-900">₹1,425</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('order_history')}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full Order History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

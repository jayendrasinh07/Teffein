import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  QrCode, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RotateCcw, 
  Truck, 
  Utensils, 
  XCircle, 
  Plus,
  ShoppingBag
} from 'lucide-react';
import { OneTimeOrder } from '../types';

export const OrderHistoryPage: React.FC = () => {
  const { 
    setActiveTab, 
    lookupMealTraceability, 
    setIsFeedbackModalOpen,
    oneTimeOrders,
    reorderMeal,
    cancelOneTimeOrder,
    setIsOrderOnceModalOpen
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'one_time' | 'subscription'>('all');

  const subscriptionHistory: {id:string;date:string;slot:string;items:string;status:string;rating:number|null;temperature:string;van:string}[] = [];

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setActiveTab('customer_dashboard')}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customer Portal</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrderOnceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Order Single Meal</span>
            </button>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Your account orders
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md space-y-8">
          <div className="border-b border-stone-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Receipts & Traceability Logs
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                Order & Meal History
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Access your one-time meal orders, daily subscription dispatches, and QR quality audits.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'one_time', label: `Single Orders (${oneTimeOrders.length})` },
                { id: 'subscription', label: 'Subscription Log' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ================= ONE-TIME ORDERS SECTION ================= */}
          {(filterType === 'all' || filterType === 'one_time') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0D6E44]" />
                  <span>One-Time Fresh Meal Orders</span>
                </h2>
                <span className="text-xs text-stone-500 font-semibold">{oneTimeOrders.length} placed</span>
              </div>

              {oneTimeOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-3">
                  <Utensils className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-600 font-medium">No one-time meal orders yet.</p>
                  <button
                    onClick={() => setIsOrderOnceModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#0D6E44] text-white text-xs font-bold"
                  >
                    Place Your First Single Order
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {oneTimeOrders.map((order: OneTimeOrder) => {
                    const isCancellable = order.orderStatus === 'CONFIRMED' && order.paymentStatus === 'PENDING';
                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#0D6E44] bg-emerald-100 px-2 py-0.5 rounded">
                              #{order.orderNumber || order.id}
                            </span>
                            <span className="text-xs text-stone-500 font-semibold">
                              {order.scheduledDateLabel} ({order.mealSlot.toUpperCase()})
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              order.orderStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-900 animate-pulse'
                            }`}>
                              {(order.orderStatus || '').replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                              {order.paymentMethod} • {order.paymentStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-stone-900">
                              {order.mealName} (x{order.quantity})
                            </h3>
                            <span className="text-xs font-bold text-[#0D6E44]">• ₹{order.total}</span>
                          </div>

                          <div className="text-xs text-stone-600 space-y-0.5">
                            <p>
                              Spice: {order.customizations.spiceLevel} • Oil: {order.customizations.oilLevel}
                              {order.addOns.length > 0 && ` • Sides: ${order.addOns.map((a) => a.name).join(', ')}`}
                            </p>
                            <p className="text-[11px] text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#0D6E44]" />
                              <span>{order.address.addressLine}, {order.address.area}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto shrink-0">
                          {isCancellable && (
                            <button
                              onClick={() => cancelOneTimeOrder(order.id)}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}



                          <button
                            onClick={() => reorderMeal(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Order Again</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= SUBSCRIPTION DELIVERIES SECTION ================= */}
          {(filterType === 'all' || filterType === 'subscription') && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Daily Subscription Meal Dispatches</span>
                </h2>
                <span className="text-xs text-stone-500 font-semibold">Gandhinagar Cluster Routine</span>
              </div>

              <div className="space-y-3">
                {subscriptionHistory.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          #{order.id}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">{order.date}</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {order.status}
                        </span>
                        {order.temperature !== '-' && (
                          <span className="text-[10px] font-mono text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                            Temp: {order.temperature}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-stone-900">{order.slot}</h3>
                      <p className="text-xs text-stone-600">{order.items}</p>
                    </div>

                    <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
                      {order.status === 'Delivered' && (
                        <>
                          <button
                            onClick={() => lookupMealTraceability(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs font-bold text-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Audit QR</span>
                          </button>

                          <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{order.rating ? `${order.rating}/5 Rated` : 'Rate Meal'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

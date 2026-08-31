import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Utensils, 
  Pause, 
  DollarSign, 
  TrendingUp, 
  Truck, 
  ChefHat, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { DELIVERY_CLUSTERS, BRAND_CONFIG } from '../data/config';
import { OrderStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const { setActiveTab, oneTimeOrders, advanceOrderStatus } = useApp();

  const nextStatusMap: { [key in OrderStatus]?: OrderStatus } = {
    'CONFIRMED': 'PREPARING',
    'PREPARING': 'PACKED',
    'PACKED': 'DISPATCHED',
    'DISPATCHED': 'DELIVERED'
  };

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-[#132A1F] to-[#0A4E32] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-0.5 rounded border border-white/10">
                Gandhinagar Central Command
              </span>
              <span className="text-xs text-stone-300">Live Production Mode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              TEFFEIN Platform Operations
            </h1>
            <p className="text-xs text-stone-300">
              Real-time monitoring of kitchen production, delivery clusters, single orders, subscription churn & MRR.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kitchen_dashboard')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>Kitchen Console</span>
            </button>
            <button
              onClick={() => setActiveTab('delivery_dashboard')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Console</span>
            </button>
          </div>
        </div>

        {/* 4 Core Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase">
              <span>Active Subscribers</span>
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2">1,248</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% this week in Gandhinagar
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase">
              <span>Single Meal Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#0D6E44]" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2">{oneTimeOrders.length + 142}</div>
            <div className="text-[11px] text-[#0D6E44] font-semibold mt-1">
              {oneTimeOrders.filter(o => o.orderStatus !== 'DELIVERED').length} active in kitchen right now
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase">
              <span>Monthly Recurring Rev</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-black text-emerald-800 mt-2">₹29.8L</div>
            <div className="text-[11px] text-stone-500 mt-1">
              Avg ₹2,380 / subscriber / mo
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase">
              <span>Cluster On-Time Rate</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2">99.2%</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              Avg dispatch to drop: 19.4 mins
            </div>
          </div>
        </div>

        {/* Live One-Time Order Fulfillment Queue */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#0D6E44]" />
                <span>Live One-Time Orders Queue (Operations Console)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Advance kitchen steam preparation, tray packaging, van dispatch, and customer delivery in real-time.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {oneTimeOrders.length} Orders Loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase font-black tracking-wider text-[10px] bg-stone-50/80">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Meal & Details</th>
                  <th className="py-3 px-4">Slot & Area</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Advance Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {oneTimeOrders.map((o) => {
                  const nextStatus = nextStatusMap[o.orderStatus];
                  return (
                    <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0D6E44]">#{o.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block">{o.userName}</span>
                        <span className="text-[11px] text-stone-500">{o.userPhone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800 block">{o.mealName} (x{o.quantity})</span>
                        <span className="text-[10px] text-stone-500">
                          {o.customizations.spiceLevel} • {o.customizations.oilLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800 block">{o.deliverySlotLabel}</span>
                        <span className="text-[10px] text-stone-500">{o.address.area}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          o.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {nextStatus ? (
                          <button
                            onClick={() => advanceOrderStatus(o.id, nextStatus)}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-[#0D6E44] text-white text-[11px] font-bold transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Mark {nextStatus}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Complete</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cluster Logistics Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900">Active Delivery Cluster Loads</h3>
              <p className="text-xs text-stone-500">Live status of Gandhinagar morning dispatch fleet</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              4 Clusters Operating
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DELIVERY_CLUSTERS.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-xs uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    {c.id.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-stone-900">{c.totalActiveSubscribers} Subscribers</span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{c.name}</h4>
                <p className="text-[11px] text-stone-500">{c.assignedVans} Dedicated Vans • Lunch: {c.lunchDispatchTime}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                  <span>Dispatch Window: OK</span>
                  <span className="text-stone-400">100% Capacity</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Today's Kitchen Health Audit</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                <span>Steam Boiler Water RO TDS Check:</span>
                <span className="font-mono font-bold">14 PPM (Optimal)</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                <span>Groundnut Cooking Oil Virginity Score:</span>
                <span className="font-mono font-bold">100% Fresh (Zero Recycled)</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                <span>Tray Heat Seal Temperature:</span>
                <span className="font-mono font-bold">72.4°C (Verified Safe)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Customer Dietary Mix Distribution</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">Standard Gujarati Home Thali</span>
                <span className="font-bold text-stone-900">58% (724 Active)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[58%]" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-600 font-medium">Jain Satvik (No Root Veg / Onion)</span>
                <span className="font-bold text-stone-900">28% (350 Active)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[28%]" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-600 font-medium">Low-Oil Fit (Dry-Roasted / 3 Phulkas)</span>
                <span className="font-bold text-stone-900">14% (174 Active)</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[14%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

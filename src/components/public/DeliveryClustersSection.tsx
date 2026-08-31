import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DELIVERY_CLUSTERS } from '../../data/config';
import { MapPin, Truck, Clock, Users, CheckCircle2, Sparkles } from 'lucide-react';

export const DeliveryClustersSection: React.FC = () => {
  const { setIsAreaCheckerOpen, openCheckoutForPlan } = useApp();
  const [activeClusterId, setActiveClusterId] = useState<string>('cluster-a');

  const activeCluster = DELIVERY_CLUSTERS.find((c) => c.id === activeClusterId) || DELIVERY_CLUSTERS[0];

  return (
    <section id="delivery-clusters-section" className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#107048] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            Cluster Logistics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3 tracking-tight">
            Smart delivery. Less waiting.
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Gandhinagar is segmented into optimized delivery clusters. Dedicated vans run fixed morning & evening routes to eliminate 45-minute delivery delays.
          </p>
        </div>

        {/* Cluster Tabs / Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {DELIVERY_CLUSTERS.map((cluster) => {
            const isSelected = cluster.id === activeClusterId;
            return (
              <button
                key={cluster.id}
                onClick={() => setActiveClusterId(cluster.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/30 shadow-md'
                    : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {cluster.id.toUpperCase()}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{cluster.assignedVans} Vans</span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 leading-tight mt-1">{cluster.name}</h3>
                </div>
                <div className="mt-3 text-[11px] text-stone-500 font-medium">
                  {cluster.totalActiveSubscribers} active subscribers
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Cluster Visual Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Stylized Map View */}
          <div className="lg:col-span-6 bg-gradient-to-br from-stone-900 to-[#102B1F] rounded-2xl p-6 text-white relative overflow-hidden min-h-[280px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <MapPin className="w-3.5 h-3.5" /> Gandhinagar Cluster Grid Demo
              </span>
              <span className="text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 font-bold">
                Route Status: Optimal
              </span>
            </div>

            {/* Stylized Cluster Waypoint Graphic */}
            <div className="my-6 space-y-3">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="text-[10px] uppercase font-bold text-emerald-300">Hub Coverage Zone</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeCluster.hubZone}</div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeCluster.keySectors.map((sector, i) => (
                  <span key={i} className="text-[11px] bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700 text-stone-200">
                    📍 {sector}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-stone-400 font-mono">
              Avg Route Duration: {activeCluster.averageDeliveryDurationMinutes} mins from Central Steam Kitchen
            </div>
          </div>

          {/* Cluster Details */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Targeted Audience & Timings
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 mt-1">{activeCluster.name}</h3>
              <p className="text-xs text-stone-600 mt-1">{activeCluster.targetAudience}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">Lunch Dispatch Window:</span>
                  <span className="text-stone-600">{activeCluster.lunchDispatchTime}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">Dinner Dispatch Window:</span>
                  <span className="text-stone-600">{activeCluster.dinnerDispatchTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsAreaCheckerOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
              >
                Check My Pincode ({activeCluster.pincodes.join(', ')})
              </button>

              <button
                onClick={() => openCheckoutForPlan('half_month_15')}
                className="px-5 py-2.5 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-xs font-bold shadow-md transition-colors"
              >
                Start Delivery in this Cluster
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { LocationChecker } from '../components/public/LocationChecker';
import { DeliveryClustersSection } from '../components/public/DeliveryClustersSection';
import { GANDHINAGAR_AREAS } from '../data/config';
import { MapPin, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GandhinagarCoveragePage: React.FC = () => {
  const { openCheckoutForPlan } = useApp();

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#107048] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Gandhinagar City Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 mt-4 tracking-tight">
            Sectors & Neighborhoods We Serve
          </h1>
          <p className="text-stone-600 text-base mt-3 leading-relaxed">
            All our clusters enjoy 100% free delivery with pre-assigned meal vans and fixed arrival windows.
          </p>
        </div>

        {/* Location Checker Component */}
        <LocationChecker />

        {/* Cluster Logistics Breakdown */}
        <DeliveryClustersSection />

        {/* Complete Area Coverage Grid */}
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-stone-200">
          <h3 className="text-2xl font-bold text-stone-900 mb-6">Complete Sector Directory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GANDHINAGAR_AREAS.map((a, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900">{a.area}</h4>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {a.pincode}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{a.sector} • {a.cluster}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Lunch: {a.lunchSlot}</span>
                  <button
                    onClick={() => openCheckoutForPlan('monthly_30')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Subscribe →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

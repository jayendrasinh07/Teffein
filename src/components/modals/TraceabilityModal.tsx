import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ShieldCheck, 
  Thermometer, 
  Truck, 
  Sparkles,
  MapPin,
  Search
} from 'lucide-react';

export const TraceabilityModal: React.FC = () => {
  const { 
    isTraceabilityModalOpen, 
    setIsTraceabilityModalOpen, 
    activeTraceabilityMeal,
    lookupMealTraceability 
  } = useApp();

  const [inputMealId, setInputMealId] = useState('GDM-2841');

  if (!isTraceabilityModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookupMealTraceability(inputMealId);
  };

  const meal = activeTraceabilityMeal;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1C2621] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <QrCode className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  TEFFEIN Transparency Engine
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">Know Your Meal Traceability</h3>
              </div>
            </div>

            <button
              onClick={() => setIsTraceabilityModalOpen(false)}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-400 mt-2">
            Every daily tiffin is stamped with a unique QR code verifying real cooking timestamps, oil inspection, and hygiene compliance.
          </p>

          {/* Search ID Form */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMealId}
                onChange={(e) => setInputMealId(e.target.value)}
                placeholder="Scan or enter Meal ID (e.g. GDM-2841)"
                className="w-full bg-stone-900/90 text-white placeholder-stone-500 border border-stone-700 rounded-xl px-3.5 py-2 text-xs uppercase tracking-wider font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Traceability Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Identity Card */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase text-stone-500">Meal Identifier</div>
              <div className="text-xl font-black font-mono text-stone-900 text-emerald-800">{meal.mealId}</div>
              <div className="text-xs text-stone-600 mt-0.5">{meal.customerName}</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hygienically Packed & Delivered
              </span>
              <div className="text-[11px] text-stone-500 mt-1">Status: Verified at Doorstep</div>
            </div>
          </div>

          {/* 4-Stage Operational Timeline as requested in Section 11 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Preparation & Dispatch Timeline
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <div className="text-[10px] font-bold text-stone-500 uppercase">01. Prepared</div>
                <div className="text-base font-extrabold text-stone-900 mt-1">{meal.preparedTime}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Fresh Morning Batch</div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <div className="text-[10px] font-bold text-stone-500 uppercase">02. Packed</div>
                <div className="text-base font-extrabold text-stone-900 mt-1">{meal.packedTime}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Heat Sealed at 74°C</div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <div className="text-[10px] font-bold text-stone-500 uppercase">03. Dispatch</div>
                <div className="text-base font-extrabold text-stone-900 mt-1">{meal.dispatchTime}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Cluster Van Assigned</div>
              </div>

              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-emerald-200 uppercase">04. Delivered</div>
                <div className="text-base font-extrabold text-white mt-1">{meal.deliveredTime || '12:12 PM'}</div>
                <div className="text-[10px] text-emerald-100 font-medium">On-Time Doorstep</div>
              </div>
            </div>
          </div>

          {/* Quality & Kitchen Specs */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Kitchen Auditing & Safety Checks
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <ChefHat className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-stone-900">Head Cook in Charge</div>
                  <div className="text-stone-600">{meal.cookInCharge}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-stone-900">Quality Inspector</div>
                  <div className="text-stone-600">{meal.hygieneInspector}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <Thermometer className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-stone-900">Packing Temperature</div>
                  <div className="text-stone-600">{meal.temperatureAtPacking}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-stone-900">Cluster Partner</div>
                  <div className="text-stone-600">{meal.deliveryPartnerName} ({meal.clusterName})</div>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Contents */}
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs">
            <span className="font-bold text-amber-950 block mb-1">Items Contained in this Batch:</span>
            <div className="flex flex-wrap gap-1.5">
              {meal.menuSummary.map((item, idx) => (
                <span key={idx} className="bg-white px-2 py-1 rounded-lg border border-amber-200 text-stone-800 font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 text-right">
          <button
            onClick={() => setIsTraceabilityModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

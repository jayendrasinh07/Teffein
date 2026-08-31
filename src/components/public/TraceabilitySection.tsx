import React from 'react';
import { useApp } from '../../context/AppContext';
import { QrCode, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Thermometer } from 'lucide-react';
import { MOCK_TRACEABILITY_MEAL } from '../../data/config';

export const TraceabilitySection: React.FC = () => {
  const { lookupMealTraceability } = useApp();

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-stone-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Description */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5 text-amber-300" />
                <span>TEFFEIN Transparency & Traceability</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Scan. Verify. <br />
                <span className="text-emerald-400">Eat with Complete Peace of Mind.</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Every single TEFFEIN meal tray features a scannable QR verification stamp. Check the exact minute your meal left the tawa, packed temperature, chef in charge, and hygiene clearance.
              </p>

              <div className="pt-2 flex flex-col gap-2.5 text-xs sm:text-sm text-stone-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time timestamps: Prepared → Packed → Dispatched → Delivered</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Packing temperature (68°C+) & virgin oil verification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Certified FSSAI hygiene inspector sign-off</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  id="btn-open-traceability-demo"
                  onClick={() => lookupMealTraceability('GDM-2841')}
                  className="px-7 py-3.5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs sm:text-sm font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Inspect Sample Meal (ID: GDM-2841)</span>
                </button>
              </div>
            </div>

            {/* Right Interactive QR Card */}
            <div className="lg:col-span-6">
              <div className="bg-white text-stone-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0D6E44] flex items-center justify-center font-mono font-bold text-xs">
                      QR
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">Meal Passport ID</span>
                      <div className="text-base font-black font-mono text-[#0D6E44]">{MOCK_TRACEABILITY_MEAL.mealId}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-[#0D6E44] border border-emerald-200">
                    Live Verified
                  </span>
                </div>

                {/* Timestamps */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-600 font-semibold">Prepared:</span>
                    <span className="font-black text-stone-900">{MOCK_TRACEABILITY_MEAL.preparedTime}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-600 font-semibold">Packed:</span>
                    <span className="font-black text-stone-900">{MOCK_TRACEABILITY_MEAL.packedTime} ({MOCK_TRACEABILITY_MEAL.temperatureAtPacking})</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-600 font-semibold">Dispatch:</span>
                    <span className="font-black text-stone-900">{MOCK_TRACEABILITY_MEAL.dispatchTime} (Van #{MOCK_TRACEABILITY_MEAL.clusterId})</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <span className="font-bold">Delivered:</span>
                    <span className="font-black">{MOCK_TRACEABILITY_MEAL.deliveredTime}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Inspector: <strong>{MOCK_TRACEABILITY_MEAL.hygieneInspector}</strong></span>
                  <button
                    onClick={() => lookupMealTraceability('GDM-2841')}
                    className="text-[#0D6E44] font-black hover:underline cursor-pointer"
                  >
                    View Full Audit Sheet →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

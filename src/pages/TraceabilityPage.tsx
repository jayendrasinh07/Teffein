import React, { useState } from 'react';
import { TraceabilitySection } from '../components/public/TraceabilitySection';
import { useApp } from '../context/AppContext';
import { QrCode, Search, CheckCircle2, ShieldCheck, Thermometer, Flame, UserCheck } from 'lucide-react';
import { MOCK_TRACEABILITY_MEAL } from '../data/config';

export const TraceabilityPage: React.FC = () => {
  const { lookupMealTraceability } = useApp();
  const [mealIdInput, setMealIdInput] = useState('GDM-2841');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mealIdInput) {
      lookupMealTraceability(mealIdInput);
    }
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <TraceabilitySection />

        {/* Live Search Interactive Inspector Box */}
        <div className="max-w-3xl mx-auto bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md">
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#107048] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              Meal Certificate Lookup
            </span>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">
              Enter Meal Barcode / QR ID
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Sample IDs: GDM-2841, GDM-2842, GDM-2843 (Printed on top seal of your thali tray)
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative w-full">
              <QrCode className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mealIdInput}
                onChange={(e) => setMealIdInput(e.target.value)}
                placeholder="e.g. GDM-2841"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#107048] hover:bg-[#0A4E32] text-white font-bold rounded-2xl text-xs sm:text-sm shrink-0 shadow-md"
            >
              Verify Certificate
            </button>
          </form>

          {/* Demonstration Quick Badges */}
          <div className="mt-8 pt-6 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <Thermometer className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block text-stone-900">72°C Pack Temp</span>
              <span className="text-[10px] text-stone-500">Thermal Seal</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <UserCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block text-stone-900">Head Chef</span>
              <span className="text-[10px] text-stone-500">Maharaj Rameshwar</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block text-stone-900">Hygiene Pass</span>
              <span className="text-[10px] text-stone-500">Score 99.4/100</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="font-bold block text-stone-900">Oil Certified</span>
              <span className="text-[10px] text-stone-500">Cold Pressed Virgin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

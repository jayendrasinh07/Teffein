import React from 'react';
import { CorporateSection } from '../components/public/CorporateSection';
import { useApp } from '../context/AppContext';
import { Building2, FileText, CheckCircle2, Users, DollarSign, Sparkles } from 'lucide-react';

export const CorporatePage: React.FC = () => {
  const { setIsCorporateModalOpen } = useApp();

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <CorporateSection />

        {/* Enterprise Advantages */}
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Enterprise Benefits
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              Why GIFT City & Infocity Companies Choose TEFFEIN
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-700">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Consolidated Monthly Invoicing</h4>
              <p className="text-stone-500 leading-relaxed">
                Itemized GST invoice per cost center with exact breakdown of active staff vs skipped meal credits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Custom Dietary Splits</h4>
              <p className="text-stone-500 leading-relaxed">
                Seamlessly configure 60% Gujarati Thali, 25% Jain Satvik, and 15% Low-Oil Fit thalis in separate labeled crates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900">Zero Canteen Setup Capital</h4>
              <p className="text-stone-500 leading-relaxed">
                No expensive kitchen Capex or messy in-house cooking. Our insulated thermo-crates keep meals hot for 2.5 hours.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => setIsCorporateModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md"
            >
              Request Free Corporate Taste Tasting Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

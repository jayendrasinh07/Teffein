import React from 'react';
import { HealthQualitySection } from '../components/public/HealthQualitySection';
import { ShieldCheck, Award, Droplet, Sparkles, Check, CheckCircle2, Clock } from 'lucide-react';
import { BRAND_CONFIG } from '../data/config';

export const QualityStandardsPage: React.FC = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <HealthQualitySection />

        {/* 4 Pillars of Clean Food */}
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-stone-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 text-center mb-8">
            Our 4 Non-Negotiable Kitchen Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-stone-700">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Rule 1: Pure RO Water Only</div>
              <p className="text-stone-600 leading-relaxed">
                From dough kneading to dal simmering and vegetable rinsing, every milliliter of water passes through a 5-stage commercial reverse osmosis filtration unit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Rule 2: Never Re-used Cooking Oils</div>
              <p className="text-stone-600 leading-relaxed">
                We strictly ban recycled oil vats. Cold-pressed virgin oils are dosed per batch in calculated proportions, leaving zero greasy residue in your thali.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Rule 3: Zero Preservatives or Enhancers</div>
              <p className="text-stone-600 leading-relaxed">
                No artificial food dyes (tartrazine/sunset yellow), no synthetic tenderizers, and zero baking soda. Food is naturally delicious through traditional slow bhuna techniques.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Rule 4: Certified Daily Staff Temperature Logs</div>
              <p className="text-stone-600 leading-relaxed">
                All prep and packaging staff undergo biometric hygiene checks, temperature screening, and wear fresh food-grade gloves and double-layer hairnets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

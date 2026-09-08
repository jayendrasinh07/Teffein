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
            Planned Food-Safety Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-stone-700">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Control 1: Verified Safe Water</div>
              <p className="text-stone-600 leading-relaxed">
                Water sources, filtration and routine checks will be documented before commercial cooking begins.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Control 2: Cooking-Oil Records</div>
              <p className="text-stone-600 leading-relaxed">
                Oil type, supplier and batch-use rules will be documented and shown accurately for the live kitchen.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Control 3: Ingredient Disclosure</div>
              <p className="text-stone-600 leading-relaxed">
                Ingredient and allergen details will be reviewed and published for each live meal before customers order.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="font-extrabold text-emerald-800 text-base">Control 4: Daily Hygiene Logs</div>
              <p className="text-stone-600 leading-relaxed">
                Staff hygiene, cleaning and temperature-control checklists will be recorded for daily kitchen operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

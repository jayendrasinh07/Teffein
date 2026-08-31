import React from 'react';
import { MealPlansSection } from '../components/public/MealPlansSection';
import { MealCalculator } from '../components/public/MealCalculator';
import { MEAL_PLANS } from '../data/config';
import { Check, X, Sparkles, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export const MealPlansPage: React.FC = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-[#0D6E44] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Flexible Everyday Routine
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mt-4 tracking-tight">
            Eat better every day.
          </h1>
          <p className="text-stone-600 text-base mt-3 leading-relaxed">
            Wholesome home-style meals with up to 31% savings, free Gandhinagar cluster delivery, and 1-click pause protection.
          </p>
        </div>

        {/* Pricing Cards */}
        <MealPlansSection />

        {/* Comparison Table */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md overflow-x-auto">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Plan Comparison Matrix</h3>
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <th className="pb-3">Feature</th>
                <th className="pb-3">Daily Trial</th>
                <th className="pb-3">7-Day Weekly</th>
                <th className="pb-3">15-Day Semester</th>
                <th className="pb-3 text-emerald-800">Monthly Routine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              <tr>
                <td className="py-3 font-bold text-stone-900">Price per Meal</td>
                <td className="py-3">₹89</td>
                <td className="py-3">₹85</td>
                <td className="py-3">₹82</td>
                <td className="py-3 font-black text-emerald-800 text-sm">₹76</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-stone-900">Pause Rollover Days</td>
                <td className="py-3 text-stone-400">None</td>
                <td className="py-3">Up to 2 days</td>
                <td className="py-3">Up to 5 days</td>
                <td className="py-3 font-bold text-emerald-800">Up to 10 days</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-stone-900">Dietary Switch (Jain / Low-Oil)</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes (Per meal)</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-stone-900">Free Gandhinagar Delivery</td>
                <td className="py-3">Included</td>
                <td className="py-3">Included</td>
                <td className="py-3">Included</td>
                <td className="py-3 font-bold text-emerald-800">Included</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-stone-900">QR Meal Traceability</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cost Calculator */}
        <MealCalculator />
      </div>
    </div>
  );
};

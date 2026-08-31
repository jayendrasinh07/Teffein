import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Flame, ThermometerSun, CheckCircle2, Clock, Leaf, AlertCircle, RefreshCw } from 'lucide-react';
import { WEEKLY_MENU } from '../data/config';

export const KitchenDashboard: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [activeShift, setActiveShift] = useState<'lunch' | 'dinner'>('lunch');

  const handleMarkBatchPacked = (batchName: string) => {
    showToast('Batch Status Updated', `${batchName} has been heat-sealed and transferred to Van Loading Bay.`, 'success');
  };

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E2923] to-[#123E2A] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 bg-black/40 px-2.5 py-0.5 rounded border border-white/10">
                Maharaj Rameshwar • Head Kitchen Lead
              </span>
              <span className="text-xs text-stone-300">Central Kitchen Gandhinagar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Live Kitchen Steam Production Console
            </h1>
            <p className="text-xs text-stone-300">
              Shift targets, live phulka counts, Jain vessel isolation & thermal packaging checks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveShift('lunch')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeShift === 'lunch'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Lunch Shift (720 Meals)
            </button>
            <button
              onClick={() => setActiveShift('dinner')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeShift === 'dinner'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Dinner Shift (362 Meals)
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Total Phulkas to Toss</span>
            <div className="text-3xl font-black text-stone-900 mt-1">2,880</div>
            <span className="text-[10px] text-emerald-700 font-bold">2,140 tossed • 740 remaining</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Jain Satvik Portions</span>
            <div className="text-3xl font-black text-amber-600 mt-1">202 Thalis</div>
            <span className="text-[10px] text-stone-500">Dedicated green-marked vats</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Standard Gujarati</span>
            <div className="text-3xl font-black text-[#107048] mt-1">418 Thalis</div>
            <span className="text-[10px] text-stone-500">Full sweet-sour dal spice balance</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Low-Oil Fit Count</span>
            <div className="text-3xl font-black text-sky-700 mt-1">100 Thalis</div>
            <span className="text-[10px] text-stone-500">Dry-roasted, 3 ungreased phulkas</span>
          </div>
        </div>

        {/* Live Batches Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900">Today's Steam Batches & Packing Status</h3>
              <p className="text-xs text-stone-500">Scheduled for 11:30 AM dispatch to Gandhinagar vans</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Kitchen Clock: 11:15 AM
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'BATCH-01',
                cluster: 'Cluster A (Kudasan / PDPU / Bhaijipura)',
                meals: 280,
                status: 'Packing in Progress',
                temp: '73.2°C',
                chef: 'Chef Naresh'
              },
              {
                id: 'BATCH-02',
                cluster: 'Cluster B (Infocity / Sector 1-10)',
                meals: 210,
                status: 'Heat Sealed & Ready',
                temp: '74.5°C',
                chef: 'Maharaj Rameshwar'
              },
              {
                id: 'BATCH-03',
                cluster: 'Cluster C (GIDC Sector 24-28 Industrial)',
                meals: 130,
                status: 'Heat Sealed & Ready',
                temp: '71.8°C',
                chef: 'Chef Haresh'
              },
              {
                id: 'BATCH-04',
                cluster: 'Cluster D (GIFT City SEZ Offices)',
                meals: 100,
                status: 'Simmering in Steam Vat',
                temp: '88.0°C',
                chef: 'Chef Alpesh'
              }
            ].map((batch) => (
              <div
                key={batch.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {batch.id}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900">{batch.cluster}</h4>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-3">
                    <span>{batch.meals} Meals</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{batch.chef}</span>
                    <span>•</span>
                    <span className="text-stone-700 font-mono">Temp: {batch.temp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    batch.status.includes('Ready') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {batch.status}
                  </span>

                  <button
                    onClick={() => handleMarkBatchPacked(batch.id)}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                  >
                    Confirm Ready
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

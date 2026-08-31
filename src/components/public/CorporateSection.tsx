import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  FileSpreadsheet,
  Users,
  ShieldCheck
} from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const CorporateSection: React.FC = () => {
  const { setIsCorporateModalOpen } = useApp();

  return (
    <section id="corporate-section" className="py-16 sm:py-24 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 text-[#0D6E44] text-xs font-black uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>TEFFEIN for Teams & Enterprises</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              Better meals for <br />
              <span className="text-[#0D6E44]">better workdays.</span>
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Leading teams across GIFT City, Infocity, and manufacturing plants in Sector 24-28 GIDC partner with TEFFEIN for scheduled, hygienic employee catering. Boost focus and eliminate the daily food ordering scramble.
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-stone-700 font-medium">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D6E44] shrink-0 mt-0.5" />
                <span><strong>Shift-Synchronized Delivery:</strong> Food crates arrive right at 12:00 PM for industrial sirens or 1:00 PM for tech teams.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D6E44] shrink-0 mt-0.5" />
                <span><strong>Automated Skip Tracking:</strong> Remote employees or travelers mark skips on their app so your company is never billed for unused meals.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D6E44] shrink-0 mt-0.5" />
                <span><strong>Dietary Inclusivity:</strong> 100% separate Jain Satvik preparation, low-oil options, and consolidated monthly GST invoices.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-request-corporate-demo"
                onClick={() => setIsCorporateModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Request Corporate Partnership</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* Right Live Simulated Corporate Dashboard Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#1C2621] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-800">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                    Live HR Portal Preview
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">FinTech Pulse Technologies (GIFT SEZ)</h4>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/60 font-mono font-bold">
                  Enterprise Tier
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Employees</span>
                  <div className="text-2xl font-black text-white mt-1">150</div>
                  <span className="text-[10px] text-stone-500">Enrolled Staff</span>
                </div>

                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Meals Today</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">127</div>
                  <span className="text-[10px] text-stone-500">Active Lunches</span>
                </div>

                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Skipped</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">18</div>
                  <span className="text-[10px] text-stone-500">WFH / Travel Credits</span>
                </div>

                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Delivered</span>
                  <div className="text-2xl font-black text-white mt-1">127</div>
                  <span className="text-[10px] text-emerald-400 font-medium">100% Punctual</span>
                </div>

                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800 sm:col-span-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Average Staff Rating</span>
                  <div className="text-2xl font-black text-amber-300 mt-1 flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span>4.7 / 5.0</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Based on 1,480+ team meal reviews</span>
                </div>
              </div>

              {/* Quick actions for corporate demo */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>GST Invoice #INV-2026-081 Ready</span>
                </span>

                <button
                  onClick={() => setIsCorporateModalOpen(true)}
                  className="text-emerald-400 font-bold hover:text-emerald-300 cursor-pointer"
                >
                  Configure Team Catering →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

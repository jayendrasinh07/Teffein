import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Users, Utensils, SkipForward, Star, FileText, CheckCircle2, DollarSign } from 'lucide-react';

export const CorporateAdminDashboard: React.FC = () => {
  const { showToast } = useApp();

  const handleDownloadInvoice = () => {
    showToast('Invoice Downloaded', 'GST Invoice #INV-2026-081 has been generated as PDF.', 'success');
  };

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-[#18233C] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 bg-black/40 px-2.5 py-0.5 rounded border border-white/10">
                Corporate HR & Facilities Console
              </span>
              <span className="text-xs text-stone-300">GIFT City SEZ Client</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              FinTech Pulse Technologies — Employee Meals
            </h1>
            <p className="text-xs text-stone-300">
              Live employee attendance meal billing, skip reconciliation & dietary split manager.
            </p>
          </div>

          <button
            onClick={handleDownloadInvoice}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-stone-950 text-xs font-extrabold shadow-md transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Download Monthly GST Invoice</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Total Enrolled Employees</span>
            <div className="text-3xl font-black text-stone-900 mt-1">150</div>
            <span className="text-[10px] text-stone-500">GIFT Tower 2, Floor 8</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Meals Dispatched Today</span>
            <div className="text-3xl font-black text-emerald-800 mt-1">127 Thalis</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Arrival at 12:45 PM</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">WFH / Travel Skips</span>
            <div className="text-3xl font-black text-amber-600 mt-1">18 Skips</div>
            <span className="text-[10px] text-emerald-700 font-bold">₹1,224 Credit Applied</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400">Avg Employee Rating</span>
            <div className="text-3xl font-black text-amber-500 mt-1 flex items-center gap-1">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>4.6 / 5.0</span>
            </div>
            <span className="text-[10px] text-stone-500">1,480+ team reviews</span>
          </div>
        </div>

        {/* Dietary Split Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
          <h3 className="font-bold text-base text-stone-900 mb-4">Today’s Shift Crate Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950 text-sm">Crate A: Regular Gujarati Thali</div>
              <div className="text-2xl font-black text-emerald-900 mt-2">78 Thalis</div>
              <p className="text-[11px] text-emerald-800 mt-1">4 Phulkas with Ghee • Ringan Olo • Toor Dal</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950 text-sm">Crate B: Jain Satvik Thali</div>
              <div className="text-2xl font-black text-amber-900 mt-2">32 Thalis</div>
              <p className="text-[11px] text-amber-800 mt-1">Zero Root Veg • Dudhi Chana • Jain Kadhi</p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950 text-sm">Crate C: Low-Oil Fit Thali</div>
              <div className="text-2xl font-black text-sky-900 mt-2">17 Thalis</div>
              <p className="text-[11px] text-sky-800 mt-1">3 Ungreased Phulkas • Steamed Sprouts • Chaas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

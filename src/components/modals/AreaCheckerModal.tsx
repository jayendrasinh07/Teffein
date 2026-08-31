import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, CheckCircle2, Clock, Truck, Sparkles, Search, AlertCircle } from 'lucide-react';
import { GANDHINAGAR_AREAS } from '../../data/config';

export const AreaCheckerModal: React.FC = () => {
  const { isAreaCheckerOpen, setIsAreaCheckerOpen, setIsSubscribeModalOpen } = useApp();

  const [query, setQuery] = useState('PDPU');
  const [hasSearched, setHasSearched] = useState(true);
  const [matchedArea, setMatchedArea] = useState(GANDHINAGAR_AREAS[2]); // Bhaijipura / PDPU

  if (!isAreaCheckerOpen) return null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase();
    const match = GANDHINAGAR_AREAS.find(
      (a) =>
        a.area.toLowerCase().includes(clean) ||
        a.sector.toLowerCase().includes(clean) ||
        a.pincode.includes(clean)
    );

    if (match) {
      setMatchedArea(match);
    } else {
      // default to Infocity
      setMatchedArea(GANDHINAGAR_AREAS[0]);
    }
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#107048] to-[#0A4E32] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                  Gandhinagar Service Coverage
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">Check Delivery Availability</h3>
              </div>
            </div>

            <button
              onClick={() => setIsAreaCheckerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-emerald-100 mt-2">
            Currently serving selected clusters in Gandhinagar with zero delivery fee.
          </p>

          {/* Search Form */}
          <form onSubmit={handleCheck} className="mt-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Sector, Area (e.g. Infocity, Kudasan, GIFT, Sector 25)"
              className="w-full bg-white text-stone-900 placeholder-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Check</span>
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {hasSearched && matchedArea && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{matchedArea.area}</h4>
                      <p className="text-xs text-stone-600">{matchedArea.sector} • Pincode: {matchedArea.pincode}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Delivery Active
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Lunch Delivery Slot:</span>
                    <span className="font-extrabold text-stone-900">{matchedArea.lunchSlot}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Dinner Delivery Slot:</span>
                    <span className="font-extrabold text-stone-900">{matchedArea.dinnerSlot}</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Assigned: {matchedArea.cluster} ({matchedArea.activeUsers} active daily subscribers)</span>
                </div>
              </div>

              {/* Quick List of Covered Zones */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  All Active Gandhinagar Clusters:
                </h5>
                <div className="space-y-1.5 text-xs">
                  {GANDHINAGAR_AREAS.slice(0, 5).map((a, idx) => (
                    <div
                      key={idx}
                      onClick={() => setMatchedArea(a)}
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-stone-800">{a.area} ({a.pincode})</span>
                      <span className="text-emerald-700 font-bold">{a.lunchSlot}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal CTA */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">Free delivery included on all plans</span>
          <button
            onClick={() => {
              setIsAreaCheckerOpen(false);
              setIsSubscribeModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Start Plan in this Area</span>
          </button>
        </div>
      </div>
    </div>
  );
};

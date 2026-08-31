import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Search, CheckCircle2, Truck, Clock, Navigation, AlertCircle } from 'lucide-react';
import { GANDHINAGAR_AREAS } from '../../data/config';
import { checkAreaServiceability } from '../../services/locationService';

export const LocationChecker: React.FC = () => {
  const { 
    openCheckoutForPlan, 
    detectUserLocation, 
    locationState,
    detectedLocation,
    selectDeliveryAddress
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState(GANDHINAGAR_AREAS[0]);

  const filteredAreas = search.trim()
    ? GANDHINAGAR_AREAS.filter(
        (a) =>
          a.area.toLowerCase().includes(search.toLowerCase()) ||
          a.sector.toLowerCase().includes(search.toLowerCase()) ||
          a.pincode.includes(search)
      )
    : GANDHINAGAR_AREAS;

  const handleTriggerGps = async () => {
    const loc = await detectUserLocation();
    if (loc && loc.isServiceable) {
      const match = GANDHINAGAR_AREAS.find((a) => a.area.toLowerCase().includes(loc.area.toLowerCase()) || a.sector.toLowerCase().includes(loc.area.toLowerCase()));
      if (match) {
        setSelectedArea(match);
      }
    }
  };

  return (
    <section id="location-checker-section" className="py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#0D6E44] bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-200">
            Gandhinagar Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mt-3 tracking-tight">
            Serving Gandhinagar Sectors 1–30, GIFT City & Infocity
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            Check doorstep delivery availability in your sector, student PG, or corporate tech park.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-5">
          
          {/* Top Controls: Search + Auto-detect GPS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Sector, Kudasan, GIFT City, PDPU, Infocity..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44] bg-stone-50"
              />
            </div>

            <button
              type="button"
              onClick={handleTriggerGps}
              disabled={locationState === 'requesting' || locationState === 'detecting'}
              className="px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#0D6E44] text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${locationState === 'detecting' ? 'animate-spin' : ''}`} />
              <span>{locationState === 'detecting' ? 'Detecting Sector...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {/* GPS Detected Status Alert if present */}
          {detectedLocation && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Detected: <strong>{detectedLocation.displayName}</strong></span>
              </div>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded">
                {detectedLocation.serviceability?.deliveryFee === 0 ? 'Free Delivery' : `₹${detectedLocation.serviceability?.deliveryFee} fee`}
              </span>
            </div>
          )}

          {/* Area List Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {filteredAreas.map((area, idx) => {
              const isSelected = selectedArea.area === area.area;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedArea(area)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-[#0D6E44] bg-emerald-50/70 ring-2 ring-[#0D6E44]/20 shadow-2xs'
                      : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#0D6E44]' : 'text-stone-400'}`} />
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{area.area}</h4>
                      <p className="text-[11px] text-stone-500">{area.sector} • {area.pincode}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-[#0D6E44] shrink-0">
                    Active
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Area Banner */}
          {selectedArea && (
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-600 space-y-1 text-center sm:text-left">
                <div className="font-black text-stone-900 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6E44]" />
                  <span>{selectedArea.area} is actively served with free delivery!</span>
                </div>
                <div className="text-stone-500 text-[11px]">
                  Lunch slot: <strong>{selectedArea.lunchSlot}</strong> • Dinner slot: <strong>{selectedArea.dinnerSlot}</strong>
                </div>
              </div>

              <button
                onClick={() => openCheckoutForPlan('monthly_30')}
                className="px-5 py-2.5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black shadow-sm transition-all shrink-0 cursor-pointer"
              >
                Subscribe in {selectedArea.area}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

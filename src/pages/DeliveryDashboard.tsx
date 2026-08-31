import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, MapPin, Clock, Users, ShieldCheck, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { DELIVERY_CLUSTERS } from '../data/config';

export const DeliveryDashboard: React.FC = () => {
  const { showToast } = useApp();

  const handleSimulateDelivery = (vanId: string) => {
    showToast('Delivery Update', `${vanId} marked 12 drop stops completed on time!`, 'success');
  };

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-[#122A1E] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-0.5 rounded border border-white/10">
                Gandhinagar Cluster Dispatch Fleet
              </span>
              <span className="text-xs text-stone-300">Live GPS Status</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Delivery Logistics & Van Route Manager
            </h1>
            <p className="text-xs text-stone-300">
              Assigned routes, timing compliance & cluster drop rates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-3 py-1.5 rounded-xl">
              100% Fleets on Schedule
            </span>
          </div>
        </div>

        {/* 4 Fleet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              vanId: 'Van #01',
              driver: 'Hasmukh Bhai',
              phone: '+91 98251 XXXXX',
              cluster: 'Cluster A (PDPU / Kudasan)',
              stops: 38,
              completed: 34,
              status: 'En Route',
              eta: '12:10 PM'
            },
            {
              vanId: 'Van #02',
              driver: 'Pravin Patel',
              phone: '+91 98252 XXXXX',
              cluster: 'Cluster B (Infocity / Sec 1-10)',
              stops: 42,
              completed: 40,
              status: 'En Route',
              eta: '12:15 PM'
            },
            {
              vanId: 'Van #03',
              driver: 'Manish Rawat',
              phone: '+91 98253 XXXXX',
              cluster: 'Cluster C (GIDC Sector 24-28)',
              stops: 28,
              completed: 28,
              status: 'All Drops Complete',
              eta: 'Finished 11:58 AM'
            },
            {
              vanId: 'Van #04',
              driver: 'Dharmesh Joshi',
              phone: '+91 98254 XXXXX',
              cluster: 'Cluster D (GIFT City SEZ)',
              stops: 18,
              completed: 18,
              status: 'All Drops Complete',
              eta: 'Finished 12:05 PM'
            }
          ].map((van, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                    {van.vanId}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    van.status.includes('Complete') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {van.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 mt-2">{van.cluster}</h3>
                <p className="text-xs text-stone-500">Driver: {van.driver} ({van.phone})</p>

                <div className="mt-4 pt-3 border-t border-stone-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Completed Stops:</span>
                    <span className="font-bold text-stone-900">{van.completed} / {van.stops}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{ width: `${(van.completed / van.stops) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold pt-1">
                    <span>Target ETA:</span>
                    <span>{van.eta}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSimulateDelivery(van.vanId)}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-[#107048] text-white text-xs font-bold transition-colors"
              >
                Log Checkpoint
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, GraduationCap, Briefcase, Building2 } from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const HomeMadeForEveryday: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            For Gandhinagar
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">
            Made for your everyday
          </h2>
          <p className="text-stone-500 text-sm mt-1 font-medium">
            Designed around the daily routines of students, working professionals, and teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: STUDENTS */}
          <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <SmartImage
                  src={IMAGES.segments.student}
                  alt="Student having healthy meals in PG near PDPU, DA-IICT, NIFT"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>STUDENTS</span>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="text-lg font-black text-stone-900">
                  College & PG Life
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Home-style food for everyday campus and PG life near PDPU, DA-IICT, NIFT, and GNLU with semester discounts.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                id="segment-btn-students"
                onClick={() => {
                  setActiveTab('students');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-[#0D6E44] text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Student Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: WORKERS */}
          <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <SmartImage
                  src={IMAGES.segments.worker}
                  alt="Industrial and IT professionals on shift lunch break in Infocity"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
                  <span>WORKERS</span>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="text-lg font-black text-stone-900">
                  Shift & Office Routines
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Reliable meals around your workday in Infocity, Sector 28 GIDC, and GIFT City corridors.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                id="segment-btn-workers"
                onClick={() => {
                  setActiveTab('order_once');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-[#0D6E44] text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Order a Meal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: COMPANIES */}
          <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <SmartImage
                  src={IMAGES.segments.corporate}
                  alt="Corporate team lunch program in GIFT City office"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-sky-300" />
                  <span>COMPANIES</span>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="text-lg font-black text-stone-900">
                  Teams & Factories
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Meal programs for teams and factories. Scheduled hot delivery, GST invoicing, and custom dietary splits.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                id="segment-btn-corporate"
                onClick={() => {
                  setActiveTab('corporate');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-[#0D6E44] text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

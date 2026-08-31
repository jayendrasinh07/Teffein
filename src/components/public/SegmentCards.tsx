import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, HardHat, Building2, ArrowRight, Check } from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const SegmentCards: React.FC = () => {
  const { setActiveTab, setIsCorporateModalOpen } = useApp();

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 text-[#0D6E44] text-xs font-black uppercase tracking-wider mb-3">
            <span>Built For Gandhinagar's People</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Tailored for your daily schedule & lifestyle
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            From PDPU/DA-IICT college hostels to GIDC factory shift sirens and GIFT City corporate desks.
          </p>
        </div>

        {/* 3 Large Image-Led Immersive Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* 1. STUDENTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl border border-stone-200/90 flex flex-col justify-between transition-all group hover:-translate-y-1 overflow-hidden">
            <div>
              {/* Photo Showcase */}
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-200/80 mb-5 relative">
                <SmartImage
                  src={IMAGES.segments.studentEating}
                  alt="Student eating healthy home meal in PG"
                  aspectRatio="auto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>STUDENTS & PGS</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                Ghar jaisa khana, hostel/PG life ke liye.
              </h3>

              <p className="text-xs sm:text-sm text-stone-500 mt-2.5 leading-relaxed">
                Exam periods, long lectures, and PG living in Kudasan or Bhaijipura. Wholesome home meals without relying on junk food.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-700 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0D6E44] shrink-0" />
                  <span>Affordable student plans from ₹76/meal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0D6E44] shrink-0" />
                  <span>Pause anytime when visiting home on weekends</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0D6E44] shrink-0" />
                  <span>Complimentary chilled Chaas on hot afternoons</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-stone-100">
              <button
                id="btn-explore-student-plans"
                onClick={() => setActiveTab('students')}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-[#0D6E44] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Explore Student Plan</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* 2. WORKERS & EMPLOYEES */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl border border-stone-200/90 flex flex-col justify-between transition-all group hover:-translate-y-1 overflow-hidden">
            <div>
              {/* Photo Showcase */}
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-200/80 mb-5 relative">
                <SmartImage
                  src={IMAGES.segments.workerMeal}
                  alt="Industrial workers meal break"
                  aspectRatio="auto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>WORKERS & FACTORY TEAMS</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                Shift ke beech reliable daily meal.
              </h3>

              <p className="text-xs sm:text-sm text-stone-500 mt-2.5 leading-relaxed">
                Punctually timed for 12:00 PM factory sirens in Sector 24-28 GIDC & tech routines in Infocity. Heavy appetite, clean fuel.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-700 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0D6E44] shrink-0" />
                  <span>Guaranteed arrival before shift sirens</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0D6E44] shrink-0" />
                  <span>Low-oil preparation to prevent afternoon slump</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0D6E44] shrink-0" />
                  <span>Spill-proof heat-sealed hygienic lunch boxes</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-stone-100">
              <button
                id="btn-view-worker-plans"
                onClick={() => setActiveTab('workers')}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-[#0D6E44] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Explore Worker Plan</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* 3. COMPANIES & OFFICES */}
          <div className="bg-gradient-to-br from-[#1A2620] to-[#0E1F18] text-white rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl border border-stone-800 flex flex-col justify-between transition-all group hover:-translate-y-1 overflow-hidden">
            <div>
              {/* Photo Showcase */}
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-700/80 mb-5 relative">
                <SmartImage
                  src={IMAGES.segments.corporate}
                  alt="Office team having healthy corporate lunch"
                  aspectRatio="auto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-stone-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>COMPANIES & GIFT CITY</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Healthy meals for your entire team.
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 mt-2.5 leading-relaxed">
                Provide employees with subsidized, wholesome daily catering. Thermo-crates, consolidated GST billing, and live HR dashboard.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-200 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subsidized corporate pricing from ₹68/meal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bulk temperature-controlled thermo delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live portal for HR employee headcount & ratings</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-stone-700/80">
              <button
                id="btn-corporate-partnership"
                onClick={() => setIsCorporateModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Corporate Partnership</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

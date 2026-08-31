import React from 'react';
import { 
  CheckCircle2, 
  Award,
  Sparkles,
  ShieldCheck,
  Flame,
  Droplet
} from 'lucide-react';
import { BRAND_CONFIG } from '../../data/config';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const HealthQualitySection: React.FC = () => {
  const standards = [
    {
      title: 'Fresh Market Ingredients',
      desc: 'Morning farm produce sourced daily from local Gandhinagar mandis. Triple washed and ozone sanitized prior to steam preparation.',
      tag: 'Zero Pesticides'
    },
    {
      title: 'Controlled Virgin Oil',
      desc: 'Measured spoonfuls of cold-pressed groundnut & mustard oil. Never reused, never deep-fried in palm oil or hydrogenated vanaspati.',
      tag: 'Zero Palm Oil'
    },
    {
      title: 'Balanced Everyday Portions',
      desc: 'Formulated for daily sustained energy with balanced complex carbs (MP Sharbati wheat), clean lentils, and fiber rich seasonal sabjis.',
      tag: 'Sustained Energy'
    },
    {
      title: 'Hygienic Steam Kitchen',
      desc: 'Cooked in our FSSAI-compliant central facility with RO filtered water, stainless steel vats, and strict hairnet & glove protocols.',
      tag: 'FSSAI Certified'
    },
    {
      title: '100% Spill-Proof Packaging',
      desc: 'Food-grade heat-sealed recyclable meal trays keeping phulkas soft and curries intact throughout cluster van delivery.',
      tag: 'Heat Sealed'
    },
    {
      title: 'Zero Unnecessary Additives',
      desc: 'No artificial food colors, no baking soda for fake fluffiness, and zero synthetic MSG or heavy restaurant cream gravies.',
      tag: 'Pure Satvik Style'
    }
  ];

  return (
    <section id="health-quality-section" className="py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 text-[#0D6E44] text-xs font-black uppercase tracking-wider mb-3">
            <span>Operational Hygiene & Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Food you can feel good about eating <br />
            <span className="text-[#0D6E44]">every single day.</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Every operational process is designed around long-term daily wellness rather than heavy restaurant indulgences.
          </p>
        </div>

        {/* Visual Highlights Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-stone-200/80 h-64 group">
            <SmartImage
              src={IMAGES.quality.kitchenClean}
              alt="Stainless steel hygienic commercial kitchen"
              aspectRatio="auto"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Kitchen Hygiene</span>
              <h4 className="text-base font-black">All-Stainless Steel Facility</h4>
              <p className="text-xs text-stone-300 mt-0.5">RO water filtration & automated steam cooking</p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-md border border-stone-200/80 h-64 group">
            <SmartImage
              src={IMAGES.quality.spicesGrains}
              alt="Authentic whole Indian spices and whole wheat grains"
              aspectRatio="auto"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-[10px] uppercase font-bold text-amber-400">Pure Grains & Spices</span>
              <h4 className="text-base font-black">100% MP Sharbati Whole Wheat</h4>
              <p className="text-xs text-stone-300 mt-0.5">Cold-pressed groundnut oil & unadulterated spices</p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-md border border-stone-200/80 h-64 group">
            <SmartImage
              src={IMAGES.journey.step4_packing}
              alt="Hygienic food packaging and meal sealing"
              aspectRatio="auto"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Safe Delivery</span>
              <h4 className="text-base font-black">Heat-Sealed Meal Trays</h4>
              <p className="text-xs text-stone-300 mt-0.5">Spill-proof, insulated, and 100% recyclable</p>
            </div>
          </div>
        </div>

        {/* 6 Standards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0D6E44] flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#0D6E44]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                    {s.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900">{s.title}</h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FSSAI & Transparency Badge */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0D6E44] border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-stone-500 font-bold">FSSAI Certified Kitchen</div>
              <div className="text-base sm:text-lg font-black text-stone-900 tracking-tight">{BRAND_CONFIG.fssaiNumber}</div>
            </div>
          </div>

          <div className="text-xs text-stone-500 max-w-md text-center md:text-right font-medium">
            <span>Our Gandhinagar central kitchen is open for scheduled visits by university wardens, parents, and corporate HR managers.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

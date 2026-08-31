import React from 'react';
import { CUSTOMER_FEEDBACKS } from '../../data/config';
import { Star } from 'lucide-react';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';

export const TestimonialsSection: React.FC = () => {
  const avatarList = [
    IMAGES.avatars.student,
    IMAGES.avatars.engineer,
    IMAGES.avatars.worker,
    IMAGES.avatars.corporateHR,
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 text-[#0D6E44] text-xs font-black uppercase tracking-wider mb-3">
            <span>Verified Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Trusted by 850+ subscribers <br />
            <span className="text-[#0D6E44]">across Gandhinagar</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            See how students, corporate employees, and factory managers transformed their daily eating routine with TEFFEIN.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CUSTOMER_FEEDBACKS.map((review, idx) => (
            <div
              key={review.id}
              className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{review.comment}"
                </p>

                {/* Positive tags */}
                {review.positiveTags && review.positiveTags.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1">
                    {review.positiveTags.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[9px] font-bold bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded-md">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-stone-300">
                  <SmartImage
                    src={avatarList[idx % avatarList.length]}
                    alt={review.customerName}
                    aspectRatio="square"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-xs text-stone-900 truncate">{review.customerName}</h4>
                  <p className="text-[10px] text-stone-500 truncate">{review.customerRole}</p>
                  <p className="text-[10px] text-[#0D6E44] font-bold truncate">{review.sectorOrArea}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

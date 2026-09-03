import React from 'react';
import { 
  Utensils, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  ChevronRight,
  Info,
  Layers,
  Leaf
} from 'lucide-react';
import { DatabaseMeal } from '../../services/menuService';
import { SmartImage } from '../common/SmartImage';
import { IMAGES } from '../../data/images';

interface Step2DailyMenuProps {
  meals: DatabaseMeal[];
  selectedMealId: string;
  onSelectMeal: (meal: DatabaseMeal) => void;
  selectedDate: string;
  mealSlot: 'lunch' | 'dinner';
  isLoading: boolean;
}

export const Step2DailyMenu: React.FC<Step2DailyMenuProps> = ({
  meals,
  selectedMealId,
  onSelectMeal,
  selectedDate,
  mealSlot,
  isLoading
}) => {
  // Format selected date
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const dateDisplay = dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });

  // Default fallback meals if database is connecting/loading
  const displayMeals: DatabaseMeal[] = meals.length > 0 ? meals : [
    {
      id: 'meal-standard-thali',
      name: 'Standard Gujarati Daily Thali',
      description: 'Wholesome everyday home thali cooked in pure filtered groundnut oil with balanced spices.',
      mealType: mealSlot,
      dietType: 'standard_gujarati',
      basePrice: 119,
      isActive: true,
      imageUrl: IMAGES.hero.mainThali
    },
    {
      id: 'meal-kathiyawadi-thali',
      name: 'Kathiyawadi Desi Thali',
      description: 'Traditional Saurashtra flavours featuring Ringan Olo / Sev Tameta with hot phulkas and garlic chutney.',
      mealType: mealSlot,
      dietType: 'kathiyawadi',
      basePrice: 129,
      isActive: true,
      imageUrl: IMAGES.hero.thaliSpread
    },
    {
      id: 'meal-jain-thali',
      name: 'Jain Satvik Pure Thali',
      description: 'Prepared strictly without root vegetables (no onion, garlic, potato). Pure satvik kitchen prep.',
      mealType: mealSlot,
      dietType: 'jain_satvik',
      basePrice: 119,
      isActive: true,
      imageUrl: IMAGES.dishes.kadhi
    },
    {
      id: 'meal-fit-thali',
      name: 'Low-Oil High-Fiber Fit Thali',
      description: 'Extra portion of steamed sprouts sabji, multigrain rotis without ghee, and low-sodium dal.',
      mealType: mealSlot,
      dietType: 'low_oil_fit',
      basePrice: 139,
      isActive: true,
      imageUrl: IMAGES.dishes.sabjiDry
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Step 2 of 6
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 tracking-tight">
              Select Your Meal
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {dateDisplay} • <span className="capitalize">{mealSlot}</span> Menu
          </span>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
          Every meal is prepared fresh in our Gandhinagar cloud kitchen using 100% cold-pressed/filtered groundnut oil, MP Sharbati wheat, and zero palm oil or chemical preservatives.
        </p>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-stone-200 animate-pulse space-y-4">
              <div className="h-44 bg-stone-200 rounded-2xl w-full" />
              <div className="h-5 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-150 rounded w-full" />
              <div className="h-10 bg-stone-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        /* Meals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {displayMeals.map((meal) => {
            const isSelected = selectedMealId === meal.id || (!selectedMealId && meal.id === displayMeals[0].id);
            const imageSrc = meal.imageUrl || IMAGES.hero.mainThali;

            return (
              <div
                key={meal.id}
                onClick={() => onSelectMeal(meal)}
                className={`bg-white rounded-3xl border text-left transition-all overflow-hidden flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-[#0D6E44] ring-2 ring-[#0D6E44]/25 shadow-lg shadow-emerald-950/10'
                    : 'border-stone-200/90 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {/* Photo Showcase */}
                <div className="relative h-48 sm:h-52 w-full bg-stone-100 overflow-hidden">
                  <SmartImage
                    src={imageSrc}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-[#0D6E44] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Leaf className="w-3 h-3 text-amber-300" />
                      <span>100% Pure Veg</span>
                    </span>
                  </div>

                  {/* Price Tag on Image */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-stone-150">
                    <span className="text-[10px] text-stone-500 font-bold block leading-none">Starting at</span>
                    <span className="text-base font-black text-stone-900 leading-tight">₹{meal.basePrice}</span>
                  </div>

                  {/* Nutrition Snapshot */}
                  <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white/90 drop-shadow-sm flex items-center gap-2">
                    <span>🔥 ~580 kcal</span>
                    <span>•</span>
                    <span>💪 18g Protein</span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-black text-stone-900 group-hover:text-[#0D6E44] transition-colors leading-tight">
                        {meal.name}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Standard Included In Every Thali */}
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5 text-[11px] text-stone-600 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">2 Sabjis (Dry + Gravy)</span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">4 Phulkas with Ghee</span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">Dal Tadka / Kadhi</span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">Rice & Salad</span>
                    </div>
                  </div>

                  {/* Selection Button */}
                  <div className="pt-3 border-t border-stone-150 flex items-center justify-between">
                    <div className="text-xs font-bold text-stone-500">
                      Standard Home Thali
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeal(meal);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0D6E44] text-white shadow-xs'
                          : 'bg-[#FAF8F5] hover:bg-stone-150 text-stone-800 border border-stone-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Select This Meal</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

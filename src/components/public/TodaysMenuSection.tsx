import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WEEKLY_MENU } from '../../data/config';
import { IMAGES } from '../../data/images';
import { SmartImage } from '../common/SmartImage';
import { 
  Sun, 
  Moon, 
  Flame, 
  Clock, 
  Sparkles, 
  ChevronRight,
  Leaf,
  Check
} from 'lucide-react';
import { MealSlot } from '../../types';

export const TodaysMenuSection: React.FC = () => {
  const { openCheckoutForPlan, setIsOrderOnceModalOpen, setActiveTab } = useApp();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0); // Monday
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('lunch');

  const currentDayMenu = WEEKLY_MENU[selectedDayIndex] || WEEKLY_MENU[0];
  const mealData = selectedSlot === 'lunch' ? currentDayMenu.lunch : currentDayMenu.dinner;

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const getDishImage = (category: string, name: string) => {
    const lower = (category + ' ' + name).toLowerCase();
    if (lower.includes('dal') || lower.includes('kadhi')) return IMAGES.dishes.dalTadka;
    if (lower.includes('roti') || lower.includes('phulka') || lower.includes('rotla')) return IMAGES.dishes.phulka;
    if (lower.includes('rice') || lower.includes('pulao') || lower.includes('khichdi')) return IMAGES.dishes.jeeraRice;
    if (lower.includes('chaas') || lower.includes('salad') || lower.includes('kachumber')) return IMAGES.dishes.chaas;
    if (lower.includes('bhindi') || lower.includes('sambhariya') || lower.includes('ringan')) return IMAGES.dishes.sabjiDry;
    return IMAGES.dishes.sabjiGravy;
  };

  return (
    <section id="todays-menu-section" className="py-16 sm:py-20 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#0D6E44] bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              Rotational Home Menu
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mt-3 tracking-tight">
              Today's {selectedSlot === 'lunch' ? 'Lunch' : 'Dinner'} Experience
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-xl">
              Authentic Gujarati and Indian home recipes cooked with controlled cold-pressed groundnut oil, zero soda, and MP Sharbati whole wheat.
            </p>
          </div>

          {/* Lunch / Dinner Switcher */}
          <div className="flex items-center p-1.5 rounded-2xl bg-stone-100 border border-stone-200 self-start md:self-auto shrink-0">
            <button
              id="menu-toggle-lunch"
              onClick={() => setSelectedSlot('lunch')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedSlot === 'lunch'
                  ? 'bg-white text-[#0D6E44] shadow-sm font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Lunch (12:00–1:00 PM)</span>
            </button>

            <button
              id="menu-toggle-dinner"
              onClick={() => setSelectedSlot('dinner')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedSlot === 'dinner'
                  ? 'bg-white text-[#0D6E44] shadow-sm font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Dinner (7:30–8:30 PM)</span>
            </button>
          </div>
        </div>

        {/* 7-Day Switcher Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {days.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={day}
                id={`day-btn-${day.toLowerCase()}`}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 flex flex-col items-center min-w-[100px] cursor-pointer ${
                  isSelected
                    ? 'border-emerald-700 bg-[#0D6E44] text-white shadow-md shadow-emerald-950/20'
                    : 'border-stone-200 bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <span className="uppercase text-[10px] font-bold opacity-80">Day 0{idx + 1}</span>
                <span className="text-sm font-black mt-0.5">{day}</span>
              </button>
            );
          })}
        </div>

        {/* Big Editorial Menu Feature Card */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 sm:p-8 lg:p-10 border border-stone-200/90 shadow-xl">
          {/* Top Banner with Image + Dish Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-stone-200">
            {/* Left Image of Today's Thali */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden shadow-md border border-stone-200/80">
                <SmartImage
                  src={selectedSlot === 'lunch' ? IMAGES.hero.thaliSpread : IMAGES.dishes.khichdi}
                  alt={`${currentDayMenu.dayOfWeek} ${mealData.title}`}
                  aspectRatio="auto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Freshly Prepared Daily</span>
                </div>
              </div>
            </div>

            {/* Right Meal Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-semibold">
                <span className="text-stone-900 font-black">{currentDayMenu.dayOfWeek}’s {selectedSlot === 'lunch' ? 'Lunch Thali' : 'Dinner Thali'}</span>
                <span>•</span>
                <span className="text-stone-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0D6E44]" /> Delivery: {selectedSlot === 'lunch' ? '12:00–1:00 PM' : '7:30–8:30 PM'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
                {mealData.title}
              </h3>
              
              <p className="text-sm sm:text-base text-stone-600 italic">
                "{mealData.chefNote}"
              </p>

              {/* Nutrition & Diet Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs text-xs">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Calories</span>
                  <span className="font-black text-stone-900">{mealData.nutrition.calories} kcal</span>
                </div>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs text-xs">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Protein</span>
                  <span className="font-black text-[#0D6E44]">{mealData.nutrition.proteinGrams}g</span>
                </div>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs text-xs">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Oil Level</span>
                  <span className="font-black text-stone-800">{mealData.nutrition.oilLevel}</span>
                </div>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs text-xs">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Diet Style</span>
                  <span className="font-black text-stone-800">Gujarati / Jain</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dishes Gallery Grid */}
          <div className="mt-8">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-4">
              Included in this wholesome meal:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealData.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:border-emerald-400 transition-all flex gap-3.5 items-start"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-stone-200/80">
                    <SmartImage
                      src={getDishImage(item.category, item.name)}
                      alt={item.name}
                      aspectRatio="square"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h5 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug line-clamp-1">
                        {item.name}
                      </h5>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-stone-400 capitalize font-medium">
                        {(item.category || '').replace(/_/g, ' ')}
                      </span>
                      {item.isJainAvailable && (
                        <span className="text-[#0D6E44] font-bold flex items-center gap-0.5">
                          <Leaf className="w-3 h-3" /> Jain Satvik
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action inside Menu */}
          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-600 text-center sm:text-left">
              <span className="font-black text-stone-900 block text-sm">Want this meal delivered today or on subscription?</span>
              <span className="text-stone-500">Order a single thali now or subscribe for 15/30 days to save up to 31%.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveTab('order_once');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0D6E44] border border-emerald-300 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>🍱</span>
                <span>Order Single Meal (₹119)</span>
              </button>

              <button
                onClick={() => openCheckoutForPlan('monthly_30')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Subscribe Routine (₹76/Meal)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

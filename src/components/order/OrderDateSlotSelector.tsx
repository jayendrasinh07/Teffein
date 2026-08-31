import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sun, 
  Moon, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AvailabilityCheckResult } from '../../types';
import { getOrderableDates, TEFFEIN_OPERATIONAL_CONFIG } from '../../services/availabilityEngine';

interface OrderDateSlotSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  selectedMealSlot: 'lunch' | 'dinner';
  onMealSlotChange: (slot: 'lunch' | 'dinner') => void;
  availability: AvailabilityCheckResult;
  onSelectNextAvailable?: (date: string, slot: 'lunch' | 'dinner') => void;
}

export const OrderDateSlotSelector: React.FC<OrderDateSlotSelectorProps> = ({
  selectedDate,
  onDateChange,
  selectedMealSlot,
  onMealSlotChange,
  availability,
  onSelectNextAvailable
}) => {
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const orderableDates = getOrderableDates();

  const todayStr = orderableDates[0]?.dateStr;
  const tomorrowStr = orderableDates[1]?.dateStr;

  const isSelectedToday = selectedDate === todayStr;
  const isSelectedTomorrow = selectedDate === tomorrowStr;
  const isSelectedCustom = !isSelectedToday && !isSelectedTomorrow;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6">
      {/* 1. Date Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0D6E44]" />
            <span>When do you want your meal?</span>
          </label>
          <span className="text-[11px] font-semibold text-stone-500">
            Advance bookings up to 6 days
          </span>
        </div>

        {/* Primary 3-way toggle: Today / Tomorrow / Choose Date */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Today Button */}
          <button
            type="button"
            id="date-btn-today"
            onClick={() => {
              setShowCustomDatePicker(false);
              if (todayStr) onDateChange(todayStr);
            }}
            className={`py-3 px-3 rounded-2xl text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isSelectedToday
                ? 'bg-[#0D6E44] text-white shadow-md shadow-emerald-950/20 scale-[1.02]'
                : 'bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="font-black text-sm sm:text-base">Today</span>
            <span className={`text-[10px] ${isSelectedToday ? 'text-emerald-100' : 'text-stone-500'}`}>
              {orderableDates[0]?.subLabel}
            </span>
          </button>

          {/* Tomorrow Button */}
          <button
            type="button"
            id="date-btn-tomorrow"
            onClick={() => {
              setShowCustomDatePicker(false);
              if (tomorrowStr) onDateChange(tomorrowStr);
            }}
            className={`py-3 px-3 rounded-2xl text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isSelectedTomorrow
                ? 'bg-[#0D6E44] text-white shadow-md shadow-emerald-950/20 scale-[1.02]'
                : 'bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="font-black text-sm sm:text-base">Tomorrow</span>
            <span className={`text-[10px] ${isSelectedTomorrow ? 'text-emerald-100' : 'text-stone-500'}`}>
              {orderableDates[1]?.subLabel}
            </span>
          </button>

          {/* Choose Date Button */}
          <button
            type="button"
            id="date-btn-custom"
            onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
            className={`py-3 px-3 rounded-2xl text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isSelectedCustom || showCustomDatePicker
                ? 'bg-stone-900 text-white shadow-md scale-[1.02]'
                : 'bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="font-black text-sm sm:text-base">
              {isSelectedCustom ? 'Selected' : 'Choose Date'}
            </span>
            <span className={`text-[10px] ${isSelectedCustom ? 'text-amber-300 font-bold' : 'text-stone-500'}`}>
              {isSelectedCustom ? orderableDates.find((d) => d.dateStr === selectedDate)?.subLabel || selectedDate : 'Calendar ▾'}
            </span>
          </button>
        </div>

        {/* Expandable Future Dates Carousel if "Choose Date" is clicked */}
        {showCustomDatePicker && (
          <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              Select upcoming day
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {orderableDates.map((d) => {
                const isCurrent = d.dateStr === selectedDate;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => {
                      onDateChange(d.dateStr);
                      setShowCustomDatePicker(false);
                    }}
                    className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0D6E44] text-white font-black shadow-sm'
                        : 'bg-white hover:bg-emerald-50 text-stone-700 border border-stone-200 text-xs'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">{d.label}</span>
                    <span className="block text-[9px] opacity-80">{d.subLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Meal Slot Segmented Control (Lunch vs Dinner) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0D6E44]" />
            <span>Select Meal Slot</span>
          </label>
          <span className="text-[11px] font-semibold text-stone-500">
            Cutoffs: Lunch 10:30 AM • Dinner 4:30 PM
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
          {/* Lunch Option */}
          <button
            type="button"
            id="slot-btn-lunch"
            onClick={() => onMealSlotChange('lunch')}
            className={`py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedMealSlot === 'lunch'
                ? 'bg-white text-stone-900 shadow-md scale-[1.01]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sun className={`w-4 h-4 ${selectedMealSlot === 'lunch' ? 'text-amber-500' : 'text-stone-400'}`} />
            <span>🍛 Lunch</span>
            <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">(12:00–1:30 PM)</span>
          </button>

          {/* Dinner Option */}
          <button
            type="button"
            id="slot-btn-dinner"
            onClick={() => onMealSlotChange('dinner')}
            className={`py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedMealSlot === 'dinner'
                ? 'bg-white text-stone-900 shadow-md scale-[1.01]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Moon className={`w-4 h-4 ${selectedMealSlot === 'dinner' ? 'text-indigo-500' : 'text-stone-400'}`} />
            <span>🌙 Dinner</span>
            <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">(7:00–8:30 PM)</span>
          </button>
        </div>
      </div>

      {/* 3. Availability Banner & Cut-off Recovery */}
      {!availability.isAvailable ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-amber-950">
                {selectedDate === todayStr ? `Today's ${selectedMealSlot} ordering has closed.` : 'Slot unavailable'}
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {availability.message}
              </p>
            </div>
          </div>

          {/* Next Available 1-Click Action */}
          {availability.nextAvailable && onSelectNextAvailable && (
            <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-amber-900 font-semibold">
                <span>Next available: </span>
                <strong className="font-black text-amber-950">
                  {availability.nextAvailable.dateLabel} • {availability.nextAvailable.mealSlot === 'lunch' ? 'Lunch (12:15 PM)' : 'Dinner (7:45 PM)'}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (availability.nextAvailable) {
                    onSelectNextAvailable(availability.nextAvailable.date, availability.nextAvailable.mealSlot);
                  }
                }}
                className="py-2 px-4 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <span>{availability.nextAvailable.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-[#0D6E44] text-xs font-bold border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {selectedDate === todayStr ? 'Today' : 'Selected date'}'s {selectedMealSlot} is actively taking orders for fresh steam preparation.
          </span>
        </div>
      )}
    </div>
  );
};

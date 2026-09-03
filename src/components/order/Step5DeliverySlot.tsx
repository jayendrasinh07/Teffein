import React from 'react';
import { 
  Clock, 
  Truck, 
  Check, 
  Sparkles, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { DeliverySlot } from '../../types';

interface Step5DeliverySlotProps {
  slots: DeliverySlot[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  mealSlot: 'lunch' | 'dinner';
}

export const Step5DeliverySlot: React.FC<Step5DeliverySlotProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  mealSlot
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Step 5 of 6
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 tracking-tight">
              Select Delivery Window
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {mealSlot === 'lunch' ? 'Lunch Service' : 'Dinner Service'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
          Meals are dispatched in temperature-regulated insulated containers from our Gandhinagar cloud kitchen to ensure hot arrival.
        </p>

        {/* Slot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isFull = slot.bookedCount >= slot.maxCapacity;
            const remaining = Math.max(0, slot.maxCapacity - slot.bookedCount);

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isFull}
                onClick={() => onSelectSlot(slot.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isFull
                    ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-emerald-50/70 border-[#0D6E44] ring-2 ring-[#0D6E44]/30 shadow-md'
                    : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
                }`}
              >
                {slot.isASAP && !isFull && (
                  <span className="absolute -top-2.5 right-3 bg-amber-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    Earliest Batch
                  </span>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-[#0D6E44]' : 'text-stone-500'}`} />
                    <span className="text-xs sm:text-sm font-black text-stone-900">
                      {slot.windowLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 font-medium">
                    {slot.isASAP ? 'Fresh first morning dispatch' : 'Dedicated cluster doorstep drop'}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                  <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-stone-500'}`}>
                    {isFull ? 'Batch Full' : `${remaining} slots open`}
                  </span>

                  <span className={`font-black ${isSelected ? 'text-[#0D6E44]' : 'text-stone-400'}`}>
                    {isSelected ? '✓ Selected' : 'Choose'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

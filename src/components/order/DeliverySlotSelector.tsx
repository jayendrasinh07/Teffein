import React from 'react';
import { 
  Clock, 
  Truck, 
  Check, 
  Sparkles,
  Users,
  AlertCircle
} from 'lucide-react';
import { DeliverySlot } from '../../types';

interface DeliverySlotSelectorProps {
  slots: DeliverySlot[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  mealSlot: 'lunch' | 'dinner';
}

export const DeliverySlotSelector: React.FC<DeliverySlotSelectorProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  mealSlot
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0D6E44]" />
            <span>Choose Delivery Window</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Free cluster van delivery in Gandhinagar • Guaranteed hot & fresh
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isFull
                  ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-emerald-50/70 border-[#0D6E44] ring-2 ring-[#0D6E44]/20 shadow-sm'
                  : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
              }`}
            >
              {slot.isASAP && !isFull && (
                <span className="absolute -top-2.5 right-3 bg-amber-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Earliest Batch
                </span>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0D6E44]' : 'text-stone-500'}`} />
                  <span className="text-xs font-black text-stone-900">
                    {slot.windowLabel}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500">
                  {slot.isASAP ? '35–50 mins from dispatch' : 'Dedicated cluster drop'}
                </p>
              </div>

              {/* Slot Capacity Status */}
              <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-stone-500'}`}>
                  {isFull ? 'Slot Full' : `${remaining} slots open`}
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
  );
};

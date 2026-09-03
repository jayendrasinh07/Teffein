import React from 'react';
import { Calendar, Utensils, Sliders, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const ORDER_STEPS: StepItem[] = [
  { id: 1, label: 'Date & Meal', shortLabel: 'Date', icon: Calendar },
  { id: 2, label: 'Select Meal', shortLabel: 'Menu', icon: Utensils },
  { id: 3, label: 'Customize', shortLabel: 'Customize', icon: Sliders },
  { id: 4, label: 'Address', shortLabel: 'Address', icon: MapPin },
  { id: 5, label: 'Delivery Slot', shortLabel: 'Slot', icon: Clock },
  { id: 6, label: 'Review & Pay', shortLabel: 'Review', icon: CheckCircle2 }
];

interface StepProgressIndicatorProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  maxCompletedStep: number;
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxCompletedStep
}) => {
  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200/90 shadow-xs mb-6">
      {/* Mobile Step Bar (Compact) */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#0D6E44] text-white flex items-center justify-center text-xs font-black">
            {currentStep}
          </div>
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Step {currentStep} of {ORDER_STEPS.length}
            </div>
            <div className="text-xs font-black text-stone-900">
              {ORDER_STEPS[currentStep - 1]?.label}
            </div>
          </div>
        </div>

        {/* Mini progress pill track */}
        <div className="flex items-center gap-1">
          {ORDER_STEPS.map((step) => {
            const isPassed = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                disabled={step.id > maxCompletedStep + 1}
                onClick={() => isPassed && onStepClick(step.id)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'w-6 bg-[#0D6E44]'
                    : isPassed
                    ? 'w-3 bg-emerald-300'
                    : 'w-2 bg-stone-200'
                }`}
                aria-label={`Step ${step.id}: ${step.label}`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop Step Bar (Full with text labels and icons) */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-[#0D6E44] -z-0 transition-all duration-300"
          style={{
            width: `${((Math.min(currentStep, ORDER_STEPS.length) - 1) / (ORDER_STEPS.length - 1)) * 100}%`
          }}
        />

        {ORDER_STEPS.map((step) => {
          const isPassed = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id <= maxCompletedStep + 1;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center gap-1.5 group focus:outline-none transition-all ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-[#0D6E44] text-white ring-4 ring-emerald-100 shadow-sm scale-110'
                    : isPassed
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white border-2 border-stone-300 text-stone-400 group-hover:border-stone-400'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <span
                className={`text-[11px] font-bold tracking-tight text-center ${
                  isCurrent
                    ? 'text-[#0D6E44] font-black'
                    : isPassed
                    ? 'text-stone-800'
                    : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  Pause, 
  Play, 
  SkipForward, 
  Sliders, 
  Utensils, 
  CheckCircle2, 
  MapPin,
  Sparkles,
  CalendarCheck,
  X,
  AlertCircle
} from 'lucide-react';

export const SubscriptionWidget: React.FC = () => {
  const { 
    subscription, 
    pauseSubscription, 
    resumeSubscription, 
    skipTomorrowMeal, 
    setActiveTab, 
    setIsSubscribeModalOpen 
  } = useApp();

  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [pauseDuration, setPauseDuration] = useState<number>(3);

  const isPaused = subscription.status === 'paused';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const isTomorrowSkipped = subscription.skippedDates.includes(tomorrowStr);

  const totalCycleMeals = subscription.totalMealsCount || 30;
  const daysCompleted = Math.max(0, totalCycleMeals - subscription.daysRemaining);
  const progressPercent = Math.min(100, Math.round((daysCompleted / totalCycleMeals) * 100));

  const handleConfirmPause = () => {
    pauseSubscription(pauseDuration);
    setShowPauseDialog(false);
  };

  const handleConfirmSkip = () => {
    skipTomorrowMeal(subscription.slot);
    setShowSkipDialog(false);
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1C2621] via-[#122219] to-[#0A1710] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-stone-800 relative overflow-hidden">
          {/* Subtle background ambient glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Smart Subscription Management</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Total Routine Control. <br />
                <span className="text-emerald-400">Zero Daily Ordering Hassle.</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Experience TEFFEIN’s food-tech dashboard right here. Pause your plan for travel, skip a single meal when dining out, or tweak portion preferences with 1 tap.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unused meals never expire (Rollover credit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Punctual Gandhinagar cluster delivery</span>
                </div>
              </div>
            </div>

            {/* Right Interactive SaaS Card */}
            <div className="lg:col-span-6">
              <div className="bg-white text-stone-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      LIVE SUBSCRIBER PORTAL
                    </span>
                    <h3 className="text-xl font-black text-stone-900 mt-1.5">My TEFFEIN Plan</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-stone-900 block">{subscription.planName}</span>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                      isPaused ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {isPaused ? 'Subscription Paused' : 'Active Routine'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Days Used vs Remaining) */}
                <div className="mt-4 pt-1">
                  <div className="flex justify-between text-xs mb-1.5 font-semibold text-stone-600">
                    <span>Subscription Cycle Progress</span>
                    <span className="text-stone-900 font-bold">{subscription.daysRemaining} days remaining</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#0D6E44] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(15, 100 - (subscription.daysRemaining / totalCycleMeals) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status Metrics Cards */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-500">Days Remaining</div>
                    <div className="text-2xl font-black text-[#0D6E44] mt-0.5">
                      {subscription.daysRemaining} <span className="text-xs font-semibold text-stone-500">days</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">Rollover valid up to 45 days</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-500">Next Meal</div>
                    <div className="text-sm sm:text-base font-black text-stone-900 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0D6E44] shrink-0" />
                      <span>{isTomorrowSkipped ? 'Skipped (Credit Added)' : isPaused ? 'Paused' : 'Tomorrow • 12:30 PM'}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Slot: {subscription.slot === 'lunch' ? 'Lunch Thali' : subscription.slot === 'dinner' ? 'Dinner Thali' : 'Lunch & Dinner'}
                    </div>
                  </div>
                </div>

                {/* Delivery Location Pill */}
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between text-xs text-emerald-950 mb-5">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-4 h-4 text-[#0D6E44] shrink-0" />
                    <span className="font-bold truncate">{subscription.deliveryAddress.area}, Gandhinagar</span>
                  </span>
                  <span className="text-[10px] font-black text-[#0D6E44] bg-white px-2.5 py-1 rounded-md border border-emerald-300 shrink-0">
                    {subscription.deliveryAddress.deliveryTimeSlot}
                  </span>
                </div>

                {/* 4 Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Pause / Resume Button */}
                  {isPaused ? (
                    <button
                      id="widget-btn-resume"
                      onClick={resumeSubscription}
                      className="py-3 px-3 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      id="widget-btn-pause"
                      onClick={() => setShowPauseDialog(true)}
                      className="py-3 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Plan</span>
                    </button>
                  )}

                  {/* Skip Tomorrow Button */}
                  <button
                    id="widget-btn-skip"
                    onClick={() => setShowSkipDialog(true)}
                    disabled={isTomorrowSkipped || isPaused}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                      isTomorrowSkipped || isPaused
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-300'
                    }`}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>{isTomorrowSkipped ? 'Skipped' : 'Skip Meal'}</span>
                  </button>

                  {/* Preferences Button */}
                  <button
                    id="widget-btn-preference"
                    onClick={() => setActiveTab('meal_preferences')}
                    className="py-3 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Preferences</span>
                  </button>

                  {/* View Menu Button */}
                  <button
                    id="widget-btn-menu"
                    onClick={() => setActiveTab('todays_menu')}
                    className="py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Utensils className="w-3.5 h-3.5 text-[#0D6E44]" />
                    <span>View Menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pause Confirmation Dialog (Section 21) */}
      {showPauseDialog && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-lg font-black text-stone-900">Pause your TEFFEIN plan</h4>
              <button onClick={() => setShowPauseDialog(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Your remaining days will pause safely and resume automatically when you return. Choose how many days to pause:
            </p>

            <div className="grid grid-cols-3 gap-2.5 my-4">
              {[3, 7, 14].map((days) => (
                <button
                  key={days}
                  onClick={() => setPauseDuration(days)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    pauseDuration === days
                      ? 'bg-[#0D6E44] text-white border-[#0D6E44] shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <button
                onClick={() => setShowPauseDialog(false)}
                className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPause}
                className="flex-1 py-3 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black shadow-md cursor-pointer"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Confirmation Dialog (Section 21) */}
      {showSkipDialog && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-lg font-black text-stone-900">Skip tomorrow's meal?</h4>
              <button onClick={() => setShowSkipDialog(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#0D6E44] shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-950 leading-relaxed">
                Your subscription will continue normally after tomorrow. This meal will be credited back and added as an extra day to your billing cycle.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSkipDialog(false)}
                className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Skip Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

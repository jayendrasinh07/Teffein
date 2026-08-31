import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { activeTab, setActiveTab, isOrderOnceModalOpen, isSubscribeModalOpen } = useApp();

  // Hide on order page, checkout modal, or customer dashboard to avoid UI collisions
  if (
    activeTab === 'order_once' || 
    activeTab === 'customer_dashboard' || 
    activeTab === 'admin_dashboard' ||
    isOrderOnceModalOpen || 
    isSubscribeModalOpen
  ) {
    return null;
  }

  return (
    <aside aria-label="Quick order bar" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-2xl safe-area-bottom">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        
        {/* Primary Single Meal CTA */}
        <button
          id="mobile-sticky-order-btn"
          onClick={() => {
            setActiveTab('order_once');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex-1 py-3 px-4 rounded-xl bg-[#0D6E44] active:bg-[#08482C] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>🍱</span>
          <span>Order a Meal</span>
          <span className="bg-emerald-800/80 px-1.5 py-0.5 rounded text-[10px] text-amber-300 ml-0.5">₹119</span>
        </button>

        {/* Secondary Subscription CTA */}
        <button
          id="mobile-sticky-plans-btn"
          onClick={() => {
            setActiveTab('meal_plans');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="py-3 px-3.5 rounded-xl bg-stone-100 active:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 flex items-center justify-center gap-1 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Plans</span>
        </button>

      </div>
    </aside>
  );
};

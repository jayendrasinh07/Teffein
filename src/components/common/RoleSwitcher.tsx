import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, ChefHat, Building2, Globe, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

export const RoleSwitcher: React.FC = () => {
  const { userRole, setUserRole, activeTab, setActiveTab } = useApp();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'customer') {
      setActiveTab('customer_dashboard');
    } else if (role === 'admin') {
      setActiveTab('admin_dashboard');
    } else if (role === 'kitchen_lead') {
      setActiveTab('kitchen_operations');
    } else if (role === 'corporate_manager') {
      setActiveTab('corporate_accounts');
    }
  };

  const handleGoHome = () => {
    setUserRole('guest');
    setActiveTab('home');
  };

  return (
    <aside aria-label="Demo role selector" className="bg-[#1C2421] text-xs text-stone-300 py-1.5 px-4 border-b border-stone-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Gandhinagar Food-Tech Platform Demo
          </span>
          <span className="hidden md:inline text-stone-400 text-[11px]">
            Explore live customer & operational portals:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            id="role-btn-public"
            onClick={handleGoHome}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              activeTab === 'home' || activeTab === 'meal_plans' || activeTab === 'todays_menu' || activeTab === 'how_it_works' || activeTab === 'students' || activeTab === 'workers' || activeTab === 'corporate'
                ? 'bg-stone-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Public Website</span>
          </button>

          <button
            id="role-btn-customer"
            onClick={() => handleRoleSelect('customer')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              userRole === 'customer' && activeTab.startsWith('customer') || activeTab === 'my_subscription' || activeTab === 'meal_preferences' || activeTab === 'delivery_tracking'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-emerald-300 hover:bg-stone-800'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Customer Portal (Aarav)</span>
          </button>

          <button
            id="role-btn-kitchen"
            onClick={() => handleRoleSelect('kitchen_lead')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              activeTab === 'kitchen_operations'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-amber-300 hover:bg-stone-800'
            }`}
          >
            <ChefHat className="w-3 h-3" />
            <span>Kitchen Ops</span>
          </button>

          <button
            id="role-btn-corporate"
            onClick={() => handleRoleSelect('corporate_manager')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              activeTab === 'corporate_accounts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-indigo-300 hover:bg-stone-800'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Corporate B2B</span>
          </button>

          <button
            id="role-btn-admin"
            onClick={() => handleRoleSelect('admin')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              activeTab === 'admin_dashboard' || activeTab === 'customer_management' || activeTab === 'subscription_management'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-rose-300 hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Hub</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

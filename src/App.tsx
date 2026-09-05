/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { ToastContainer } from './components/common/ToastContainer';

// Modals
import { SubscribeModal } from './components/modals/SubscribeModal';
import { OrderOnceModal } from './components/modals/OrderOnceModal';
import { TraceabilityModal } from './components/modals/TraceabilityModal';
import { CorporateEnquiryModal } from './components/modals/CorporateEnquiryModal';
import { FeedbackModal } from './components/modals/FeedbackModal';
import { AreaCheckerModal } from './components/modals/AreaCheckerModal';
import { LocationSelectorModal } from './components/modals/LocationSelectorModal';
import { LegalModal } from './components/modals/LegalModal';
import { AuthModal } from './components/modals/AuthModal';
import { DeveloperLocationDiagnostics } from './components/common/DeveloperLocationDiagnostics';

// Pages
import { Home } from './pages/Home';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { MealPlansPage } from './pages/MealPlansPage';
import { TodaysMenuPage } from './pages/TodaysMenuPage';
import { OrderOncePage } from './pages/OrderOncePage';
import { WhyUsPage } from './pages/WhyUsPage';
import { GandhinagarCoveragePage } from './pages/GandhinagarCoveragePage';
import { StudentsPage } from './pages/StudentsPage';
import { WorkersPage } from './pages/WorkersPage';
import { CorporatePage } from './pages/CorporatePage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { QualityStandardsPage } from './pages/QualityStandardsPage';
import { ContactPage } from './pages/ContactPage';
import { MobileBottomBar } from './components/common/MobileBottomBar';

// Dashboards
import { CustomerDashboard } from './pages/CustomerDashboard';
import { MealPreferencesPage } from './pages/MealPreferencesPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { CorporateAdminDashboard } from './pages/CorporateAdminDashboard';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';

const MainContent: React.FC = () => {
  const { activeTab, currentUser, userRolesList, isLocationModalOpen, setIsLocationModalOpen, setIsAuthModalOpen } = useApp();

  if (activeTab === 'password_recovery') {
    return (
      <div className="min-h-screen bg-[#f5f6f2] text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
        <PasswordRecoveryPage />
        <ToastContainer />
      </div>
    );
  }

  if (activeTab === 'kitchen_dashboard') {
    const hasKitchenAccess = !!currentUser && userRolesList.some(role => role === 'kitchen' || role === 'admin');
    return (
      <div className="min-h-screen bg-[#f5f6f2] text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
        {hasKitchenAccess ? (
          <KitchenDashboard />
        ) : (
          <main className="flex min-h-screen items-center justify-center px-6">
            <div className="max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-black text-stone-900">Kitchen access required</h1>
              <p className="mt-3 text-sm text-stone-600">Sign in with an authorized kitchen account to open this workspace.</p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-6 rounded-xl bg-[#0D6E44] px-5 py-3 text-sm font-bold text-white hover:bg-[#095a37]"
              >
                Sign in to Kitchen
              </button>
            </div>
          </main>
        )}
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  const renderActivePage = () => {
    const requiredRoles: Partial<Record<typeof activeTab,string[]>> = {admin_dashboard:['admin'],delivery_dashboard:['delivery','admin'],corporate_admin_dashboard:['corporate','admin']};
    const allowed=requiredRoles[activeTab];
    if(allowed&&(!currentUser||!userRolesList.some(role=>allowed.includes(role))))return <div className="p-10 text-center">Sign in with an authorized account to open this workspace.</div>;
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'how_it_works':
        return <HowItWorksPage />;
      case 'meal_plans':
        return <MealPlansPage />;
      case 'todays_menu':
        return <TodaysMenuPage />;
      case 'order_once':
        return <OrderOncePage />;
      case 'why_us':
        return <WhyUsPage />;
      case 'coverage':
        return <GandhinagarCoveragePage />;
      case 'students':
        return <StudentsPage />;
      case 'workers':
        return <WorkersPage />;
      case 'corporate':
        return <CorporatePage />;
      case 'traceability':
        return <TraceabilityPage />;
      case 'quality_standards':
        return <QualityStandardsPage />;
      case 'contact':
        return <ContactPage />;
      case 'customer_dashboard':
        return <CustomerDashboard />;
      case 'meal_preferences':
        return <MealPreferencesPage />;
      case 'order_history':
        return <OrderHistoryPage />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'delivery_dashboard':
        return <DeliveryDashboard />;
      case 'corporate_admin_dashboard':
        return <CorporateAdminDashboard />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <Navbar />
      <main className="flex-1 w-full pb-16 sm:pb-0">{renderActivePage()}</main>
      <Footer />
      <MobileBottomBar />
      <RoleSwitcher />
      <ToastContainer />

      {/* Global Interactive Modals & Diagnostics */}
      <OrderOnceModal />
      <SubscribeModal />
      <TraceabilityModal />
      <CorporateEnquiryModal />
      <FeedbackModal />
      <AreaCheckerModal />
      <LegalModal />
      <AuthModal />
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
      {(import.meta as any).env?.DEV && <DeveloperLocationDiagnostics />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

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

const MainContent: React.FC = () => {
  const { activeTab, isLocationModalOpen, setIsLocationModalOpen } = useApp();

  const renderActivePage = () => {
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
      case 'kitchen_dashboard':
        return <KitchenDashboard />;
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
      <LocationSelectorModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />
      <DeveloperLocationDiagnostics />
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

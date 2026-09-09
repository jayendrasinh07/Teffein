import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthModal } from './components/modals/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { KitchenMfaGate } from './components/kitchen/KitchenMfaGate';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';

const KitchenDashboard = React.lazy(() => import('./pages/KitchenDashboard').then(module => ({ default: module.KitchenDashboard })));

const OpsContent: React.FC = () => {
  const { activeTab, currentUser, userRolesList, setIsAuthModalOpen } = useApp();

  if (activeTab === 'password_recovery') return <><PasswordRecoveryPage /><ToastContainer /></>;

  const hasKitchenAccess = !!currentUser && userRolesList.some(role => role === 'kitchen' || role === 'admin');
  return (
    <div className="min-h-screen bg-[#f5f6f2] text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {hasKitchenAccess ? (
        <KitchenMfaGate key={currentUser.id}>
          <React.Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm font-bold text-stone-600">Loading secure workspace…</main>}>
            <KitchenDashboard />
          </React.Suspense>
        </KitchenMfaGate>
      ) : (
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black text-stone-900">Operations access required</h1>
            <p className="mt-3 text-sm text-stone-600">Sign in with an authorized operations account.</p>
            <button type="button" onClick={() => setIsAuthModalOpen(true)} className="mt-6 rounded-xl bg-[#0D6E44] px-5 py-3 text-sm font-bold text-white hover:bg-[#095a37]">Sign in</button>
          </div>
        </main>
      )}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function OpsApp() {
  return <AppProvider><OpsContent /></AppProvider>;
}

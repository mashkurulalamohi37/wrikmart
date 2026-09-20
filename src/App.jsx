import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/common/AuthModal';

import { CustomerApp } from './components/customer/CustomerApp';
import { EpsPaymentReturn } from './components/customer/EpsPaymentReturn';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AgentApp = lazy(() => import('./components/agent/AgentApp').then(m => ({ default: m.AgentApp })));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[30vh] p-4 animate-fade-in">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 animate-pulse flex items-center justify-center text-white font-black text-xs shadow-md">
      W
    </div>
  </div>
);

// Detect if current URL is an EPS payment return path
function getEpsReturnStatus() {
  const path = window.location.pathname;
  if (path === '/payment/success') return 'success';
  if (path === '/payment/fail') return 'fail';
  if (path === '/payment/cancel') return 'cancel';
  return null;
}

const AppContent = () => {
  const {
    currentRole,
    setCurrentRole,
    customerTab,
    adminNav,
    agentTab,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentRole, customerTab, adminNav, agentTab]);

  // Route protection guard: redirect to login if attempting to access admin/agent without permissions
  useEffect(() => {
    if (currentRole === 'admin' && currentUser?.role !== 'admin') {
      setCurrentRole('customer');
      if (setAuthModalMode) setAuthModalMode('login');
      if (setIsAuthModalOpen) setIsAuthModalOpen(true);
    } else if (currentRole === 'agent' && currentUser?.role !== 'agent' && currentUser?.role !== 'admin') {
      setCurrentRole('customer');
      if (setAuthModalMode) setAuthModalMode('login');
      if (setIsAuthModalOpen) setIsAuthModalOpen(true);
    }
  }, [currentRole, currentUser, setCurrentRole, setAuthModalMode, setIsAuthModalOpen]);

  // Check if we're on an EPS payment return URL
  const epsReturnStatus = getEpsReturnStatus();
  if (epsReturnStatus) {
    // Render full-screen EPS return handler wrapped in the provider (for createCustomerStockOrder etc.)
    return (
      <>
        <EpsPaymentReturn status={epsReturnStatus} />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F2F7FB] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full">
        <ErrorBoundary>
          {currentRole === 'customer' ? (
            <CustomerApp />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              {currentRole === 'admin' && currentUser?.role === 'admin' && <AdminPanel />}
              {currentRole === 'agent' && (currentUser?.role === 'agent' || currentUser?.role === 'admin') && <AgentApp />}
            </Suspense>
          )}
        </ErrorBoundary>
      </main>

      {currentRole === 'customer' && <Footer />}
      <Toast />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/common/AuthModal';

import { CustomerApp } from './components/customer/CustomerApp';

const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AgentApp = lazy(() => import('./components/agent/AgentApp').then(m => ({ default: m.AgentApp })));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[30vh] p-4 animate-fade-in">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 animate-pulse flex items-center justify-center text-white font-black text-xs shadow-md">
      W
    </div>
  </div>
);

const AppContent = () => {
  const { currentRole, customerTab, adminNav, agentTab } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentRole, customerTab, adminNav, agentTab]);

  return (
    <div className="min-h-screen w-full bg-[#F2F7FB] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full">
        {currentRole === 'customer' ? (
          <CustomerApp />
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            {currentRole === 'admin' && <AdminPanel />}
            {currentRole === 'agent' && <AgentApp />}
          </Suspense>
        )}
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

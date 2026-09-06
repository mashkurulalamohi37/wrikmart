import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';

const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AgentApp = lazy(() => import('./components/agent/AgentApp').then(m => ({ default: m.AgentApp })));
const CustomerApp = lazy(() => import('./components/customer/CustomerApp').then(m => ({ default: m.CustomerApp })));

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4 animate-fade-in-up">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/25 animate-ping absolute inset-0" />
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/30 relative">
        W
      </div>
    </div>
    <div className="text-center space-y-1">
      <p className="text-xs font-extrabold text-navy-900 tracking-wider uppercase">Loading WrikMart</p>
      <p className="text-[11px] text-slate-400">Preparing optimized station...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen w-full bg-[#F2F7FB] flex flex-col font-sans">
      <Header />
      
      <div className="flex-1 w-full">
        <Suspense fallback={<LoadingFallback />}>
          {currentRole === 'admin' && <AdminPanel />}
          {currentRole === 'agent' && <AgentApp />}
          {currentRole === 'customer' && <CustomerApp />}
        </Suspense>
      </div>

      {currentRole === 'customer' && <Footer />}
      <Toast />
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

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { AdminPanel } from './components/admin/AdminPanel';
import { AgentApp } from './components/agent/AgentApp';
import { CustomerApp } from './components/customer/CustomerApp';

const AppContent = () => {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-[#F2F7FB] flex flex-col font-sans">
      <Header />
      
      <div className="flex-1">
        {currentRole === 'admin' && <AdminPanel />}
        {currentRole === 'agent' && <AgentApp />}
        {currentRole === 'customer' && <CustomerApp />}
      </div>

      <Footer />
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

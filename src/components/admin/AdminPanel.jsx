import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrderList } from './AdminOrderList';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';
import { AdminAgentManagement } from './AdminAgentManagement';
import { AdminBalanceAndApproval } from './AdminBalanceAndApproval';
import { AdminHubManagement } from './AdminHubManagement';
import { AdminDeliveryManagement } from './AdminDeliveryManagement';
import { AdminTransitionHistory } from './AdminTransitionHistory';
import { AdminExpenseManagement } from './AdminExpenseManagement';
import { AdminPreOrderSettings } from './AdminPreOrderSettings';
import { AdminReportsAnalytics } from './AdminReportsAnalytics';
import { AdminSystemSettings } from './AdminSystemSettings';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileEdit, 
  Users, 
  UserCheck, 
  Wallet, 
  Receipt, 
  PlusCircle, 
  Building2, 
  Truck, 
  History, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminPanel = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedOrder360, setSelectedOrder360] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { balanceTransfers } = useApp();
  const pendingTransferCount = balanceTransfers.filter(t => t.status === 'Pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Order Management', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'preorder_settings', label: 'Pre Order Form Settings', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'agents', label: 'Agent Management', icon: <UserCheck className="w-4 h-4" /> },
    { 
      id: 'balance', 
      label: 'Agent Balance & Approval', 
      icon: <Wallet className="w-4 h-4" />,
      badge: pendingTransferCount > 0 ? pendingTransferCount : null
    },
    { id: 'expenses', label: 'Expense Management', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'hubs', label: 'Hub Management', icon: <Building2 className="w-4 h-4" /> },
    { id: 'delivery', label: 'Delivery Management', icon: <Truck className="w-4 h-4" /> },
    { id: 'history', label: 'Transition History', icon: <History className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'System & FX Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F2F7FB]">
      
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all ring-4 ring-brand-400/20"
          title="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-navy-950/70 backdrop-blur-sm animate-fade-in"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-14 sm:lg:top-16 left-0 z-40 lg:z-30 h-screen lg:h-[calc(100vh-64px)] w-64 bg-[#0D1B3D] text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 shadow-xl flex-shrink-0 self-start ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1 space-y-1 scrollbar-thin">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === item.id
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-navy-950 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#08132B] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate">Super Administrator</span>
              <span className="text-[10px] text-emerald-400">All Permissions Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
        {activeNav === 'dashboard' && (
          <AdminDashboard 
            onNavigateToOrder={(order) => setSelectedOrder360(order)}
            onNavigateToTab={(tab) => setActiveNav(tab)}
          />
        )}

        {activeNav === 'orders' && (
          <AdminOrderList 
            onSelectOrder={(order) => setSelectedOrder360(order)}
          />
        )}

        {activeNav === 'preorder_settings' && (
          <AdminPreOrderSettings />
        )}

        {activeNav === 'agents' && (
          <AdminAgentManagement />
        )}

        {activeNav === 'balance' && (
          <AdminBalanceAndApproval />
        )}

        {activeNav === 'expenses' && (
          <AdminExpenseManagement />
        )}

        {activeNav === 'hubs' && (
          <AdminHubManagement />
        )}

        {activeNav === 'delivery' && (
          <AdminDeliveryManagement />
        )}

        {activeNav === 'history' && (
          <AdminTransitionHistory />
        )}

        {activeNav === 'reports' && (
          <AdminReportsAnalytics />
        )}

        {activeNav === 'settings' && (
          <AdminSystemSettings />
        )}

        {/* Dedicated Admin Workspace Footer */}
        <footer className="mt-16 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-navy-900 tracking-tight">WrikMart Enterprise</span>
            <span className="text-slate-300">|</span>
            <span>Cross-Border Logistics Control Suite</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Admin Console v2.6</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <span>All Hubs Connected:</span>
              <span className="inline-flex items-center gap-1">
                <CountryFlag country="BD" className="w-3.5 h-2.5 rounded-xs" /> BD
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CountryFlag country="India" className="w-3.5 h-2.5 rounded-xs" /> IN
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CountryFlag country="Dubai" className="w-3.5 h-2.5 rounded-xs" /> AE
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CountryFlag country="Thailand" className="w-3.5 h-2.5 rounded-xs" /> TH
              </span>
            </span>
          </div>
        </footer>
      </main>

      {/* 360 Order Detail Modal */}
      {selectedOrder360 && (
        <AdminOrderDetailModal 
          order={selectedOrder360} 
          onClose={() => setSelectedOrder360(null)} 
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AgentDashboard } from './AgentDashboard';
import { AgentOrderList } from './AgentOrderList';
import { AgentProductLinkModal } from './AgentProductLinkModal';
import { AgentPurchaseUpdateModal } from './AgentPurchaseUpdateModal';
import { AgentHubDeliveryModal } from './AgentHubDeliveryModal';
import { AgentTransitionHistoryModal } from './AgentTransitionHistoryModal';
import { AgentExpenseManager } from './AgentExpenseManager';
import { AgentChat } from './AgentChat';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  PlusCircle, 
  Building2, 
  History, 
  MessageSquare, 
  ShieldCheck,
  Globe2,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AgentApp = () => {
  const { activeAgent, balanceTransfers } = useApp();
  // Navigation tabs: 'dashboard' | 'orders' | 'purchase' | 'expense' | 'hub' | 'history' | 'chat'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Active Modal States
  const [selectedOrderForLink, setSelectedOrderForLink] = useState(null);
  const [selectedOrderForPurchase, setSelectedOrderForPurchase] = useState(null);
  const [selectedOrderForHub, setSelectedOrderForHub] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const pendingTransferCount = balanceTransfers.filter(t => t.agentId === activeAgent.id && t.status === 'Pending').length;

  return (
    <div className="min-h-[calc(100vh-92px)] flex flex-col bg-[#F4F7FB]">
      
      {/* Desktop Sub-Navigation Header */}
      <div className="bg-white border-b border-slate-200/80 shadow-soft sticky top-[92px] z-30 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Agent Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Assigned Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('expense')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'expense' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Expenses</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>HQ Chat</span>
            </button>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 font-bold">
              <Wallet className="w-4 h-4 text-brand-600" />
              <span>Wallet: {activeAgent.symbol}{activeAgent.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {activeAgent.currency}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-base">{activeAgent.flag}</span>
              <span className="font-bold text-navy-900">{activeAgent.country} Agent Station</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Content View */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <AgentDashboard 
            onNavigate={(tab) => {
              if (tab === 'history') setShowHistoryModal(true);
              else setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'orders' && (
          <AgentOrderList 
            onSelectOrderForLink={(order) => setSelectedOrderForLink(order)}
            onSelectOrderForPurchase={(order) => setSelectedOrderForPurchase(order)}
            onSelectOrderForHub={(order) => setSelectedOrderForHub(order)}
          />
        )}

        {activeTab === 'expense' && (
          <AgentExpenseManager />
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <AgentChat />
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-4 md:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'dashboard' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'orders' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'expense' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'chat' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {selectedOrderForLink && (
        <AgentProductLinkModal 
          order={selectedOrderForLink} 
          onClose={() => setSelectedOrderForLink(null)} 
        />
      )}

      {selectedOrderForPurchase && (
        <AgentPurchaseUpdateModal 
          order={selectedOrderForPurchase} 
          onClose={() => setSelectedOrderForPurchase(null)} 
        />
      )}

      {selectedOrderForHub && (
        <AgentHubDeliveryModal 
          order={selectedOrderForHub} 
          onClose={() => setSelectedOrderForHub(null)} 
        />
      )}

      {showHistoryModal && (
        <AgentTransitionHistoryModal 
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
    </div>
  );
};

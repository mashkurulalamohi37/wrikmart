import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, User, Sparkles, ChevronRight, X } from 'lucide-react';
import { CountryFlag } from './CountryFlag';

export const PortalDock = () => {
  const { currentRole, setCurrentRole, activeAgent, agents, setActiveAgentId } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-50 no-print">
        <button
          onClick={() => setCollapsed(false)}
          className="bg-navy-950/90 backdrop-blur-md text-white border border-slate-700/80 p-2.5 rounded-full shadow-2xl flex items-center gap-2 hover:bg-navy-900 transition-all text-xs font-bold"
          title="Open Portal Switcher Dock"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="hidden sm:inline">Switch Portal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 no-print">
      <div className="bg-[#0D1B3D]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 animate-fade-in">
        
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 px-2 hidden sm:inline">
          Quick Switch:
        </span>

        {/* 1. Admin */}
        <button
          onClick={() => setCurrentRole('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentRole === 'admin'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-brand-200" />
          <span>Admin</span>
        </button>

        {/* 2. Agent */}
        <button
          onClick={() => setCurrentRole('agent')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentRole === 'agent'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CountryFlag country={activeAgent.country || activeAgent.flag} className="w-4 h-3 rounded-[1px]" />
          <span>Agent</span>
        </button>

        {/* 3. Customer */}
        <button
          onClick={() => setCurrentRole('customer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentRole === 'customer'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5 text-emerald-300" />
          <span>Customer</span>
        </button>

        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 ml-1 transition-colors"
          title="Minimize Dock"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

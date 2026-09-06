import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Bell, 
  ChevronDown, 
  Check, 
  Building, 
  Sparkles, 
  Search, 
  Plus, 
  HelpCircle,
  Truck,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { CountryFlag } from './CountryFlag';

export const Header = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    customerTab,
    setCustomerTab,
    agents, 
    activeAgentId, 
    setActiveAgentId, 
    activeAgent, 
    balanceTransfers,
    exchangeRates
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleStartPreOrder = () => {
    setCurrentRole('customer');
    if (setCustomerTab) setCustomerTab('preorder');
  };

  const handleSearchClick = () => {
    setCurrentRole('customer');
    if (setCustomerTab) setCustomerTab('preorder');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingTransferCount = balanceTransfers.filter(t => t.status === 'Pending').length;

  return (
    <header className="sticky top-0 z-50 bg-[#0D1B3D] text-white border-b border-slate-800 shadow-lg select-none w-full max-w-full">

      {/* 2. Main Navigation & Brand Header */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setCurrentRole('customer');
            if (setCustomerTab) setCustomerTab('home');
          }}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-teal-glow group-hover:scale-105 transition-transform flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-white font-sans">
                Wrik<span className="text-brand-400">Mart</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 hidden sm:inline-block">
                Pre-Order
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Quick Action (Customer Pre-Order Search / Link Trigger) */}
        <div 
          onClick={handleSearchClick}
          className="hidden lg:flex items-center gap-2 bg-[#14234B]/80 hover:bg-[#14234B] px-4 py-2 rounded-2xl border border-slate-700/60 max-w-md w-full cursor-pointer transition-colors group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-400 transition-colors flex-shrink-0" />
          <span className="text-xs text-slate-300 truncate select-none">
            Paste any link: Nike India, Apple Dubai, Zara, Amazon...
          </span>
        </div>

        {/* Right Section: New Pre-Order CTA + Workspace / Role Switcher Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0" ref={dropdownRef}>
          
          {/* Quick Pre-Order CTA Button (Visible on ALL devices) */}
          <button
            onClick={handleStartPreOrder}
            className="flex items-center gap-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 active:scale-95 text-white font-bold text-[11px] sm:text-xs px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md transition-all whitespace-nowrap flex-shrink-0"
            title="Create New Pre-Order"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pre-Order</span>
          </button>

          {/* Main Portal Switcher Dropdown Button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-xl sm:rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2 text-left transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400 flex-shrink-0"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                {currentRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                {currentRole === 'agent' && <CountryFlag country={activeAgent.country || activeAgent.flag} className="w-3.5 h-2.5 rounded-[1px]" />}
                {currentRole === 'customer' && <User className="w-3.5 h-3.5" />}
              </div>

              <div className="text-left hidden xs:block">
                <span className="text-[7.5px] uppercase font-extrabold tracking-wider text-slate-400 block leading-none">
                  ROLE
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-white block max-w-[70px] sm:max-w-none truncate">
                  {currentRole === 'admin' && (
                    <>
                      <span className="hidden sm:inline">👑 Super Admin</span>
                      <span className="sm:hidden">👑 Admin</span>
                    </>
                  )}
                  {currentRole === 'agent' && (
                    <>
                      <span className="hidden sm:inline">{activeAgent.name} ({activeAgent.country})</span>
                      <span className="sm:hidden">{activeAgent.country}</span>
                    </>
                  )}
                  {currentRole === 'customer' && (
                    <>
                      <span className="hidden sm:inline">🛍️ Customer Storefront</span>
                      <span className="sm:hidden">🛍️ Customer</span>
                    </>
                  )}
                </span>
              </div>

              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Card */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-[#0D1B3D] border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-800">
                
                {/* Dropdown Header */}
                <div className="p-4 bg-[#08132B]">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-400 block">
                    Select Portal Workspace
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">Switch between Admin, Agent Stations, and Customer View</p>
                </div>

                {/* 1. Admin Control Option */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setCurrentRole('admin');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                      currentRole === 'admin' 
                        ? 'bg-brand-500/20 border border-brand-500/40 text-white' 
                        : 'hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">Super Admin Control Suite</span>
                        {currentRole === 'admin' && <Check className="w-4 h-4 text-brand-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Complete control over orders, balance remittances, hubs & profit margins</p>
                    </div>
                  </button>
                </div>

                {/* 2. Overseas Agents Stations */}
                <div className="p-2 space-y-1">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Overseas Sourcing Stations (3 Countries)
                  </div>

                  {agents.map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => {
                        setActiveAgentId(ag.id);
                        setCurrentRole('agent');
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                        currentRole === 'agent' && activeAgentId === ag.id
                          ? 'bg-brand-500/20 border border-brand-500/40 text-white'
                          : 'hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CountryFlag country={ag.country || ag.flag} className="w-6 h-4 rounded-xs shadow-xs" />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white block truncate">{ag.name}</span>
                          <span className="text-[10px] text-slate-400">{ag.country} Agent • Wallet: {ag.symbol}{ag.balance.toLocaleString()}</span>
                        </div>
                      </div>

                      {currentRole === 'agent' && activeAgentId === ag.id && (
                        <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 3. Customer Pre-Order Storefront */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setCurrentRole('customer');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                      currentRole === 'customer' 
                        ? 'bg-brand-500/20 border border-brand-500/40 text-white' 
                        : 'hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">Customer Pre-Order Portal</span>
                        {currentRole === 'customer' && <Check className="w-4 h-4 text-brand-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Paste links, 25% advance checkout via bKash, and 9-stage order tracking</p>
                    </div>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. Mobile & Tablet Quick Search / Link Paste Bar */}
      <div className="lg:hidden px-3 sm:px-6 pb-2.5 pt-0.5 max-w-7xl mx-auto">
        <div 
          onClick={handleSearchClick}
          className="flex items-center gap-2 bg-[#14234B]/90 hover:bg-[#14234B] active:bg-[#1A2E63] px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-inner cursor-pointer transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] text-slate-300 truncate select-none">
            Paste any link: Nike India, Apple Dubai, Zara, Amazon...
          </span>
        </div>
      </div>
    </header>
  );
};

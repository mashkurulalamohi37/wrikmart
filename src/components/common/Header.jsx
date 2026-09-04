import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Globe, 
  ArrowRightLeft, 
  Bell, 
  ChevronDown, 
  Check, 
  Building, 
  Sparkles, 
  Search, 
  Plus, 
  PhoneCall, 
  HelpCircle,
  Truck,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

export const Header = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    agents, 
    activeAgentId, 
    setActiveAgentId, 
    activeAgent, 
    balanceTransfers,
    exchangeRates
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showFxModal, setShowFxModal] = useState(false);
  const [calculatorBdt, setCalculatorBdt] = useState('10000');
  const dropdownRef = useRef(null);

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
    <header className="sticky top-0 z-50 bg-[#0D1B3D] text-white border-b border-slate-800 shadow-lg select-none">
      
      {/* 1. Top Mini Utility & Live FX Bar */}
      <div className="bg-[#08132B] px-4 sm:px-6 lg:px-8 h-8 text-[11px] text-slate-300 border-b border-slate-800/80 flex items-center justify-between gap-4">
        
        {/* Left: Live Multi-Currency Conversion Ticker with Modal Trigger */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setShowFxModal(true)}
            className="inline-flex items-center gap-1.5 font-extrabold text-brand-400 bg-brand-500/15 hover:bg-brand-500/25 px-2.5 py-0.5 rounded-full text-[10px] transition-colors border border-brand-500/30"
            title="Open Live Currency Calculator"
          >
            <ArrowRightLeft className="w-3 h-3 text-brand-400" />
            <span>Live FX Calculator</span>
          </button>

          <div className="flex items-center gap-2.5 font-mono text-[11px] whitespace-nowrap">
            <span className="text-slate-400 hidden sm:inline">1 BDT =</span>
            <span className="font-bold text-emerald-400">0.70 INR 🇮🇳</span>
            <span className="text-slate-600">|</span>
            <span className="font-bold text-cyan-400">0.0308 AED 🇦🇪</span>
            <span className="text-slate-600">|</span>
            <span className="font-bold text-amber-400">0.282 THB 🇹🇭</span>
          </div>
        </div>

        {/* Right: Hub Status & Support Hotline */}
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            <span>Hubs: <strong>Dhaka • Delhi • Dubai • Bangkok</strong></span>
          </div>

          <span className="text-slate-600">|</span>

          <a 
            href="https://wa.me/8801700000000" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 font-medium transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp: +880 1700-000000</span>
          </a>

          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live
          </span>
        </div>

      </div>

      {/* 2. Main Navigation & Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setCurrentRole('customer')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-teal-glow group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Wrik<span className="text-brand-400">Mart</span>
              </span>
              <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Cross-Border Pre-Order
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Bangladesh to India, Dubai & Thailand</p>
          </div>
        </div>

        {/* Global Quick Action (Customer Pre-Order Trigger) */}
        {currentRole === 'customer' && (
          <div className="hidden lg:flex items-center gap-2 bg-[#14234B]/80 px-4 py-2 rounded-2xl border border-slate-700/60 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => setCurrentRole('customer')}
              placeholder="Paste any link: Nike India, Apple Dubai, Zara, Amazon..."
              className="bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none w-full cursor-pointer"
            />
          </div>
        )}

        {/* Right Section: Workspace / Role Switcher Menu */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          
          {/* Quick Pre-Order CTA Button */}
          {currentRole === 'customer' && (
            <button
              onClick={() => setCurrentRole('customer')}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Pre-Order</span>
            </button>
          )}

          {/* Main Portal Switcher Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-2xl p-2 sm:px-4 sm:py-2 text-left transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                {currentRole === 'admin' && <ShieldCheck className="w-4 h-4" />}
                {currentRole === 'agent' && <span className="text-sm">{activeAgent.flag}</span>}
                {currentRole === 'customer' && <User className="w-4 h-4" />}
              </div>

              <div className="hidden sm:block min-w-[140px]">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block leading-none mb-1">
                  Active Portal / Role
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {currentRole === 'admin' && '👑 Super Admin Panel'}
                  {currentRole === 'agent' && `${activeAgent.name} (${activeAgent.country})`}
                  {currentRole === 'customer' && '🛍️ Customer Storefront'}
                </span>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Card */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0D1B3D] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-800">
                
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
                        <span className="text-2xl">{ag.flag}</span>
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

      {/* Live FX Calculator Modal */}
      {showFxModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1B3D] text-white rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-sm">Live Cross-Border Currency Calculator</h3>
              </div>
              <button onClick={() => setShowFxModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Enter Amount in Bangladeshi Taka (৳ BDT):</label>
              <input
                type="number"
                value={calculatorBdt}
                onChange={(e) => setCalculatorBdt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#14234B] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-3 bg-[#14234B] rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🇮🇳</span> India (INR):</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{(Number(calculatorBdt || 0) * (exchangeRates.INR.rateFromBDT)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 bg-[#14234B] rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🇦🇪</span> Dubai (AED):</span>
                <span className="font-bold text-cyan-400 text-sm">
                  {(Number(calculatorBdt || 0) * (exchangeRates.AED.rateFromBDT)).toLocaleString(undefined, { maximumFractionDigits: 2 })} AED
                </span>
              </div>

              <div className="p-3 bg-[#14234B] rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🇹🇭</span> Thailand (THB):</span>
                <span className="font-bold text-amber-400 text-sm">
                  ฿{(Number(calculatorBdt || 0) * (exchangeRates.THB.rateFromBDT)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowFxModal(false)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow"
            >
              Close Calculator
            </button>
          </div>
        </div>
      )}

    </header>
  );
};

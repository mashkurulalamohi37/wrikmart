import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Plus, 
  LogIn, 
  LogOut, 
  KeyRound,
  ChevronDown,
  Shield,
  Layers,
  Store,
  UserCheck
} from 'lucide-react';
import { HeaderSearchBar } from './HeaderSearchBar';

export const Header = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    setCustomerTab,
    cart = [], 
    setIsCartOpen,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartPreOrder = () => {
    setCurrentRole('customer');
    if (setCustomerTab) setCustomerTab('preorder');
  };

  return (
    <header className="sticky top-0 z-50 md:h-16 bg-[#0D1B3D] text-white border-b border-slate-800 shadow-lg w-full max-w-full print:hidden no-print">

      {/* 2. Main Navigation & Brand Header */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-full flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setCurrentRole('customer');
            if (setCustomerTab) setCustomerTab('home');
          }}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white p-0.5 shadow-teal-glow group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center border border-white/20">
            <img 
              src="/wrikmart-logo.jpeg" 
              alt="WrikMart" 
              className="w-full h-full object-contain rounded-lg"
            />
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

        {/* Desktop Quick Search & Global Link Paste Bar */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 lg:mx-4">
          <HeaderSearchBar isMobile={false} />
        </div>

        {/* Right Section: New Pre-Order CTA + Cart + User Login */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          
          {/* Quick Pre-Order CTA Button (Desktop / Tablet) */}
          <button
            onClick={handleStartPreOrder}
            className="hidden md:flex items-center gap-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition-all whitespace-nowrap flex-shrink-0"
            title="Create New Pre-Order"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pre-Order</span>
          </button>

          {/* Role Switcher Pill for Easy Mobile & Desktop Navigation */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-xl sm:rounded-2xl px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-bold text-slate-200 transition-all shadow-md active:scale-95"
              title="Switch App View"
            >
              {currentRole === 'customer' && <Store className="w-3.5 h-3.5 text-brand-400" />}
              {currentRole === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
              {currentRole === 'agent' && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="capitalize text-[11px] hidden xs:inline">{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0D1B3D] border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 animate-scale-up">
                <div className="px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch App View
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    if (setCustomerTab) setCustomerTab('home');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-colors ${
                    currentRole === 'customer' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-brand-400" />
                  <div className="text-left">
                    <span className="block leading-tight">Customer</span>
                    <span className="text-[9px] font-normal text-slate-400">Storefront & Pre-Order</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-colors ${
                    currentRole === 'admin' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="block leading-tight">Admin HQ</span>
                    <span className="text-[9px] font-normal text-slate-400">Operations & Settings</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('agent');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-colors ${
                    currentRole === 'agent' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="block leading-tight">Overseas Agent</span>
                    <span className="text-[9px] font-normal text-slate-400">Sourcing & Tasks</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Cart Button: Visible on ALL screens including Mobile */}
          <button
            onClick={() => {
              setCurrentRole('customer');
              if (setIsCartOpen) setIsCartOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-white font-bold text-xs shadow-md transition-all relative flex-shrink-0 active:scale-95"
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-brand-400" />
            <span className="hidden md:inline">Cart</span>
            {cart.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand-500 text-white font-extrabold text-[10px] min-w-[18px] text-center">
                {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
              </span>
            )}
          </button>

          {/* User Account / Original Login CTA */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-2 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-xl sm:rounded-2xl px-2 py-1 sm:px-2.5 sm:py-1.5 text-white transition-all shadow-md flex-shrink-0">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-brand-400 flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-[10px] sm:text-xs flex-shrink-0">
                  {currentUser.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <span className="text-[11px] font-bold text-white block max-w-[85px] truncate leading-tight">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-brand-300 uppercase font-bold block leading-tight">
                  {currentUser.role}
                </span>
              </div>
              <button 
                onClick={() => {
                  if (setAuthModalMode) setAuthModalMode('changePassword');
                  if (setIsAuthModalOpen) setIsAuthModalOpen(true);
                }}
                title="Change Password"
                className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={logout}
                title="Sign Out"
                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (setAuthModalMode) setAuthModalMode('login');
                if (setIsAuthModalOpen) setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 active:scale-95 text-white font-bold text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-md transition-all whitespace-nowrap flex-shrink-0 border border-brand-400/30"
              title="Sign In / Register"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

        </div>

      </div>

      {/* 3. Mobile Quick Search & Global Link Paste Bar */}
      <div className="md:hidden px-3 sm:px-6 pb-2.5 pt-0.5 max-w-7xl mx-auto">
        <HeaderSearchBar isMobile={true} />
      </div>
    </header>
  );
};

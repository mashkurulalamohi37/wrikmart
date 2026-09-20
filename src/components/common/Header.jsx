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
  UserCheck,
  Lock,
  Camera,
  User,
  Sparkles
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
    logout,
    showToast,
    updateCurrentUserAvatar
  } = useApp();

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const avatarPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarPickerRef.current && !avatarPickerRef.current.contains(e.target)) {
        setShowAvatarPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartPreOrder = () => {
    setCurrentRole('customer');
    if (setCustomerTab) setCustomerTab('preorder');
  };

  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be under 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result && updateCurrentUserAvatar) {
          updateCurrentUserAvatar(evt.target.result);
          setShowAvatarPicker(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAgent = currentUser?.role === 'agent';

  return (
    <header className="sticky top-0 z-50 md:h-16 bg-[#0D1B3D] text-white border-b border-slate-800 shadow-lg w-full max-w-full print:hidden no-print">

      {/* 2. Main Navigation & Brand Header */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-full flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand Logo - Crisp Separate Icon & Typography */}
        <div 
          onClick={() => {
            setCurrentRole('customer');
            if (setCustomerTab) setCustomerTab('home');
          }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0 select-none"
          title="WrikMart Global Sourcing & Pre-Order"
        >
          {/* Logo Icon Box */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center border border-white/30 overflow-hidden">
            <img 
              src="/wrikmart-logo.jpeg" 
              alt="WrikMart Icon" 
              className="w-full h-full object-contain transform scale-125"
            />
          </div>

          {/* Clean Typography Beside Icon */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white font-sans leading-none">
                Wrik<span className="text-brand-400">Mart</span>
              </span>
              <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-500/30 to-emerald-500/30 text-brand-300 border border-brand-400/40 inline-block shadow-2xs">
                PRE-ORDER
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase hidden sm:block mt-0.5">
              Global Logistics & Sourcing
            </span>
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
            className="hidden md:flex items-center gap-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
            title="Create New Pre-Order"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pre-Order</span>
          </button>

          {/* Staff-Only Direct View Toggle (Never shown to guests or regular customers) */}
          {isAdmin && (
            <button
              onClick={() => {
                const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
                setCurrentRole(nextRole);
                if (nextRole === 'customer' && setCustomerTab) setCustomerTab('home');
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title={currentRole === 'admin' ? 'Switch to Customer Storefront View' : 'Switch to Super Admin HQ'}
            >
              {currentRole === 'admin' ? (
                <>
                  <Store className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] hidden sm:inline">Storefront</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] hidden sm:inline">Admin HQ</span>
                </>
              )}
            </button>
          )}

          {isAgent && (
            <button
              onClick={() => {
                const nextRole = currentRole === 'agent' ? 'customer' : 'agent';
                setCurrentRole(nextRole);
                if (nextRole === 'customer' && setCustomerTab) setCustomerTab('home');
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title={currentRole === 'agent' ? 'Switch to Customer Storefront View' : 'Switch to Agent Station'}
            >
              {currentRole === 'agent' ? (
                <>
                  <Store className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[11px] hidden sm:inline">Storefront</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[11px] hidden sm:inline">Agent Station</span>
                </>
              )}
            </button>
          )}

          {/* Quick Cart Button */}
          <button
            onClick={() => {
              setCurrentRole('customer');
              if (setIsCartOpen) setIsCartOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-white font-bold text-xs shadow-md transition-all relative flex-shrink-0 active:scale-95 cursor-pointer"
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

          {/* User Account / Avatar & Fast Profile Photo Picker */}
          {currentUser ? (
            <div className="relative" ref={avatarPickerRef}>
              <div className="flex items-center gap-1 sm:gap-2 bg-[#14234B] hover:bg-[#1A2E63] border border-slate-700/80 rounded-xl sm:rounded-2xl px-2 py-1 sm:px-2.5 sm:py-1.5 text-white transition-all shadow-md flex-shrink-0">
                
                {/* Avatar with Photo Change Trigger */}
                <button 
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="relative group/avatar cursor-pointer"
                  title="Click to Change Profile Photo"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-brand-400 flex-shrink-0 group-hover/avatar:ring-2 group-hover/avatar:ring-brand-300 transition-all"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-500/30 text-brand-300 flex items-center justify-center font-bold text-[10px] sm:text-xs flex-shrink-0">
                      {currentUser.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-brand-500 text-white p-0.5 rounded-full text-[7px] hidden sm:block opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera className="w-2 h-2" />
                  </span>
                </button>

                <div 
                  onClick={() => {
                    if (currentUser.role === 'customer') {
                      setCurrentRole('customer');
                      if (setCustomerTab) setCustomerTab('profile');
                    }
                  }}
                  className="text-left hidden sm:block cursor-pointer"
                >
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

              {/* Fast Avatar Preset Selector / File Upload Modal Dropdown */}
              {showAvatarPicker && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0D1B3D] border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-scale-up space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1 text-brand-300">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Profile Photo</span>
                    </span>
                  </div>

                  {/* Preset Avatars */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_PRESETS.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (updateCurrentUserAvatar) updateCurrentUserAvatar(url);
                          setShowAvatarPicker(false);
                        }}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                          currentUser.avatar === url ? 'border-brand-400 ring-2 ring-brand-400/40' : 'border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Custom Device Photo Upload */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleCustomAvatarUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-brand-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload photo from device</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (setAuthModalMode) setAuthModalMode('login');
                if (setIsAuthModalOpen) setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 active:scale-95 text-white font-bold text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-md transition-all whitespace-nowrap flex-shrink-0 border border-brand-400/30 cursor-pointer"
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


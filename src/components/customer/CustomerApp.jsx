import React, { useState } from 'react';
import { CustomerHome } from './CustomerHome';
import { CustomerStockCatalog } from './CustomerStockCatalog';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { CustomerStockCheckoutModal } from './CustomerStockCheckoutModal';
import { PreOrderWizard } from './PreOrderWizard';
import { CustomerOrders } from './CustomerOrders';
import { CustomerChat } from './CustomerChat';
import { CustomerBirthdayModal } from './CustomerBirthdayModal';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  HelpCircle,
  Truck,
  Globe2,
  PhoneCall,
  Search,
  Zap,
  Cake,
  Gift,
  Edit3,
  Save,
  Calendar,
  KeyRound,
  Lock
} from 'lucide-react';

import { useApp } from '../../context/AppContext';

export const CustomerApp = () => {
  // Navigation Tabs: 'home' | 'stock' | 'preorder' | 'orders' | 'chat' | 'profile'
  const { 
    customerTab, 
    setCustomerTab, 
    cart = [], 
    isCartOpen, 
    setIsCartOpen,
    customerProfile,
    updateCustomerProfile,
    getBirthdayStatus,
    birthdaySettings,
    generateBirthdayCoupon,
    setAppliedCoupon,
    setIsAuthModalOpen,
    setAuthModalMode,
    currentUser,
    currentRole,
    setCurrentRole,
    showToast
  } = useApp();
  const activeTab = customerTab;
  const setActiveTab = setCustomerTab;

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: customerProfile?.name || '',
    phone: customerProfile?.phone || '',
    email: customerProfile?.email || '',
    address: customerProfile?.address || '',
    district: customerProfile?.district || 'Dhaka',
    dateOfBirth: customerProfile?.dateOfBirth || ''
  });

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-[#F4F7FB]">
      
      {/* Desktop Sub-Navigation & Search Header */}
      <div className="bg-white border-b border-slate-200/80 shadow-soft sticky top-14 sm:top-16 z-30 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
          {/* Main Desktop Nav Links */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* Ready Stock Catalog Tab */}
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'stock'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Ready Stock</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-wide">
                24h BD
              </span>
            </button>

            <button
              onClick={() => setActiveTab('preorder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'preorder'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Create Pre-Order</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-navy-950 font-extrabold text-[9px] uppercase tracking-wide">
                Global
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Track Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Support & Chat</span>
            </button>
          </nav>

          {/* Right Highlights & Cart Drawer Trigger */}
          <div className="flex items-center gap-3 text-xs">
            {/* Quick Admin HQ Switcher for Super Admin */}
            {isAdmin && (
              <button
                onClick={() => setCurrentRole('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-xs shadow-sm transition-all active:scale-95 border border-amber-300"
                title="Switch to Super Admin HQ Dashboard"
              >
                <span>👑 Super Admin HQ</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold border border-brand-200 transition-all shadow-2xs group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 animate-pulse" />
                )}
              </div>
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-brand-600 text-white font-extrabold text-[10px]">
                  {totalCartCount}
                </span>
              )}
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${isAdmin ? 'bg-amber-500' : 'bg-brand-500'}`}>
                  {isAdmin ? '👑' : (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span>{isAdmin ? '👑 Admin Profile' : (currentUser.name?.split(' ')[0] || 'Profile')}</span>
                {getBirthdayStatus?.(currentUser?.dateOfBirth || customerProfile?.dateOfBirth)?.isToday && (
                  <span className="text-xs animate-bounce">🎂</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Full-Width Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12">
        <div key={activeTab} className="animate-fade-in-up">
          {activeTab === 'home' && (
            <CustomerHome 
              onStartPreOrder={() => setActiveTab('preorder')}
              onBrowseStock={() => setActiveTab('stock')}
            />
          )}

          {activeTab === 'stock' && (
            <CustomerStockCatalog 
              onOpenCheckout={() => {
                if (!currentUser) {
                  if (showToast) showToast('Please create an account or sign in to proceed with your purchase.', 'warning');
                  if (setAuthModalMode) setAuthModalMode('register');
                  if (setIsAuthModalOpen) setIsAuthModalOpen(true);
                  return;
                }
                setIsCheckoutOpen(true);
              }}
              onStartPreOrder={() => setActiveTab('preorder')} 
            />
          )}

          {activeTab === 'preorder' && (
            <PreOrderWizard onComplete={() => setActiveTab('orders')} />
          )}

          {activeTab === 'orders' && (
            <CustomerOrders onNewPreOrder={() => setActiveTab('preorder')} />
          )}

          {activeTab === 'chat' && (
            <CustomerChat />
          )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
            {!currentUser ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-950">Sign In Required</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Please log in to view your saved profile information, delivery address, and account settings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            ) : (() => {
              const effectiveName = isAdmin 
                ? (currentUser?.name || 'Super Administrator') 
                : (customerProfile?.name || (currentUser?.name && currentUser.role !== 'admin' ? currentUser.name : ''));

              const effectiveEmail = isAdmin 
                ? (currentUser?.email || 'admin@wrikmart.com') 
                : (customerProfile?.email || (currentUser?.email && currentUser.role !== 'admin' ? currentUser.email : ''));

              const effectivePhone = isAdmin 
                ? (currentUser?.phone || '+880 1800-000000') 
                : (customerProfile?.phone || (currentUser?.phone && currentUser.role !== 'admin' ? currentUser.phone : ''));

              const effectiveAddress = isAdmin 
                ? (customerProfile?.address || 'WrikMart Bangladesh HQ, Mirpur, Dhaka') 
                : (customerProfile?.address || '');

              const effectiveDistrict = customerProfile?.district || 'Dhaka';

              const getInitials = (name) => {
                if (!name || !name.trim()) return '';
                const parts = name.trim().split(/\s+/);
                if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              };

              const initials = getInitials(effectiveName);
              const contactDetails = [effectivePhone, effectiveEmail].filter(Boolean);

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md ${
                      isAdmin 
                        ? 'bg-gradient-to-tr from-amber-500 via-amber-600 to-navy-900 text-white border-2 border-amber-300' 
                        : 'bg-gradient-to-tr from-brand-600 to-brand-400 text-white'
                    }`}>
                      {isAdmin ? '👑' : initials ? initials : <User className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-xl text-navy-900">
                          {effectiveName || 'Customer Profile'}
                        </h3>
                        {isAdmin && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full uppercase border border-amber-300">
                            Super Administrator
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {contactDetails.length > 0 ? contactDetails.join(' • ') : 'Phone & email not set yet'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                          isAdmin 
                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isAdmin ? 'Super Admin HQ Access 👑' : (effectiveName ? 'Verified Customer 🇧🇩' : 'Guest Customer 🇧🇩')}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => setCurrentRole('admin')}
                            className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-navy-950 text-[11px] font-extrabold rounded-full shadow-2xs transition-all"
                          >
                            Open Admin HQ Dashboard →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isEditingProfile) {
                        updateCustomerProfile(profileForm);
                        setIsEditingProfile(false);
                      } else {
                        setProfileForm({
                          name: effectiveName,
                          phone: effectivePhone,
                          email: effectiveEmail,
                          address: effectiveAddress,
                          district: effectiveDistrict,
                          dateOfBirth: customerProfile?.dateOfBirth || ''
                        });
                        setIsEditingProfile(true);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                      isEditingProfile 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isEditingProfile ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile & Birthday</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Birthday Celebration & Reward Card */}
            {(() => {
              const bday = getBirthdayStatus(customerProfile?.dateOfBirth);
              return (
                <div className={`p-5 rounded-2xl border transition-all ${
                  bday.isToday 
                    ? 'bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-rose-200 ring-2 ring-rose-300/40' 
                    : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        bday.isToday ? 'bg-rose-500 text-white shadow-md animate-bounce' : 'bg-rose-100 text-rose-600'
                      }`}>
                        <Cake className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-navy-900">
                            WrikMart Birthday Club
                          </h4>
                          {bday.isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                              🎉 Celebrating Today!
                            </span>
                          )}
                        </div>

                        {bday.hasDOB ? (
                          <p className="text-xs text-slate-600 mt-1">
                            Your Birthday: <strong className="text-navy-900">{bday.formattedDOB}</strong> ({bday.nextOccurrenceLabel})
                          </p>
                        ) : (
                          <p className="text-xs text-amber-700 font-medium mt-1">
                            ⚠️ You haven't added your birthday yet! Add your date of birth below to receive an exclusive {birthdaySettings?.discountValue || 20}% OFF birthday voucher every year.
                          </p>
                        )}
                      </div>
                    </div>

                    {bday.isToday && (
                      <button
                        onClick={() => {
                          const coupon = generateBirthdayCoupon(customerProfile);
                          if (coupon) {
                            setAppliedCoupon(coupon);
                            showToast(`🎉 Happy Birthday! Coupon ${coupon.code} applied!`, 'success');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Claim {birthdaySettings?.discountValue || 20}% Gift</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Profile Form (Editable or View Only) */}
            {isEditingProfile ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-extrabold mb-1 flex items-center gap-1 text-rose-700">
                      <Cake className="w-3.5 h-3.5" />
                      <span>Date of Birth (Birthday Date) *</span>
                    </label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-rose-50/50 border border-rose-200 font-bold text-navy-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Used to send your annual birthday wish & surprise discount coupon.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Delivery District</label>
                    <select
                      value={profileForm.district}
                      onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateCustomerProfile(profileForm);
                      setIsEditingProfile(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Default Delivery Address</span>
                  {(customerProfile?.address || (isAdmin ? 'WrikMart Bangladesh HQ, Mirpur, Dhaka' : '')) ? (
                    <>
                      <p className="font-bold text-slate-800 text-sm">
                        {customerProfile?.address || (isAdmin ? 'WrikMart Bangladesh HQ, Mirpur, Dhaka' : '')}
                      </p>
                      <p className="text-slate-500">{customerProfile?.district || 'Dhaka'}, Bangladesh</p>
                    </>
                  ) : (
                    <div>
                      <p className="font-bold text-slate-600 text-sm">Not set yet</p>
                      <p className="text-slate-400 text-[11px]">Click Edit to set your delivery address</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth & Age</span>
                  {customerProfile?.dateOfBirth ? (
                    <div>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Cake className="w-4 h-4 text-rose-500" />
                        <span>{getBirthdayStatus(customerProfile.dateOfBirth).formattedDOB}</span>
                      </p>
                      <p className="text-emerald-600 font-semibold">
                        Turning {getBirthdayStatus(customerProfile.dateOfBirth).turningAge} years ({getBirthdayStatus(customerProfile.dateOfBirth).nextOccurrenceLabel})
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-amber-600 font-bold">Not set yet</p>
                      <p className="text-slate-400">Click Edit to set your birthday!</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Payment Method</span>
                  <p className="font-bold text-slate-800 text-sm">EPS Payment Gateway</p>
                  <p className="text-emerald-600 font-semibold">bKash, Nagad, Cards & Net Banking</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Birthday Voucher History</span>
                  {customerProfile?.birthdayWishes?.length > 0 ? (
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {customerProfile.birthdayWishes[0].couponCode}
                      </p>
                      <p className="text-slate-500">
                        {customerProfile.birthdayWishes[0].discount} OFF
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500">Voucher will be issued on your next birthday</p>
                  )}
                </div>
              </div>
            )}

            {/* Security & Password Card */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-navy-900">Account Password & Security</h4>
                  <p className="text-[11px] text-slate-500">Update your account password or recover lost access credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (setAuthModalMode) setAuthModalMode('changePassword');
                  if (setIsAuthModalOpen) setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-600 flex-shrink-0" />
              <span>
                <strong>100% Sourcing Protection:</strong> Every product is guaranteed genuine with official store invoice and direct warehouse warranty. If damaged or defective, 100% replacement or refund is processed in 24 hours.
              </span>
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Slide-Over Cart Drawer */}
      <CustomerCartDrawer 
        onProceedToCheckout={() => {
          if (!currentUser) {
            if (showToast) showToast('Please create an account or sign in to proceed with checkout.', 'warning');
            if (setAuthModalMode) setAuthModalMode('register');
            if (setIsAuthModalOpen) setIsAuthModalOpen(true);
            return;
          }
          setIsCheckoutOpen(true);
        }}
      />

      {/* Stock Checkout Modal */}
      {isCheckoutOpen && (
        <CustomerStockCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderPlaced={(order) => {}}
        />
      )}

      {/* Customer Birthday Celebration Pop-Up Modal */}
      <CustomerBirthdayModal />

      {/* Floating Mobile Cart Chip (Visible when cart has items) */}
      {totalCartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-[72px] right-3.5 z-40 bg-gradient-to-r from-navy-900 to-[#14234B] text-white px-3.5 py-2 rounded-full shadow-2xl border border-brand-400/40 flex items-center gap-2 text-xs font-black md:hidden active:scale-95 animate-fade-in"
          title="Open Cart Drawer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-brand-400" />
            <span className="w-2 h-2 rounded-full bg-brand-400 absolute -top-0.5 -right-0.5 animate-pulse"></span>
          </div>
          <span className="text-[11px] font-bold">Cart</span>
          <span className="px-1.5 py-0.2 rounded-full bg-brand-500 text-white text-[10px] font-extrabold min-w-[18px] text-center">
            {totalCartCount}
          </span>
        </button>
      )}

      {/* Fixed Bottom Mobile-Only Navigation Bar (Auto hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-1.5 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] md:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all min-w-[54px] active:scale-95 ${
              activeTab === 'home' ? 'text-brand-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110 text-brand-600 stroke-[2.5]' : ''}`} />
            <span>Home</span>
            {activeTab === 'home' && <span className="w-1.5 h-1 rounded-full bg-brand-600 -mt-0.5"></span>}
          </button>

          {/* 2. Ready Stock */}
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all min-w-[54px] active:scale-95 relative ${
              activeTab === 'stock' ? 'text-brand-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Zap className={`w-5 h-5 transition-transform ${activeTab === 'stock' ? 'scale-110 text-amber-500 fill-amber-400' : 'text-slate-400 fill-slate-200'}`} />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-white font-black text-[7px] leading-tight">
                24h
              </span>
            </div>
            <span>Stock</span>
            {activeTab === 'stock' && <span className="w-1.5 h-1 rounded-full bg-brand-600 -mt-0.5"></span>}
          </button>

          {/* 3. Center Highlight Pre-Order CTA */}
          <button
            onClick={() => setActiveTab('preorder')}
            className="flex flex-col items-center -mt-3.5 group active:scale-95 transition-transform min-w-[64px]"
            title="Create New Pre-Order"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              activeTab === 'preorder'
                ? 'bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-brand-500/40 ring-4 ring-brand-100 scale-105'
                : 'bg-gradient-to-tr from-brand-500 to-cyan-600 text-white shadow-brand-500/25 hover:shadow-brand-500/40'
            }`}>
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className={`text-[10px] font-black mt-0.5 ${
              activeTab === 'preorder' ? 'text-brand-600 font-extrabold' : 'text-slate-700 font-bold'
            }`}>
              Pre-Order
            </span>
          </button>

          {/* 4. Track Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all min-w-[54px] active:scale-95 ${
              activeTab === 'orders' ? 'text-brand-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Package className={`w-5 h-5 transition-transform ${activeTab === 'orders' ? 'scale-110 text-brand-600 stroke-[2.5]' : ''}`} />
            <span>Orders</span>
            {activeTab === 'orders' && <span className="w-1.5 h-1 rounded-full bg-brand-600 -mt-0.5"></span>}
          </button>

          {/* 5. Support & Chat */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all min-w-[54px] active:scale-95 relative ${
              activeTab === 'chat' ? 'text-brand-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === 'chat' ? 'scale-110 text-brand-600 stroke-[2.5]' : ''}`} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-1 border border-white"></span>
            </div>
            <span>Support</span>
            {activeTab === 'chat' && <span className="w-1.5 h-1 rounded-full bg-brand-600 -mt-0.5"></span>}
          </button>
        </div>
      </nav>
    </div>
  );
};


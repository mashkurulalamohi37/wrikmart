import React, { useState } from 'react';
import { CustomerHome } from './CustomerHome';
import { CustomerStockCatalog } from './CustomerStockCatalog';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { CustomerStockCheckoutModal } from './CustomerStockCheckoutModal';
import { PreOrderWizard } from './PreOrderWizard';
import { CustomerOrders } from './CustomerOrders';
import { CustomerChat } from './CustomerChat';
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
  Zap
} from 'lucide-react';

import { useApp } from '../../context/AppContext';

export const CustomerApp = () => {
  // Navigation Tabs: 'home' | 'stock' | 'preorder' | 'orders' | 'chat' | 'profile'
  const { customerTab, setCustomerTab, cart = [], isCartOpen, setIsCartOpen } = useApp();
  const activeTab = customerTab;
  const setActiveTab = setCustomerTab;

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

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

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                RC
              </div>
              <span>Rahim Chowdhury</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Width Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <CustomerHome 
            onStartPreOrder={() => setActiveTab('preorder')}
            onBrowseStock={() => setActiveTab('stock')}
            onOpenChat={() => setActiveTab('chat')}
            onOpenOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'stock' && (
          <CustomerStockCatalog 
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {activeTab === 'preorder' && (
          <PreOrderWizard 
            onComplete={() => setActiveTab('orders')}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'orders' && (
          <CustomerOrders 
            onNewOrder={() => setActiveTab('preorder')}
          />
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <CustomerChat />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                RC
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-navy-900">Rahim Chowdhury</h3>
                <p className="text-xs text-slate-500 mt-0.5">+880 1712-345678 • rahim.c@example.com</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200">
                  Verified Customer 🇧🇩
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Default Delivery Address</span>
                <p className="font-bold text-slate-800 text-sm">House 12, Road 5, Dhanmondi</p>
                <p className="text-slate-500">Dhaka-1205, Bangladesh</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Payment Method</span>
                <p className="font-bold text-slate-800 text-sm">bKash (01712-***678)</p>
                <p className="text-emerald-600 font-semibold">Instant Online MFS & COD Enabled</p>
              </div>
            </div>

            <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-600 flex-shrink-0" />
              <span>
                <strong>100% Sourcing Protection:</strong> Every product is guaranteed genuine with official store invoice and direct warehouse warranty. If damaged or defective, 100% replacement or refund is processed in 24 hours.
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Slide-Over Cart Drawer */}
      <CustomerCartDrawer 
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Stock Checkout Modal */}
      <CustomerStockCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => {}}
      />

      {/* Fixed Bottom Mobile-Only Navigation Bar (Auto hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-3 md:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === 'home' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === 'stock' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('preorder')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === 'preorder' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 absolute -top-0.5 -right-0.5"></span>
            </div>
            <span>Pre-Order</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-600 hover:text-brand-600 relative transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              {totalCartCount > 0 && (
                <span className="px-1 rounded-full bg-rose-500 text-white font-extrabold text-[8px] absolute -top-1 -right-2">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === 'orders' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders</span>
          </button>
        </div>
      </nav>
    </div>
  );
};


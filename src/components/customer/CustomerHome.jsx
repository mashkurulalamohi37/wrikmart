import React, { useState } from 'react';
import { CountryFlag } from '../common/CountryFlag';
import { StoreBrandBadge } from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Package, 
  MessageCircle, 
  ShieldCheck, 
  BadgePercent, 
  Globe2, 
  Truck, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRightLeft,
  Flame,
  Plus,
  Gift,
  Cake,
  Tag
} from 'lucide-react';

export const CustomerHome = ({ onStartPreOrder, onBrowseStock, onOpenChat, onOpenOrders }) => {
  const { 
    inventory = [], 
    addToCart,
    customerProfile,
    getBirthdayStatus,
    birthdaySettings,
    generateBirthdayCoupon,
    setAppliedCoupon,
    showToast,
    setPrefilledPreOrder
  } = useApp();
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickPaste = () => {
    if (quickUrl.trim() && setPrefilledPreOrder) {
      setPrefilledPreOrder({ url: quickUrl.trim() });
    }
    onStartPreOrder();
  };

  // Top 4 in-stock showcase items
  const featuredStock = inventory.filter(i => i.currentStock > 0).slice(0, 4);

  return (
    <div className="space-y-10 pb-12">
      
      {/* Birthday Celebration Banner for Logged-In Customer */}
      {(() => {
        const bday = getBirthdayStatus?.(customerProfile?.dateOfBirth);
        if (!bday?.isToday) return null;
        const cleanName = (customerProfile?.name || 'Friend').split(' ')[0];
        const code = `BDAY-${cleanName.toUpperCase()}-${new Date().getFullYear()}`;
        const discountText = (birthdaySettings?.discountType || 'percentage') === 'percentage'
          ? `${birthdaySettings?.discountValue || 20}% OFF`
          : `৳${birthdaySettings?.discountValue || 500} OFF`;

        return (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                🎂
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  Your Birthday Celebration Special!
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Happy Birthday, {cleanName}! 🎉
                </h2>
                <p className="text-xs text-rose-100 max-w-xl">
                  Team WrikMart wishes you a joyful celebration! Use code <strong className="font-mono underline font-black text-white">{code}</strong> for <strong>{discountText}</strong> on all orders today!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto relative z-10 flex-shrink-0">
              <button
                onClick={() => {
                  const coupon = generateBirthdayCoupon(customerProfile);
                  if (coupon) {
                    setAppliedCoupon(coupon);
                    showToast(`🎉 Happy Birthday! Coupon ${coupon.code} applied!`, 'success');
                  }
                }}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-rose-600" />
                <span>Apply {discountText} to Cart</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* 1. Full-Width Hero Section with Rich Visuals */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0AA79D] via-[#08867E] to-[#0D1B3D] text-white p-8 sm:p-12 lg:p-14 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cross-Border Pre-Order & Ready Stock Commerce</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Shop Global Brands from <br />
              <span className="text-amber-300 underline decoration-amber-400">India, Dubai & Thailand</span>
            </h1>

            <p className="text-sm sm:text-base text-cyan-100 max-w-xl leading-relaxed">
              Found something on <strong>Amazon, Nike, Apple, Zara, Flipkart or Noon</strong>? 
              Paste the product URL or image. Our local purchasing agents buy directly from authentic stores and deliver to your doorstep in Bangladesh. Or order from our <strong>Dhaka Ready Stock</strong> for 24-48h delivery!
            </p>

            {/* Quick URL Input Bar inside Hero */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/30 max-w-xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickPaste();
                  }}
                  placeholder="Paste product link (Nike, Amazon, Zara)..."
                  className="w-full pl-4 pr-3 py-3 rounded-xl bg-white text-navy-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                onClick={handleQuickPaste}
                className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md transform active:scale-95"
              >
                <span>Start Pre-Order</span>
                <ArrowRight className="w-4 h-4 text-navy-950" />
              </button>
            </div>

            {/* Key Trust Micro Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-100/90 pt-2 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> 25% Advance on Pre-Order</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> Cash on Delivery for Stock</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> Doorstep Courier in BD</span>
            </div>
          </div>

          {/* Right Highlights: Country Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              {
                country: 'India',
                code: 'India',
                hubs: 'Delhi & Mumbai Hubs',
                stores: 'Nike, Amazon IN, Flipkart, Zara, Myntra',
                time: '5-7 Days Air Freight'
              },
              {
                country: 'Dubai (UAE)',
                code: 'Dubai',
                hubs: 'Dubai Central Warehouse',
                stores: 'Apple Store, Dubai Mall, Noon, Sephora',
                time: '4-6 Days Air Express'
              },
              {
                country: 'Thailand',
                code: 'Thailand',
                hubs: 'Bangkok Logistics Hub',
                stores: 'CentralWorld, Siam Paragon, Shopee TH',
                time: '6-8 Days Air Freight'
              }
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CountryFlag country={c.code} className="w-6 h-4 shadow-sm rounded-[3px]" />
                    <h3 className="font-extrabold text-sm text-white">{c.country}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-cyan-200">{c.time}</span>
                </div>
                <p className="text-xs text-amber-200 mt-1.5 font-semibold">{c.hubs}</p>
                <p className="text-[11px] text-cyan-100/80 mt-0.5">{c.stores}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Decorative background vectors */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. Ready Stock in Bangladesh Spotlight Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-900 flex items-center gap-2">
                ⚡ Ready Stock in Bangladesh Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dispatched directly from Dhaka Tejgaon Warehouse within 24 hours. Cash on Delivery & Free Delivery vouchers available!
            </p>
          </div>

          <button
            onClick={onBrowseStock}
            className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-200"
          >
            <span>Explore All Ready Stock ({inventory.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredStock.map(prod => {
            const discountPercent = prod.originalMrp 
              ? Math.round(((prod.originalMrp - prod.sellingPrice) / prod.originalMrp) * 100) 
              : 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-soft hover:shadow-card hover:border-brand-400 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer" onClick={onBrowseStock}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[9px] shadow-sm">
                        -{discountPercent}% OFF
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[9px] shadow-sm">
                      ⚡ 24h Dhaka
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">{prod.brand}</span>
                    <h3 
                      onClick={onBrowseStock}
                      className="font-bold text-xs text-navy-900 line-clamp-2 cursor-pointer hover:text-brand-600 transition-colors mt-0.5"
                    >
                      {prod.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-navy-900 block">
                      ৳{prod.sellingPrice.toLocaleString()}
                    </span>
                    {prod.originalMrp && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ৳{prod.originalMrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-sm transition-all"
                    title="Add to Cart"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Popular Pre-Order Stores & Brands */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-navy-900">Supported Global Sourcing Stores</h2>
            <p className="text-xs text-slate-500">Order from any official website or store in India, UAE, and Thailand</p>
          </div>
          <button onClick={onStartPreOrder} className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            <span>Custom Website Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Nike India', country: 'India', cat: 'Sneakers & Apparel' },
            { name: 'Apple Dubai', country: 'Dubai', cat: 'iPhone, AirPods, Mac' },
            { name: 'Zara Global', country: 'India', cat: 'Designer Fashion' },
            { name: 'Amazon India', country: 'India', cat: 'Electronics & Books' },
            { name: 'Noon Dubai', country: 'Dubai', cat: 'Perfumes & Watches' },
            { name: 'Shopee Thailand', country: 'Thailand', cat: 'Skincare & Cosmetics' }
          ].map((store, i) => (
            <button
              key={i}
              onClick={onStartPreOrder}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-brand-500 text-left transition-all group"
            >
              <div className="mb-3">
                <StoreBrandBadge storeName={store.name} />
              </div>
              <h3 className="font-bold text-xs text-navy-900 group-hover:text-brand-600 transition-colors">{store.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{store.cat}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. How Pre-Order Works (4-Step Infographic) */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-2xl font-extrabold text-navy-900 mt-1">How WrikMart Pre-Order Works</h2>
          <p className="text-xs text-slate-500 mt-1">From international store shelves to your home in Bangladesh</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Paste Link & Specs',
              desc: 'Select country (India, Dubai, or Thailand) and submit product link, size, color and quantity.',
              icon: <ShoppingBag className="w-5 h-5 text-brand-600" />
            },
            {
              step: '02',
              title: 'Pay 25% Advance',
              desc: 'Confirm your order by paying 25% advance safely through bKash, Nagad, or Debit/Credit Card.',
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />
            },
            {
              step: '03',
              title: 'Agent Buys & Receipts',
              desc: 'Our local on-ground agent purchases the product, records the exact store MRP, and sends it to our cargo hub.',
              icon: <Zap className="w-5 h-5 text-purple-600" />
            },
            {
              step: '04',
              title: 'Doorstep Delivery',
              desc: 'Air shipped to Dhaka, cleared through customs, and delivered to your home with live tracking.',
              icon: <Truck className="w-5 h-5 text-cyan-600" />
            }
          ].map((st, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative space-y-2">
              <span className="font-extrabold text-2xl text-slate-300 font-mono block">{st.step}</span>
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                {st.icon}
              </div>
              <h3 className="font-bold text-sm text-navy-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Choose WrikMart Trust Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-soft space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">100% Secure Payment</h3>
          <p className="text-xs text-slate-500">Advance held in escrow with automated refund guarantee</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-soft space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <BadgePercent className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">Original MRP & Receipts</h3>
          <p className="text-xs text-slate-500">Exact store invoice provided with zero hidden markups</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-soft space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">3 Global Sourcing Hubs</h3>
          <p className="text-xs text-slate-500">Dedicated agents in New Delhi, Dubai, and Bangkok</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-soft space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-navy-900">64 District Delivery</h3>
          <p className="text-xs text-slate-500">Last-mile doorstep courier with Steadfast & Pathao</p>
        </div>
      </section>

    </div>
  );
};

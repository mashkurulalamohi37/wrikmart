import React, { useState } from 'react';
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
  ArrowRightLeft
} from 'lucide-react';

export const CustomerHome = ({ onStartPreOrder, onOpenChat, onOpenOrders }) => {
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickPaste = () => {
    onStartPreOrder();
  };

  return (
    <div className="space-y-10 pb-12">
      
      {/* 1. Full-Width Hero Section with Rich Visuals */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0AA79D] via-[#08867E] to-[#0D1B3D] text-white p-8 sm:p-12 lg:p-14 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cross-Border Pre-Order Commerce</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Shop Global Brands from <br />
              <span className="text-amber-300 underline decoration-amber-400">India, Dubai & Thailand</span>
            </h1>

            <p className="text-sm sm:text-base text-cyan-100 max-w-xl leading-relaxed">
              Found something on <strong>Amazon, Nike, Apple, Zara, Flipkart or Noon</strong>? 
              Paste the product URL or image. Our local purchasing agents buy directly from authentic stores and deliver to your doorstep in Bangladesh.
            </p>

            {/* Quick URL Input Bar inside Hero */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/30 max-w-xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
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
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> 25% Advance Payment</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> 100% Genuine Receipts</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> Doorstep Courier in BD</span>
            </div>
          </div>

          {/* Right Highlights: Country Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              {
                country: 'India 🇮🇳',
                hubs: 'Delhi & Mumbai Hubs',
                stores: 'Nike, Amazon IN, Flipkart, Zara, Myntra',
                time: '5-7 Days Air Freight'
              },
              {
                country: 'Dubai 🇦🇪',
                hubs: 'Dubai Central Warehouse',
                stores: 'Apple Store, Dubai Mall, Noon, Sephora',
                time: '4-6 Days Air Express'
              },
              {
                country: 'Thailand 🇹🇭',
                hubs: 'Bangkok Logistics Hub',
                stores: 'CentralWorld, Siam Paragon, Shopee TH',
                time: '6-8 Days Air Freight'
              }
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white">{c.country}</h3>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-cyan-200">{c.time}</span>
                </div>
                <p className="text-xs text-amber-200 mt-1 font-semibold">{c.hubs}</p>
                <p className="text-[11px] text-cyan-100/80 mt-0.5">{c.stores}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Decorative background vectors */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. Popular Pre-Order Stores & Brands */}
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
            { name: 'Nike India', flag: '🇮🇳', cat: 'Sneakers & Apparel', color: 'from-orange-500/10 to-transparent' },
            { name: 'Apple Dubai', flag: '🇦🇪', cat: 'iPhone, AirPods, Mac', color: 'from-blue-500/10 to-transparent' },
            { name: 'Zara Global', flag: '🇮🇳', cat: 'Designer Fashion', color: 'from-slate-500/10 to-transparent' },
            { name: 'Amazon India', flag: '🇮🇳', cat: 'Electronics & Books', color: 'from-amber-500/10 to-transparent' },
            { name: 'Noon Dubai', flag: '🇦🇪', cat: 'Perfumes & Watches', color: 'from-yellow-500/10 to-transparent' },
            { name: 'Shopee Thailand', flag: '🇹🇭', cat: 'Skincare & Cosmetics', color: 'from-emerald-500/10 to-transparent' }
          ].map((store, i) => (
            <button
              key={i}
              onClick={onStartPreOrder}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-brand-500 text-left transition-all group"
            >
              <span className="text-2xl block mb-1.5">{store.flag}</span>
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

import React, { useState, useRef } from 'react';
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
  Tag,
  ChevronLeft,
  ChevronRight
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
  const storesSliderRef = useRef(null);

  const scrollStores = (direction) => {
    if (storesSliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      storesSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickPaste = () => {
    let clean = (quickUrl || '').trim();
    if (!clean) {
      showToast('Please enter or paste a product link (e.g. Amazon, Nike, Zara, Apple)', 'warning');
      return;
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      if (clean.includes('.') || clean.includes('/') || clean.startsWith('www.')) {
        clean = `https://${clean}`;
      }
    }

    const lower = clean.toLowerCase();
    let detectedCountry = 'India';
    let detectedPlatform = 'Global Store';

    if (lower.includes('amazon.ae') || lower.includes('noon.com') || lower.includes('.ae') || lower.includes('dubai') || lower.includes('apple.com/ae')) {
      detectedCountry = 'Dubai';
      detectedPlatform = lower.includes('noon') ? 'Noon Dubai' : lower.includes('amazon') ? 'Amazon UAE' : lower.includes('apple') ? 'Apple Dubai' : 'Dubai Store';
    } else if (lower.includes('shopee.co.th') || lower.includes('central.co.th') || lower.includes('.th') || lower.includes('thailand') || lower.includes('lazada')) {
      detectedCountry = 'Thailand';
      detectedPlatform = lower.includes('shopee') ? 'Shopee Thailand' : 'Thailand Store';
    } else {
      detectedCountry = 'India';
      if (lower.includes('amazon') || lower.includes('amzn.')) detectedPlatform = 'Amazon India';
      else if (lower.includes('flipkart')) detectedPlatform = 'Flipkart India';
      else if (lower.includes('myntra')) detectedPlatform = 'Myntra India';
      else if (lower.includes('nike')) detectedPlatform = 'Nike India';
      else if (lower.includes('zara')) detectedPlatform = 'Zara India';
    }

    // Extract title from slug or ASIN
    let title = '';
    try {
      const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
      const parts = decodeURIComponent(parsed.pathname).split('/').filter(Boolean);
      const dpIdx = parts.indexOf('dp');
      if (dpIdx > 0) {
        title = parts[dpIdx - 1].replace(/[-_+]/g, ' ');
      } else if (parts.length > 0) {
        const candidates = parts.filter(p => p !== 'dp' && p !== 'gp' && p !== 'product' && p !== 'd' && !/^[A-Z0-9]{10}$/i.test(p));
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.length - a.length);
          title = candidates[0].replace(/[-_+]/g, ' ');
        }
      }
    } catch (e) {}

    if (title) {
      title = title.split(' ').filter(w => w.length > 1 && !/^\d+$/.test(w) && w.length < 30).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    if (!title) {
      if (lower.includes('amazon') || lower.includes('amzn')) title = 'Amazon Imported Item';
      else if (lower.includes('apple') || lower.includes('iphone')) title = 'Apple Device Import';
      else if (lower.includes('nike')) title = 'Nike Footwear Import';
      else title = 'Custom Imported Product';
    }

    const payload = {
      url: clean,
      name: title,
      country: detectedCountry,
      platform: detectedPlatform,
      expectedPrice: lower.includes('apple') || lower.includes('iphone') ? 85000 : 4500
    };

    if (setPrefilledPreOrder) {
      setPrefilledPreOrder(payload);
    }
    showToast(`Recognized ${detectedPlatform} link! Loading Pre-Order form...`, 'success');
    onStartPreOrder();
  };

  // Top 4 in-stock showcase items
  const featuredStock = inventory.filter(i => (Number(i.currentStock || i.stock || 0) > 0)).slice(0, 4);

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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0AA79D] via-[#08867E] to-[#0D1B3D] text-white p-5 sm:p-10 lg:p-14 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/15 text-[11px] sm:text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span>Cross-Border Pre-Order & Ready Stock Commerce</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] sm:leading-[1.15]">
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
                  type="text"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickPaste();
                  }}
                  placeholder="Paste product link (Amazon, Nike, Zara, Apple)..."
                  className="w-full pl-4 pr-3 py-3 rounded-xl bg-white text-navy-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                onClick={handleQuickPaste}
                className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md transform active:scale-95 cursor-pointer flex-shrink-0"
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

      {/* 2. Supported Global Sourcing Stores (Horizontal Slider as shown in 2nd image) */}
      <section className="space-y-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0D1B3D] tracking-tight">
              Supported Global Sourcing Stores
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Order from any official website or store in India, UAE, and Thailand
            </p>
          </div>
          <button 
            onClick={onStartPreOrder} 
            className="self-start sm:self-auto text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-200 shadow-2xs cursor-pointer"
          >
            <span>Custom Website Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slider Container with Left & Right Arrow Buttons */}
        <div className="relative group">
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollStores('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#0D1B3D]/85 hover:bg-[#0D1B3D] text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
            title="Scroll Left"
            aria-label="Previous Stores"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollStores('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#0D1B3D]/85 hover:bg-[#0D1B3D] text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
            title="Scroll Right"
            aria-label="Next Stores"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Horizontal Scrollable Row */}
          <div 
            ref={storesSliderRef}
            className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1"
          >
            {[
              { name: 'Nike India', country: 'India', cat: 'Sneakers & Apparel' },
              { name: 'Apple Dubai', country: 'Dubai', cat: 'iPhone, AirPods, Mac' },
              { name: 'Zara Global', country: 'India', cat: 'Designer Fashion' },
              { name: 'Amazon India', country: 'India', cat: 'Electronics & Books' },
              { name: 'Noon Dubai', country: 'Dubai', cat: 'Perfumes & Watches' },
              { name: 'Shopee Thailand', country: 'Thailand', cat: 'Skincare & Cosmetics' },
              { name: 'Flipkart India', country: 'India', cat: 'Smartphones & Tech' },
              { name: 'Sephora Dubai', country: 'Dubai', cat: 'Luxury Cosmetics' },
              { name: 'Amazon UAE', country: 'Dubai', cat: 'Dubai Lifestyle & Tech' },
              { name: 'Central Thailand', country: 'Thailand', cat: 'Bangkok Mall Fashion' },
              { name: 'Myntra India', country: 'India', cat: 'Trending Western Fashion' },
              { name: 'Lazada Thailand', country: 'Thailand', cat: 'Thai Beauty & Tech' }
            ].map((store, i) => (
              <button
                key={i}
                onClick={() => {
                  if (setPrefilledPreOrder) {
                    setPrefilledPreOrder({ country: store.country, platform: store.name });
                  }
                  onStartPreOrder();
                }}
                className="w-[160px] sm:w-[185px] flex-shrink-0 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-brand-500 text-left transition-all group/card flex flex-col justify-between cursor-pointer"
              >
                <div className="mb-4">
                  <StoreBrandBadge storeName={store.name} />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-navy-900 group-hover/card:text-brand-600 transition-colors leading-tight">
                    {store.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    {store.cat}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Ready Stock in Bangladesh Spotlight Section */}
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

        {featuredStock.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-soft flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 border border-brand-100 flex items-center justify-center mb-3.5 shadow-xs">
              <Package className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-base text-navy-900">Stock Catalog is Ready for Upload</h4>
            <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
              No ready-stock products are currently listed. Log into the Admin Console to upload real ready-stock inventory with images, prices, and warehouse locations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredStock.map(prod => {
              const price = Number(prod.sellingPrice ?? prod.price ?? 0);
              const discountPercent = prod.originalMrp 
                ? Math.round(((prod.originalMrp - price) / prod.originalMrp) * 100) 
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
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
                        }}
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
                        ৳{price.toLocaleString()}
                      </span>
                      {prod.originalMrp && prod.originalMrp > price && (
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
        )}
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
              icon: <ShoppingBag className="w-5 h-5 text-brand-600" />,
              color: 'text-brand-600'
            },
            {
              step: '02',
              title: 'Pay 25% Advance',
              desc: 'Confirm your order by paying 25% advance safely through bKash, Nagad, or Debit/Credit Card.',
              icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
              color: 'text-emerald-600'
            },
            {
              step: '03',
              title: 'Agent Buys & Receipts',
              desc: 'Our local on-ground agent purchases the product, records the exact store MRP, and sends it to our cargo hub.',
              icon: <Zap className="w-5 h-5 text-purple-600" />,
              color: 'text-purple-600'
            },
            {
              step: '04',
              title: 'Doorstep Delivery',
              desc: 'Air shipped to Dhaka, cleared through customs, and delivered to your home with live tracking.',
              icon: <Truck className="w-5 h-5 text-cyan-600" />,
              color: 'text-cyan-600'
            }
          ].map((st, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative space-y-2 hover:shadow-card hover:border-slate-300 transition-all">
              <span className={`font-black text-2xl font-mono block tracking-tight ${st.color}`}>
                {st.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center mb-2">
                {st.icon}
              </div>
              <h3 className="font-bold text-sm text-navy-900">{st.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
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

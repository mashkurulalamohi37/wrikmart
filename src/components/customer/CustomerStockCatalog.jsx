import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Search, 
  Filter, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Star, 
  Eye, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  Flame,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Video,
  ExternalLink
} from 'lucide-react';
import { FormattedDescription } from '../common/FormattedDescription';

const CATEGORIES = [
  { id: 'All', label: 'All Ready Stock', icon: '🌟' },
  { id: 'Clearance', label: 'Defect & Clearance Deals', icon: '🏷️' },
  { id: 'Electronics', label: 'Electronics & Audio', icon: '🎧' },
  { id: 'Watches', label: 'Watches', icon: '⌚' },
  { id: 'Footwear', label: 'Footwear & Sneakers', icon: '👟' },
  { id: 'Fashion', label: 'Fashion & Apparel', icon: '👕' },
  { id: 'Beauty & Skincare', label: 'Beauty & Skincare', icon: '💄' },
  { id: 'Fragrance', label: 'Fragrance & Perfumes', icon: '🌸' }
];

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

export const CustomerStockCatalog = ({ onOpenCheckout, initialCategory, onStartPreOrder }) => {
  const { 
    inventory = [], 
    addToCart, 
    setIsCartOpen,
    stockSearchQuery = '',
    setStockSearchQuery,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    clearanceSettings,
    showToast
  } = useApp();

  // Dynamic Categories merging defaults, custom created categories, and any categories in inventory
  const allCategories = useMemo(() => {
    let customCats = [];
    try {
      const saved = localStorage.getItem('wrikmart_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) customCats = parsed;
      }
    } catch (e) {}

    const invCatIds = (inventory || []).map(i => i?.category).filter(Boolean);
    const baseList = (clearanceSettings?.enabled === false)
      ? CATEGORIES.filter(c => c.id !== 'Clearance')
      : CATEGORIES;
    const existingIds = new Set(baseList.map(c => String(c.id).toLowerCase()));
    
    const extraCats = [];
    customCats.forEach(c => {
      if (!c) return;
      const idKey = String(c.id || c.name || '').toLowerCase();
      if (idKey && !existingIds.has(idKey)) {
        existingIds.add(idKey);
        extraCats.push({ id: c.id || c.name, label: c.name || c.id, icon: '📦' });
      }
    });

    invCatIds.forEach(catId => {
      const idKey = String(catId || '').toLowerCase();
      if (idKey && !existingIds.has(idKey)) {
        existingIds.add(idKey);
        extraCats.push({ id: catId, label: String(catId), icon: '🏷️' });
      }
    });

    return [...baseList, ...extraCats];
  }, [inventory, clearanceSettings?.enabled]);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (initialCategory) return initialCategory;
    try {
      return localStorage.getItem('wrikmart_stock_category') || 'All';
    } catch (e) {
      return 'All';
    }
  });

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    try {
      localStorage.setItem('wrikmart_stock_category', catId);
    } catch (e) {}
  };
  const searchQuery = stockSearchQuery || '';
  const setSearchQuery = (val) => {
    if (setStockSearchQuery) setStockSearchQuery(val);
  };
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'discount' | 'bestseller'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // For Quick View modal
  const [quantities, setQuantities] = useState({}); // local quantity selections by product id

  // Category pills smooth scroll state & ref
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  const handleScroll = (direction) => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inventory]);

  // When search query is active, reset category to All if current category has 0 matches
  useEffect(() => {
    if (stockSearchQuery && selectedCategory !== 'All') {
      const q = String(stockSearchQuery).toLowerCase();
      const matchesInSelectedCat = (inventory || []).some(item => 
        item && item.category === selectedCategory && (
          String(item.name || '').toLowerCase().includes(q) ||
          String(item.brand || '').toLowerCase().includes(q) ||
          String(item.sku || '').toLowerCase().includes(q)
        )
      );
      if (!matchesInSelectedCat) {
        setSelectedCategory('All');
      }
    }
  }, [stockSearchQuery, inventory, selectedCategory]);

  // Handle local quantity stepper
  const handleQuantityChange = (productId, delta, maxStock) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.min(Math.max(1, current + delta), maxStock || 1);
      return { ...prev, [productId]: next };
    });
  };

  // Filtered & Sorted Stock Inventory
  const filteredProducts = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    return (inventory || []).filter(item => {
      if (!item) return false;
      const matchesCategory = 
        selectedCategory === 'All' 
          ? true 
          : selectedCategory === 'Clearance' 
            ? Boolean(item.isDefect) 
            : item.category === selectedCategory;

      const matchesSearch = 
        !q ||
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.brand || '').toLowerCase().includes(q) ||
        (item.defectNote ? String(item.defectNote).toLowerCase().includes(q) : false) ||
        (item.sku ? String(item.sku).toLowerCase().includes(q) : false);
      const matchesStock = !inStockOnly || (Number(item.currentStock ?? item.stock ?? 0) > 0);

      return matchesCategory && matchesSearch && matchesStock;
    }).sort((a, b) => {
      const priceA = Number(a?.sellingPrice ?? a?.price ?? 0);
      const priceB = Number(b?.sellingPrice ?? b?.price ?? 0);
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'discount') {
        const mrpA = Number(a?.originalMrp || 0);
        const mrpB = Number(b?.originalMrp || 0);
        const discA = mrpA > 0 ? ((mrpA - priceA) / mrpA) : 0;
        const discB = mrpB > 0 ? ((mrpB - priceB) / mrpB) : 0;
        return discB - discA;
      }
      if (sortBy === 'bestseller') return Number(b?.soldQty || 0) - Number(a?.soldQty || 0);
      return 0; // default featured
    });
  }, [inventory, selectedCategory, searchQuery, sortBy, inStockOnly]);

  const handleAddToCartClick = (product) => {
    const qty = quantities[product.id] || 1;
    const success = addToCart(product, qty);
    if (success) {
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
      if (selectedProduct) {
        setSelectedProduct(null);
      }
    }
  };

  const handleBuyNowClick = (product) => {
    if (!currentUser) {
      if (showToast) showToast('Please create an account or sign in to proceed with your purchase.', 'warning');
      if (setAuthModalMode) setAuthModalMode('register');
      if (setIsAuthModalOpen) setIsAuthModalOpen(true);
      return;
    }
    const qty = quantities[product.id] || 1;
    const success = addToCart(product, qty);
    if (success) {
      setSelectedProduct(null);
      if (onOpenCheckout) {
        onOpenCheckout();
      } else {
        setIsCartOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header Banner & Ready Stock Info */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0E3A5A] via-[#0A5265] to-[#0D1B3D] text-white p-6 sm:p-8 shadow-card border border-teal-800/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Ready for Immediate 24-48h Doorstep Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Ready Stock Hub in <span className="text-amber-300">Bangladesh</span>
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
              Genuine global items already imported, custom-cleared, and stocked in our <strong>Dhaka Tejgaon Central Warehouse</strong>. No international waiting period — order today, receive within 24 to 48 hours nationwide!
            </p>
          </div>

          {/* Quick Perks Pill Cards */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 text-xs w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 flex items-center gap-3 flex-1 sm:flex-initial">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <p className="font-bold text-white">Same-Day Dhaka</p>
                <span className="text-[10px] text-cyan-200">Express Delivery</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 flex items-center gap-3 flex-1 sm:flex-initial">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                🛡️
              </div>
              <div>
                <p className="font-bold text-white">100% Authentic</p>
                <span className="text-[10px] text-cyan-200">Official Store Invoices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blur elements */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Enhanced Category Filter Bar with Smooth Navigation & Zero Ugly Scrollbar */}
      <div className="relative">
        {/* Left Scroll Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Left Edge Fade Gradient Mask */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F4F7FB] via-[#F4F7FB]/70 to-transparent z-10 pointer-events-none rounded-l-2xl" />
        )}

        {/* Scrollable Category Track */}
        <div 
          ref={categoryScrollRef}
          onScroll={checkScroll}
          className="overflow-x-auto pb-1 scrollbar-none scroll-smooth flex items-center gap-2.5 px-0.5"
        >
          {allCategories.map(cat => {
            const count = cat.id === 'All' 
              ? (inventory || []).length 
              : cat.id === 'Clearance'
                ? (inventory || []).filter(i => i && i.isDefect).length
                : (inventory || []).filter(i => i && i.category === cat.id).length;

            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-2 ring-brand-500/20'
                    : 'bg-white text-slate-700 hover:text-navy-950 hover:bg-slate-50/90 border border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="whitespace-nowrap">{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Edge Fade Gradient Mask */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F4F7FB] via-[#F4F7FB]/70 to-transparent z-10 pointer-events-none rounded-r-2xl" />
        )}

        {/* Right Scroll Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Search, Sort & Availability Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ready stock by name, brand, or SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Sort & In-Stock Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
            <span>In-Stock Only</span>
          </label>

          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden xs:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="featured">Featured / Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Discount %</option>
              <option value="bestseller">Bestseller Popularity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dedicated Defect & Clearance Deals Showcase Banner */}
      {selectedCategory === 'Clearance' && (clearanceSettings?.enabled !== false) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border-2 border-rose-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-rose-500/30">
              🏷️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base sm:text-lg text-navy-950">
                  {clearanceSettings?.bannerTitle || 'Defect & Clearance Deals (Open-Box / B-Stock)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase tracking-wide">
                  {clearanceSettings?.badgeText || 'Heavily Discounted'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {clearanceSettings?.bannerSubtitle || '100% authentic genuine items with slight packaging damage or cosmetic box creases incurred during international air cargo transit. Every piece is strictly inspected, tested, and backed by our full warranty at exceptional discount prices!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-rose-200 shadow-2xs shrink-0">
            <span>{clearanceSettings?.guaranteeBadge || '🛡️ 100% Authentic Guarantee'}</span>
          </div>
        </div>
      )}

      {/* 4. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-navy-900">
              {selectedCategory === 'Clearance' ? 'No Clearance Deals Currently Available' : 'No Ready Stock Products Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCategory === 'Clearance'
                ? 'All defect and clearance products have been sold out! Check back soon for fresh arrivals.'
                : 'Try relaxing your search terms or clearing the in-stock filter.'}
            </p>
          </div>
          <button
            onClick={() => {
              handleSelectCategory('All');
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map(product => {
            const isOutOfStock = product.currentStock <= 0;
            const isLowStock = product.currentStock > 0 && product.currentStock <= (product.reorderLevel || 5);
            const qty = quantities[product.id] || 1;
            
            const discountPercent = product.originalMrp 
              ? Math.round(((product.originalMrp - product.sellingPrice) / product.originalMrp) * 100) 
              : 0;

            const savingsBDT = product.originalMrp && product.originalMrp > product.sellingPrice
              ? product.originalMrp - product.sellingPrice
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:border-brand-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image Box */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 items-start">
                    {product.isDefect ? (
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span>⚠️ Clearance Deal</span>
                      </span>
                    ) : product.badge ? (
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-navy-900/80 backdrop-blur-md text-amber-300 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{product.badge}</span>
                      </span>
                    ) : null}

                    {discountPercent > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500 text-navy-950 font-extrabold text-[9px] sm:text-[10px] shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Warehouse Origin Pill */}
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[9px] sm:text-[10px] flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      <span className="truncate max-w-[90px] sm:max-w-none">{product.warehouse || 'Dhaka'}</span>
                    </span>
                  </div>

                  {/* Quick View Button on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Quick View Details"
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Content Box */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  {/* Top Block: Brand, Rating, Title, Stock & Defect */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                      <span className="text-brand-600 uppercase tracking-wider truncate max-w-[90px]">{product.brand}</span>
                      <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                        <span className="text-slate-700 font-bold">{product.rating || 4.8}</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="font-extrabold text-xs sm:text-sm text-navy-900 line-clamp-2 hover:text-brand-600 cursor-pointer transition-colors leading-tight min-h-[2.4em]"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Stock Level & Fast Delivery Info (Directly below title) */}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px]">
                      <span className={`font-bold flex items-center gap-1 truncate ${
                        isOutOfStock 
                          ? 'text-rose-600' 
                          : isLowStock 
                            ? 'text-amber-600' 
                            : 'text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                          isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                        }`} />
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.currentStock} left!` : `In Stock`}
                      </span>

                      <span className="text-slate-400 text-[9px] sm:text-[10px] font-medium flex items-center gap-1">
                        <Truck className="w-3 h-3 text-brand-600" />
                        24-48h
                      </span>
                    </div>
                    
                    {/* Defect Condition Note - Compact Card Preview */}
                    {product.isDefect && product.defectNote && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs space-y-1.5">
                        <p className="text-[10px] sm:text-[11px] text-amber-950 leading-normal line-clamp-2">
                          <span className="font-extrabold text-amber-900">⚠️ Condition: </span>
                          <span>{product.defectNote}</span>
                        </p>
                        {product.videoUrl && (
                          <div className="pt-0.5">
                            <a
                              href={product.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200/80 transition-all cursor-pointer shadow-2xs group"
                            >
                              <Video className="w-3 h-3 text-rose-600 animate-pulse group-hover:scale-110 transition-transform" />
                              <span>Watch Condition Video</span>
                              <ExternalLink className="w-2.5 h-2.5 text-rose-500" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Block: Price & Add to Cart Controls (Neatly Anchored to Bottom) */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                    <div>
                      <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                        <span className={`text-sm sm:text-lg font-extrabold ${product.isDefect ? 'text-rose-700' : 'text-navy-900'}`}>
                          ৳{Number(product?.sellingPrice ?? product?.price ?? 0).toLocaleString()}
                        </span>
                        {product?.originalMrp && Number(product.originalMrp) > Number(product?.sellingPrice ?? product?.price ?? 0) && (
                          <span className="text-[9px] sm:text-xs text-slate-400 line-through font-semibold">
                            ৳{Number(product.originalMrp).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {savingsBDT > 0 && (
                        <span className="text-[9px] font-extrabold text-rose-600 block mt-0.5">
                          Save ৳{savingsBDT.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper & Add Cart Button */}
                    <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                      {!isOutOfStock && (
                        <div className="hidden md:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                          <button
                            onClick={() => handleQuantityChange(product.id, -1, product.currentStock)}
                            disabled={qty <= 1}
                            className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-navy-900 min-w-[20px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, 1, product.currentStock)}
                            disabled={qty >= product.currentStock}
                            className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleAddToCartClick(product)}
                        disabled={isOutOfStock}
                        className={`w-full sm:w-auto flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-brand-500/20'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Quick View / Product Detail Modal */}
      {selectedProduct && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Image Preview */}
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </div>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-800 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" />
                    Fast Express Delivery SLA
                  </span>
                  <p className="text-teal-700">Inside Dhaka: 24 Hours • Nationwide: 48 Hours</p>
                </div>
              </div>

              {/* Specs & Ordering */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{selectedProduct.brand}</span>
                  <h2 className="text-xl font-extrabold text-navy-900 mt-1 leading-snug">{selectedProduct.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {selectedProduct.sku}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-navy-900">৳{Number(selectedProduct?.sellingPrice ?? selectedProduct?.price ?? 0).toLocaleString()}</span>
                  {selectedProduct?.originalMrp && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ৳{Number(selectedProduct.originalMrp).toLocaleString()}
                    </span>
                  )}
                  {selectedProduct?.originalMrp && Number(selectedProduct.originalMrp) > Number(selectedProduct?.sellingPrice ?? selectedProduct?.price ?? 0) && (
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      SAVE ৳{Number(Number(selectedProduct.originalMrp) - Number(selectedProduct?.sellingPrice ?? selectedProduct?.price ?? 0)).toLocaleString()}
                    </span>
                  )}
                </div>

                {selectedProduct.isDefect && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-extrabold flex items-center gap-1.5 text-amber-800">
                      <span>⚠️ Clearance / Defect Item Notice:</span>
                    </span>
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                      {selectedProduct.defectNote || 'Genuine imported stock offered at a heavily reduced clearance discount. 100% authentic and tested.'}
                    </p>
                  </div>
                )}

                {/* Product Condition / Review Video Link */}
                {selectedProduct.videoUrl && (
                  <a
                    href={selectedProduct.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all font-bold text-xs group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block text-rose-950 font-extrabold text-xs">Watch Product Condition Video</span>
                        <span className="block text-[10px] text-rose-600 font-medium">Unboxing & condition demo (Opens in new tab)</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </a>
                )}

                <FormattedDescription 
                  content={selectedProduct.description} 
                  className="text-xs text-slate-600 leading-relaxed"
                />

                {/* Specs List */}
                {selectedProduct.specs && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">Specifications</span>
                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-600">
                        <span className="capitalize text-slate-400">{key}:</span>
                        <span className="font-bold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* In-Stock Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Warehouse Origin:</span>
                  <span className="font-bold text-navy-900">{selectedProduct.warehouse || 'Dhaka Main Hub'}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className={`font-bold ${
                    selectedProduct.currentStock <= 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {selectedProduct.currentStock > 0 ? `${selectedProduct.currentStock} Units Available` : 'Out of Stock'}
                  </span>
                </div>

                {/* Quantity & CTA Buttons */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                      <button
                        onClick={() => handleQuantityChange(selectedProduct.id, -1, selectedProduct.currentStock)}
                        disabled={(quantities[selectedProduct.id] || 1) <= 1}
                        className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-navy-900">
                        {quantities[selectedProduct.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(selectedProduct.id, 1, selectedProduct.currentStock)}
                        disabled={(quantities[selectedProduct.id] || 1) >= selectedProduct.currentStock}
                        className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleAddToCartClick(selectedProduct)}
                      disabled={selectedProduct.currentStock <= 0}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => handleBuyNowClick(selectedProduct)}
                      disabled={selectedProduct.currentStock <= 0}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-40 transition-all"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

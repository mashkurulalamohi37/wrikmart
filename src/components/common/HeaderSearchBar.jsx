import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  X, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Zap, 
  Globe2, 
  Check,
  CheckCircle2,
  Package
} from 'lucide-react';
import { CountryFlag } from './CountryFlag';

export const HeaderSearchBar = ({ isMobile = false }) => {
  const { 
    inventory = [], 
    addToCart, 
    setCurrentRole, 
    setCustomerTab, 
    stockSearchQuery = '', 
    setStockSearchQuery, 
    setPrefilledPreOrder, 
    showToast,
    setIsCartOpen
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with global stockSearchQuery when changed from outside
  useEffect(() => {
    if (stockSearchQuery && !searchTerm) {
      setSearchTerm(stockSearchQuery);
    }
  }, [stockSearchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if input is a web URL or store link
  const isLikelyUrl = useMemo(() => {
    if (!searchTerm) return false;
    const clean = searchTerm.trim().toLowerCase();
    return (
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      clean.startsWith('www.') ||
      clean.includes('amazon.') ||
      clean.includes('flipkart.') ||
      clean.includes('nike.com') ||
      clean.includes('zara.com') ||
      clean.includes('apple.com') ||
      clean.includes('noon.com') ||
      clean.includes('myntra.com') ||
      clean.includes('shopee.') ||
      clean.includes('aliexpress.') ||
      clean.includes('shein.') ||
      /\b[a-z0-9-]+\.(com|in|ae|co|org|net|store|io|th)\b/i.test(clean)
    );
  }, [searchTerm]);

  // Detect Country & Store hint for URLs
  const urlStoreHint = useMemo(() => {
    if (!isLikelyUrl) return null;
    const lower = searchTerm.toLowerCase();
    if (lower.includes('amazon.in') || lower.includes('flipkart') || lower.includes('myntra') || lower.includes('nike.com/in')) {
      return { store: 'India Store (Nike, Amazon, Flipkart)', country: 'India' };
    }
    if (lower.includes('apple.com/ae') || lower.includes('noon.com') || lower.includes('.ae') || lower.includes('dubai')) {
      return { store: 'Dubai Store (Apple, Noon, Sephora)', country: 'Dubai' };
    }
    if (lower.includes('.th') || lower.includes('shopee.co.th') || lower.includes('central.co.th')) {
      return { store: 'Thailand Store (Shopee, Central)', country: 'Thailand' };
    }
    return { store: 'Global Store', country: 'India' };
  }, [isLikelyUrl, searchTerm]);

  // Real-time matching ready stock products
  const matchingStockProducts = useMemo(() => {
    if (!searchTerm.trim() || isLikelyUrl) return [];
    const query = searchTerm.trim().toLowerCase();

    return inventory.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(query);
      const brandMatch = item.brand?.toLowerCase().includes(query);
      const catMatch = item.category?.toLowerCase().includes(query);
      const skuMatch = item.sku?.toLowerCase().includes(query);
      return nameMatch || brandMatch || catMatch || skuMatch;
    }).sort((a, b) => {
      // Prioritize in-stock items
      const aInStock = (a.currentStock || 0) > 0 ? 1 : 0;
      const bInStock = (b.currentStock || 0) > 0 ? 1 : 0;
      return bInStock - aInStock;
    }).slice(0, 5);
  }, [inventory, searchTerm, isLikelyUrl]);

  // Execute Search or Pre-Order Link
  const handleExecuteSearch = (targetQuery) => {
    const q = (typeof targetQuery === 'string' ? targetQuery : searchTerm).trim();
    if (!q) return;

    setIsOpen(false);
    if (inputRef.current) inputRef.current.blur();

    if (isLikelyUrl || q.startsWith('http') || q.startsWith('www.')) {
      if (setPrefilledPreOrder) {
        setPrefilledPreOrder({ url: q, country: urlStoreHint?.country || 'India' });
      }
      setCurrentRole('customer');
      if (setCustomerTab) setCustomerTab('preorder');
      if (showToast) showToast('🔗 Product link imported into Pre-Order Wizard!', 'success');
    } else {
      if (setStockSearchQuery) setStockSearchQuery(q);
      setCurrentRole('customer');
      if (setCustomerTab) setCustomerTab('stock');
      if (showToast) showToast(`🔍 Filtering ready stock for "${q}"`, 'info');
    }
  };

  // Pre-Order a keyword that isn't in stock
  const handlePreOrderKeyword = (keyword) => {
    const cleanWord = (keyword || searchTerm).trim();
    if (!cleanWord) return;

    setIsOpen(false);
    if (setPrefilledPreOrder) {
      setPrefilledPreOrder({ name: cleanWord, url: '' });
    }
    setCurrentRole('customer');
    if (setCustomerTab) setCustomerTab('preorder');
    if (showToast) showToast(`✈️ Started Global Pre-Order for "${cleanWord}"!`, 'info');
  };

  // Quick Clear Button
  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    if (setStockSearchQuery) setStockSearchQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Container */}
      <div className="relative flex items-center w-full">
        <Search 
          className={`w-4 h-4 absolute left-3.5 transition-colors pointer-events-none ${
            isOpen ? 'text-brand-400' : 'text-slate-400'
          }`} 
        />

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            isMobile 
              ? "Search stock or paste link (Nike, Apple, Zara)..." 
              : "Search ready stock products or paste link (Nike, Apple, Zara, Amazon)..."
          }
          className="w-full bg-[#14234B]/90 hover:bg-[#14234B] focus:bg-[#0B1530] text-xs text-white placeholder:text-slate-400 pl-10 pr-24 py-2 sm:py-2.5 rounded-2xl border border-slate-700/80 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30 transition-all select-text shadow-inner"
        />

        {/* Right Input Action Controls */}
        <div className="absolute right-2 flex items-center gap-1.5">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {searchTerm.trim() ? (
            <button
              type="button"
              onClick={() => handleExecuteSearch()}
              className={`px-2.5 py-1 rounded-xl font-black text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-sm transition-transform active:scale-95 ${
                isLikelyUrl 
                  ? 'bg-amber-400 hover:bg-amber-300 text-navy-950' 
                  : 'bg-brand-500 hover:bg-brand-400 text-white'
              }`}
            >
              <span>{isLikelyUrl ? 'Import' : 'Search'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 select-none">
              ↵ Enter
            </kbd>
          )}
        </div>
      </div>

      {/* Live Search & Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#0E1B3E] border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fade-in max-h-[460px] overflow-y-auto no-scrollbar select-text text-left">
          
          {/* CASE 1: URL / Product Link Detected */}
          {isLikelyUrl ? (
            <div className="p-4 space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-brand-500/15 to-transparent border border-amber-400/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        Global Pre-Order Link Detected
                      </span>
                      <p className="text-xs font-bold text-white truncate max-w-[280px] sm:max-w-md">
                        {urlStoreHint?.store || 'Direct International Store Import'}
                      </p>
                    </div>
                  </div>
                  {urlStoreHint?.country && (
                    <CountryFlag country={urlStoreHint.country} className="w-6 h-4 rounded shadow-xs" />
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Our local agents in <strong>{urlStoreHint?.country || 'India/Dubai'}</strong> will purchase this exact item directly from the official store and deliver it to your address in Bangladesh with <strong>25% advance payment</strong>.
                </p>

                <button
                  type="button"
                  onClick={() => handleExecuteSearch()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-navy-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-navy-950" />
                  <span>Calculate Quote & Start Pre-Order</span>
                  <ArrowRight className="w-3.5 h-3.5 text-navy-950" />
                </button>
              </div>
            </div>
          ) : searchTerm.trim() ? (
            /* CASE 2: Text Search Query (Ready Stock Matches or Fallback) */
            <div className="p-3 space-y-3">
              {matchingStockProducts.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-brand-300">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Ready Stock in Dhaka ({matchingStockProducts.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">24-48h Delivery</span>
                  </div>

                  <div className="divide-y divide-slate-800/80">
                    {matchingStockProducts.map((product) => {
                      const hasDiscount = product.originalMrp && product.originalMrp > product.sellingPrice;
                      const isInStock = (product.currentStock || 0) > 0;

                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            if (setStockSearchQuery) setStockSearchQuery(product.name);
                            setCurrentRole('customer');
                            if (setCustomerTab) setCustomerTab('stock');
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-800/70 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-11 h-11 rounded-lg object-cover bg-slate-800 border border-slate-700/60 flex-shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-300">{product.brand}</span>
                                <span>•</span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                                  {product.category}
                                </span>
                                <span>•</span>
                                <span className={isInStock ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {isInStock ? `Stock: ${product.currentStock}` : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-black text-amber-300 block">
                                ৳{Number(product.sellingPrice).toLocaleString()}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] text-slate-400 line-through block">
                                  ৳{Number(product.originalMrp).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {isInStock && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product, 1);
                                  if (showToast) showToast(`Added ${product.name} to Cart!`, 'success');
                                  if (setIsCartOpen) setIsCartOpen(true);
                                }}
                                className="p-2 rounded-xl bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white transition-all transform active:scale-95"
                                title="Add to Cart"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* See All In Stock Button */}
                  <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch()}
                      className="w-full text-left px-3 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
                    >
                      <span>View all ready stock catalog results for "{searchTerm}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePreOrderKeyword(searchTerm)}
                      className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-[11px] flex items-center justify-between transition-colors"
                    >
                      <span className="truncate">✈️ Need international edition? Pre-order "{searchTerm}" from Global Stores</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              ) : (
                /* No Stock Found -> Pre-Order Opportunity */
                <div className="p-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-300 flex items-center justify-center mx-auto">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      No ready stock in Dhaka for "{searchTerm}"
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                      Great news! You can pre-order it directly from <strong>Nike India, Apple Dubai, Zara, Amazon or Noon</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePreOrderKeyword(searchTerm)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-400 hover:to-cyan-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Create Pre-Order for "{searchTerm}" (25% Advance)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CASE 3: Empty Search Input (Trending & Popular Suggestions) */
            <div className="p-4 space-y-4">
              {/* Popular Ready Stock Search Queries */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Popular in Dhaka Ready Stock
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'AirPods Pro',
                    'Nike Pegasus',
                    'Sony WH-1000XM5',
                    'Zara Jacket',
                    'Casio Vintage',
                    'Anker 65W',
                    'Dior Sauvage'
                  ].map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => {
                        setSearchTerm(keyword);
                        handleExecuteSearch(keyword);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 text-xs font-medium border border-slate-700/60 transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supported Stores for Link Pasting */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Supported Global Stores for Pre-Order
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { name: 'Nike India', domain: 'nike.com/in', country: 'India' },
                    { name: 'Apple Dubai', domain: 'apple.com/ae', country: 'Dubai' },
                    { name: 'Amazon India', domain: 'amazon.in', country: 'India' },
                    { name: 'Noon UAE', domain: 'noon.com', country: 'Dubai' },
                    { name: 'Zara UAE', domain: 'zara.com', country: 'Dubai' },
                    { name: 'Shopee Thai', domain: 'shopee.co.th', country: 'Thailand' }
                  ].map((store) => (
                    <div
                      key={store.name}
                      onClick={() => {
                        setSearchTerm(`https://www.${store.domain}`);
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 cursor-pointer border border-slate-700/40 transition-colors group"
                    >
                      <CountryFlag country={store.country} className="w-5 h-3.5 rounded shadow-2xs flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-white group-hover:text-brand-300 text-[11px] block truncate">
                          {store.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate font-mono">
                          {store.domain}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

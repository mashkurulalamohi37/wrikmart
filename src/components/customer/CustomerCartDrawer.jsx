import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  Truck, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

export const CustomerCartDrawer = ({ onProceedToCheckout }) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    coupons = [],
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCustomerTab
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [district, setDistrict] = useState('Dhaka'); // 'Dhaka' | 'Outside Dhaka'

  if (!isCartOpen) return null;

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.quantity || 1)), 0);
  const baseDeliveryFee = district === 'Dhaka' ? 80 : 150;
  
  // Calculate discount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      const calc = Math.round(subtotal * (appliedCoupon.discountValue / 100));
      discountAmount = appliedCoupon.maxDiscountBDT ? Math.min(calc, appliedCoupon.maxDiscountBDT) : calc;
    } else if (appliedCoupon.discountType === 'fixed') {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    } else if (appliedCoupon.discountType === 'free_shipping') {
      discountAmount = baseDeliveryFee;
    }
  }

  const effectiveDeliveryFee = appliedCoupon?.discountType === 'free_shipping' ? 0 : baseDeliveryFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + effectiveDeliveryFee);

  const handleApplyCoupon = (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    applyCoupon(code, subtotal, baseDeliveryFee, cart);
    setCouponInput('');
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  const handleStartShopping = () => {
    setIsCartOpen(false);
    if (setCustomerTab) setCustomerTab('stock');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
        <div className="w-full sm:w-[440px] max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden pointer-events-auto">
          
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-base text-navy-900 truncate">Your Cart</h2>
                <p className="text-[11px] text-slate-400">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in stock
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                title="Close Cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Body / Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-navy-900">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Explore our local warehouse ready stock with immediate 24-48h dispatch across Bangladesh!
                  </p>
                </div>
                <button
                  onClick={handleStartShopping}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Browse Ready Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => {
                  const itemTotal = (item.sellingPrice || 0) * (item.quantity || 1);
                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-2.5 sm:gap-3.5 items-center justify-between"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                        <span className="text-[10px] font-bold text-brand-600 uppercase block truncate">
                          {item.brand}
                        </span>
                        <h4 className="font-bold text-xs text-navy-900 truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-800">
                            ৳{item.sellingPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            × {item.quantity} = <strong className="text-navy-900">৳{itemTotal.toLocaleString()}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Quantity Adjuster & Remove */}
                      <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
                          <button
                            onClick={() => updateCartQuantity(item.id, (item.quantity || 1) - 1)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 sm:px-2 text-xs font-extrabold text-slate-800 min-w-[18px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={item.quantity >= (item.currentStock || 99)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Promo / Coupon Code Section */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    Coupon Code / Promo Voucher
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Save extra on checkout</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold text-emerald-900">
                          Coupon <span className="underline font-mono">{appliedCoupon.code}</span> Applied!
                        </p>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {appliedCoupon.discountType === 'free_shipping' ? '100% Free Shipping' : `Saved ৳${discountAmount.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter code (e.g. WRIK10)..."
                        className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={!couponInput.trim()}
                        className="px-3.5 sm:px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex-shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick Available Suggestions */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 font-medium">Available:</span>
                      {coupons.filter(c => c.status === 'Active').slice(0, 4).map(cp => (
                        <button
                          key={cp.id}
                          onClick={() => handleApplyCoupon(cp.code)}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-colors ${
                            cp.isBirthdaySpecial
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-black'
                              : 'bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 text-slate-600'
                          }`}
                        >
                          {cp.isBirthdaySpecial ? '🎂' : '🏷️'} {cp.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Destination Selector */}
            {cart.length > 0 && (
              <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  Delivery Destination:
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setDistrict('Dhaka')}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all text-center ${
                      district === 'Dhaka'
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Dhaka (৳80)
                  </button>
                  <button
                    onClick={() => setDistrict('Outside Dhaka')}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all text-center ${
                      district === 'Outside Dhaka'
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Outside Dhaka (৳150)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3 sm:space-y-4">
              {/* Summary Rows */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>Coupon Savings ({appliedCoupon?.code}):</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Delivery ({district}):</span>
                  <span className="font-bold text-slate-800">
                    {effectiveDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-extrabold uppercase text-[10px]">Free Shipping</span>
                    ) : (
                      `৳${effectiveDeliveryFee}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline gap-2">
                  <span className="font-extrabold text-sm text-navy-900">Total Payable:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-lg sm:text-xl text-brand-600">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400">VAT & Delivery Included</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  COD & Instant Online MFS Payment Available
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

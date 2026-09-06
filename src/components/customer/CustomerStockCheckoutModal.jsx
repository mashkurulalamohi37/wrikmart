import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  ShoppingBag, 
  Printer, 
  ExternalLink,
  Lock,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  Cake,
  Tag,
  Copy,
  HelpCircle
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from '../common/PaymentLogos';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

export const CustomerStockCheckoutModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const { 
    cart = [], 
    coupons = [],
    appliedCoupon,
    applyCoupon,
    setAppliedCoupon,
    createCustomerStockOrder, 
    setCustomerTab,
    customerProfile,
    showToast,
    clearCart
  } = useApp();

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: customerProfile?.name || 'Rahim Chowdhury',
    phone: customerProfile?.phone || '+880 1712-345678',
    email: customerProfile?.email || 'rahim.c@example.com',
    district: customerProfile?.district || 'Dhaka',
    address: customerProfile?.address || 'House 12, Road 5, Dhanmondi, Dhaka-1205',
    dateOfBirth: customerProfile?.dateOfBirth || '',
    note: 'Please call 30 minutes before arrival.'
  });

  const [deliveryMethod, setDeliveryMethod] = useState('Standard Courier'); // 'Standard Courier' | 'Express Same-Day'
  const [paymentMethod, setPaymentMethod] = useState('bKash'); // 'COD' | 'bKash' | 'Nagad' | 'Card'
  const [transactionId, setTransactionId] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // CRITICAL: Always reset confirmedOrder and submission state when modal opens
  // This guarantees fresh checkout form is displayed and prevents getting stuck on "Order Confirmed"
  useEffect(() => {
    if (isOpen) {
      setConfirmedOrder(null);
      setIsSubmitting(false);
      setTransactionId('');
      setCouponInput('');
    }
  }, [isOpen]);

  // Sync customer details from profile when opened
  useEffect(() => {
    if (isOpen && customerProfile) {
      setCustomerInfo(prev => ({
        name: customerProfile.name || prev.name || 'Rahim Chowdhury',
        phone: customerProfile.phone || prev.phone || '+880 1712-345678',
        email: customerProfile.email || prev.email || 'rahim.c@example.com',
        district: customerProfile.district || prev.district || 'Dhaka',
        address: customerProfile.address || prev.address || 'House 12, Road 5, Dhanmondi, Dhaka-1205',
        dateOfBirth: customerProfile.dateOfBirth || prev.dateOfBirth || '',
        note: prev.note || 'Please call 30 minutes before arrival.'
      }));
    }
  }, [isOpen, customerProfile]);

  if (!isOpen) return null;

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.quantity || 1)), 0);
  
  let baseDeliveryFee = customerInfo.district === 'Dhaka' ? 80 : 150;
  if (deliveryMethod === 'Express Same-Day') {
    baseDeliveryFee = 150;
  }

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

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code || !code.trim()) {
      if (showToast) showToast('Please enter a coupon code.', 'warning');
      return;
    }
    if (applyCoupon) {
      applyCoupon(code.trim(), subtotal, baseDeliveryFee, cart);
    }
    setCouponInput('');
  };

  // Auto-fill Sandbox Transaction ID
  const handleAutoFillSandboxTrx = () => {
    const randomTrx = `TRX-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionId(randomTrx);
    if (showToast) showToast(`Sandbox ${paymentMethod} TrxID generated!`, 'info');
  };

  // Close & Clean State
  const handleClose = () => {
    setConfirmedOrder(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleTrackOrder = () => {
    setConfirmedOrder(null);
    onClose();
    if (setCustomerTab) setCustomerTab('orders');
  };

  const handleSubmitOrder = (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) {
      if (showToast) showToast('Your cart is empty! Add products first.', 'error');
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      if (showToast) showToast('Please fill in your name, phone number, and delivery address.', 'warning');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const genTrx = paymentMethod === 'COD' 
        ? null 
        : (transactionId.trim() || `TRX-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);

      const order = createCustomerStockOrder({
        customerInfo,
        items: cart,
        deliveryMethod,
        deliveryFee: effectiveDeliveryFee,
        paymentMethod,
        transactionId: genTrx,
        subtotal,
        discountAmount,
        grandTotal,
        advancePaid: paymentMethod === 'COD' ? 0 : grandTotal,
        paymentStatus: paymentMethod === 'COD' ? 'Unpaid' : 'Fully Paid'
      });

      setConfirmedOrder(order);
      setIsSubmitting(false);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      if (onOrderPlaced) {
        onOrderPlaced(order);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-navy-900">
                {confirmedOrder ? 'Order Confirmed!' : 'Ready Stock Checkout'}
              </h2>
              <p className="text-xs text-slate-500">
                {confirmedOrder 
                  ? 'Your order has been routed to Dhaka Tejgaon fulfillment hub' 
                  : 'Fast doorstep delivery with official store warranty'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {confirmedOrder ? (
            /* ========================================================= */
            /* 1. SUCCESS CONFIRMATION SCREEN */
            /* ========================================================= */
            <div className="space-y-6 text-center animate-fade-in py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-teal-glow">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                  Order Successfully Placed
                </span>
                <h3 className="text-2xl font-black text-navy-900">Thank You, {customerInfo.name}! 🎉</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We have received your Ready Stock order. Warehouse dispatch staff will pick and pack your package shortly.
                </p>
              </div>

              {/* Order ID & Summary Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Number</span>
                    <span className="font-mono font-extrabold text-base text-brand-600">{confirmedOrder.orderNumber}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status & Payment</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700">
                      {confirmedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                    <strong className="text-navy-900 text-sm">৳{confirmedOrder.financials?.estimatedTotal?.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                    <strong className="text-navy-900">{paymentMethod}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Delivery</span>
                    <strong className="text-emerald-700">Within 24-48 Hours</strong>
                  </div>
                </div>

                {confirmedOrder.financials?.couponCode && (
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Applied Voucher ({confirmedOrder.financials.couponCode}):</span>
                    <span className="font-bold text-emerald-600">-৳{confirmedOrder.financials.discountAmount?.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Delivery Address:</span>
                  <p className="font-medium text-slate-800">{customerInfo.address} ({customerInfo.district})</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Continue Shopping</span>
                </button>

                <button
                  type="button"
                  onClick={handleTrackOrder}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Track This Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* 2. COMPLETE CHECKOUT FORM */
            /* ========================================================= */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* SECTION 1: Items in Order */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                    <span>Order Items ({cart.length})</span>
                  </span>
                  <span className="text-brand-600">Subtotal: ৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/90">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-white border border-slate-200" 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-navy-900 truncate block">{item.name}</span>
                          <span className="text-[10px] text-slate-400">Qty: {item.quantity || 1} • {item.brand}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 flex-shrink-0 ml-2">
                        ৳{((item.sellingPrice || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Customer & Delivery Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  1. Customer & Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+880 1712-345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Delivery District *</label>
                    <select
                      value={customerInfo.district}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                    >
                      <option value="Dhaka">Dhaka (৳80 Courier Delivery)</option>
                      <option value="Chittagong">Chittagong (৳150 Delivery)</option>
                      <option value="Sylhet">Sylhet (৳150 Delivery)</option>
                      <option value="Rajshahi">Rajshahi (৳150 Delivery)</option>
                      <option value="Khulna">Khulna (৳150 Delivery)</option>
                      <option value="Barisal">Barisal (৳150 Delivery)</option>
                      <option value="Rangpur">Rangpur (৳150 Delivery)</option>
                      <option value="Mymensingh">Mymensingh (৳150 Delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="For order receipts"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Detailed Street Address / Landmark *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="House, Road, Area, Thana, District"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cake className="w-3.5 h-3.5 text-rose-500" />
                        <span>Date of Birth / Birthday (Optional)</span>
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        🎂 Unlock special annual birthday discounts!
                      </span>
                    </label>
                    <input
                      type="date"
                      value={customerInfo.dateOfBirth || ''}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Courier Delivery Speed */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  2. Courier Speed
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label 
                    onClick={() => setDeliveryMethod('Standard Courier')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === 'Standard Courier'
                        ? 'border-brand-500 bg-brand-50/60 shadow-2xs ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">Standard Courier</p>
                        <span className="text-[10px] text-slate-400">24-48h Delivery</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-navy-900">
                      ৳{customerInfo.district === 'Dhaka' ? 80 : 150}
                    </span>
                  </label>

                  <label 
                    onClick={() => setDeliveryMethod('Express Same-Day')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === 'Express Same-Day'
                        ? 'border-brand-500 bg-brand-50/60 shadow-2xs ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        ⚡
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">Express Dhaka</p>
                        <span className="text-[10px] text-amber-600 font-medium">Same-Day Dispatch</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-navy-900">৳150</span>
                  </label>
                </div>
              </div>

              {/* SECTION 4: Discount & Coupon Code */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                    3. Discount & Coupon Code
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        if (showToast) showToast('Coupon removed.', 'info');
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Remove Coupon
                    </button>
                  )}
                </h3>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          ✓
                        </div>
                        <div>
                          <span className="font-mono font-black text-xs text-emerald-800 uppercase tracking-wider block">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% Discount Applied` :
                             appliedCoupon.discountType === 'fixed' ? `৳${appliedCoupon.discountValue} Discount Applied` : 'Free Delivery Applied'}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-emerald-700">
                        -৳{discountAmount.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Enter coupon code (e.g. WRIK10, BDAY-20)..."
                          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold placeholder:font-sans placeholder:font-normal"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          disabled={!couponInput.trim()}
                          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex-shrink-0"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Available Coupons Suggestions */}
                      <div className="flex flex-wrap gap-1.5 items-center pt-1">
                        <span className="text-[10px] text-slate-400 font-medium">Available Coupons:</span>
                        {coupons.filter(c => c.status === 'Active').slice(0, 4).map(cp => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => handleApplyCoupon(cp.code)}
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all transform active:scale-95 ${
                              cp.isBirthdaySpecial
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-black'
                                : 'bg-white hover:bg-brand-50 hover:text-brand-700 border-slate-200 text-slate-700'
                            }`}
                          >
                            {cp.isBirthdaySpecial ? '🎂' : '🏷️'} {cp.code} ({cp.discountType === 'percentage' ? `${cp.discountValue}%` : `৳${cp.discountValue}`})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: Payment Gateway Selection */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  4. Payment Gateway & Options
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod('bKash')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'bKash' 
                        ? 'border-pink-500 bg-pink-50 text-pink-900 shadow-2xs ring-2 ring-pink-500/20 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <BKashLogo className="h-6 w-auto" />
                    <span className="text-[11px]">bKash Pay</span>
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'Nagad' 
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-2xs ring-2 ring-orange-500/20 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <NagadLogo className="h-6 w-auto" />
                    <span className="text-[11px]">Nagad</span>
                  </label>

                  {/* Card */}
                  <label
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'Card' 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs ring-2 ring-blue-500/20 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <VisaLogo className="h-3.5 w-auto" />
                      <MastercardLogo className="h-3.5 w-auto" />
                    </div>
                    <span className="text-[11px]">Cards</span>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'COD' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs ring-2 ring-emerald-500/20 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      💵
                    </div>
                    <span className="text-[11px]">Cash on Del.</span>
                  </label>
                </div>

                {/* Gateway Detail & Verification Box */}
                {paymentMethod !== 'COD' ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                        {paymentMethod === 'bKash' && 'bKash Merchant Payment (01712-998877)'}
                        {paymentMethod === 'Nagad' && 'Nagad Merchant Payment (01912-334455)'}
                        {paymentMethod === 'Card' && 'SSLCommerz 256-bit Secure Card Checkout'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-extrabold text-[10px]">
                        Sandbox Active
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {paymentMethod === 'bKash' && 'Send payment of ৳' + grandTotal.toLocaleString() + ' to Merchant: 01712-998877. Enter TrxID below or use the auto-fill button.'}
                      {paymentMethod === 'Nagad' && 'Send payment of ৳' + grandTotal.toLocaleString() + ' to Merchant: 01912-334455. Enter TrxID below or use the auto-fill button.'}
                      {paymentMethod === 'Card' && 'Instant card authorization simulation for Visa, Mastercard, and UnionPay.'}
                    </p>

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Enter ${paymentMethod} TrxID (or leave blank to auto-verify)`}
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAutoFillSandboxTrx}
                        className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
                      >
                        Auto-Fill TrxID
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      💵
                    </div>
                    <p className="text-emerald-900 text-xs leading-relaxed">
                      <strong>Cash on Delivery Active:</strong> You will pay <strong>৳{grandTotal.toLocaleString()}</strong> in cash directly to the courier agent when your parcel arrives at your doorstep in {customerInfo.district}.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 6: Financial Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount ({appliedCoupon?.code}):</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge ({customerInfo.district}):</span>
                  <span className="font-bold text-slate-800">
                    {effectiveDeliveryFee === 0 ? '৳0 (Free Shipping)' : `৳${effectiveDeliveryFee}`}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-black text-sm text-navy-900">Total Payable:</span>
                  <div className="text-right">
                    <span className="font-black text-2xl text-brand-600">৳{grandTotal.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400">
                      {paymentMethod === 'COD' ? 'Pay upon doorstep delivery' : 'Payable right now via ' + paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'COD' 
                        ? `Confirm Order with Cash on Delivery (৳${grandTotal.toLocaleString()})` 
                        : `Pay & Confirm Order via ${paymentMethod} (৳${grandTotal.toLocaleString()})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

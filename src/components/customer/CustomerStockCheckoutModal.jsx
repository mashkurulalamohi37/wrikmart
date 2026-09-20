import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  createEpsPaymentSession,
  generateEpsTransactionId
} from '../../utils/epsPaymentService';
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
  HelpCircle,
  AlertCircle
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
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    showToast,
    clearCart,
    selectedDistrict,
    setSelectedDistrict,
    epsSettings
  } = useApp();

  // Form State
  const [customerInfo, setCustomerInfo] = useState(() => ({
    name: customerProfile?.name || (currentUser?.name && currentUser?.role !== 'admin' ? currentUser.name : ''),
    phone: customerProfile?.phone || (currentUser?.phone && currentUser?.role !== 'admin' ? currentUser.phone : ''),
    email: customerProfile?.email || (currentUser?.email && currentUser?.role !== 'admin' ? currentUser.email : ''),
    district: selectedDistrict === 'Outside Dhaka' ? 'Chittagong' : (customerProfile?.district || 'Dhaka'),
    address: customerProfile?.address || '',
    dateOfBirth: customerProfile?.dateOfBirth || '',
    note: ''
  }));

  const [deliveryMethod, setDeliveryMethod] = useState('Standard Courier'); // 'Standard Courier' | 'Express Same-Day'
  const [paymentMethod, setPaymentMethod] = useState('EPS'); // 'EPS' | 'COD'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEpsRedirecting, setIsEpsRedirecting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [couponInput, setCouponInput] = useState('');

  // CRITICAL: Always reset confirmedOrder and submission state when modal opens
  // This guarantees fresh checkout form is displayed and prevents getting stuck on "Order Confirmed"
  useEffect(() => {
    if (isOpen) {
      setConfirmedOrder(null);
      setIsSubmitting(false);
      setIsEpsRedirecting(false);
    }
  }, [isOpen]);

  // Sync customer details from profile when opened, respecting selectedDistrict
  useEffect(() => {
    if (isOpen) {
      setCustomerInfo(prev => {
        let initialDistrict = prev.district;
        if (selectedDistrict === 'Outside Dhaka' && prev.district === 'Dhaka') {
          initialDistrict = 'Chittagong';
        } else if (selectedDistrict === 'Dhaka' && prev.district !== 'Dhaka') {
          initialDistrict = 'Dhaka';
        } else if (customerProfile?.district) {
          initialDistrict = customerProfile.district;
        }

        return {
          name: customerProfile?.name || (currentUser?.role !== 'admin' ? currentUser?.name : '') || prev.name || '',
          phone: customerProfile?.phone || (currentUser?.role !== 'admin' ? currentUser?.phone : '') || prev.phone || '',
          email: customerProfile?.email || (currentUser?.role !== 'admin' ? currentUser?.email : '') || prev.email || '',
          district: initialDistrict,
          address: customerProfile?.address || prev.address || '',
          dateOfBirth: customerProfile?.dateOfBirth || prev.dateOfBirth || '',
          note: prev.note || ''
        };
      });
    }
  }, [isOpen, customerProfile, currentUser, selectedDistrict]);

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
  // Auto-fill Sandbox Transaction ID
  const handleAutoFillSandboxTrx = () => {
    const randomTrx = `EPS-TRX-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionId(randomTrx);
    if (showToast) showToast('EPS Gateway TrxID auto-generated!', 'info');
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

  // Submit Order Handler
  const handleSubmitOrder = async (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) {
      if (showToast) showToast('Your cart is empty! Add products first.', 'error');
      return;
    }
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      if (showToast) showToast('Please fill in your name, phone number, and delivery address.', 'warning');
      return;
    }

    const epsStore = epsSettings?.storeId || '5c6d0f37-2974-4be8-818d-0736593e456e';

    // ── Cash on Delivery ──────────────────────────────────────────────────
    if (paymentMethod === 'COD') {
      setIsSubmitting(true);
      setTimeout(() => {
        const order = createCustomerStockOrder({
          customerInfo,
          items: cart,
          deliveryMethod,
          deliveryFee: effectiveDeliveryFee,
          paymentMethod: 'Cash on Delivery (COD)',
          transactionId: null,
          subtotal,
          discountAmount,
          grandTotal,
          advancePaid: 0,
          paymentStatus: 'Unpaid'
        });
        setConfirmedOrder(order);
        setIsSubmitting(false);
        try { confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } }); } catch (_) {}
        if (clearCart) clearCart();
        if (onOrderPlaced) onOrderPlaced(order);
        if (showToast) showToast('Order placed! Pay cash upon doorstep delivery.', 'success');
      }, 700);
      return;
    }

    // ── EPS Payment Gateway — Real Redirect Flow ──────────────────────────
    setIsEpsRedirecting(true);
    try {
      const merchantTransactionId = generateEpsTransactionId();

      // Save all order data to sessionStorage BEFORE redirect
      // (browser will lose React state when navigating away)
      const pendingOrder = {
        type: 'stock',
        merchantTransactionId,
        customerInfo,
        items: cart,
        deliveryMethod,
        deliveryFee: effectiveDeliveryFee,
        epsStoreId: epsStore,
        subtotal,
        discountAmount,
        grandTotal
      };
      sessionStorage.setItem('eps_pending_order', JSON.stringify(pendingOrder));

      // Call EPS API to initialize a payment session
      const session = await createEpsPaymentSession({
        orderNumber: `ORD-${merchantTransactionId}`,
        merchantTransactionId,
        totalAmount: grandTotal,
        customerInfo,
        orderType: 'Stock Order',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          sellingPrice: item.sellingPrice || 0,
          category: item.category || 'Retail'
        }))
      });

      if (!session.redirectUrl) {
        throw new Error('EPS did not return a redirect URL. Please try again.');
      }

      if (showToast) showToast('Redirecting to EPS Payment Gateway...', 'info');

      // Redirect browser to EPS hosted payment page
      window.location.href = session.redirectUrl;

    } catch (err) {
      console.error('EPS payment initialization failed:', err);
      setIsEpsRedirecting(false);
      sessionStorage.removeItem('eps_pending_order');
      if (showToast) showToast(
        `EPS Gateway Error: ${err.message || 'Could not connect to EPS. Please try COD or contact support.'}`,
        'error'
      );
    }
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
            aria-label="Close Checkout Modal"
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
              
              {/* Account Required Notice if Guest */}
              {!currentUser && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-xs text-amber-950">Account Required to Place Order</h4>
                      <p className="text-[11px] text-amber-800">You must create a customer account or sign in before finalizing your order.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (setAuthModalMode) setAuthModalMode('register');
                      if (setIsAuthModalOpen) setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex-shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}

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
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setCustomerInfo(prev => ({ ...prev, district: newDist }));
                        if (setSelectedDistrict) {
                          setSelectedDistrict(newDist === 'Dhaka' ? 'Dhaka' : 'Outside Dhaka');
                        }
                      }}
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
                  4. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* EPS Payment Gateway */}
                  <label
                    onClick={() => setPaymentMethod('EPS')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                      paymentMethod === 'EPS' 
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-sm ring-2 ring-emerald-500/30' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                        <img src="/eps/Group 93.png" alt="EPS Gateway" className="h-6 w-auto object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-emerald-950">EPS Payment Gateway</span>
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-black rounded uppercase">Official</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Cards, bKash, Nagad & Net Banking</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'EPS' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'EPS' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                      paymentMethod === 'COD' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                        💵
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-navy-900 block">Cash on Delivery</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Pay in cash at doorstep</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>
                </div>

                {/* Gateway Detail Note */}
                {paymentMethod === 'EPS' ? (
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-950">Official Bangladesh Bank Certified EPS Payment Systems Operator (PSO)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        Store ID: {epsSettings?.storeId || '5c6d0f37-2974-4be8-818d-0736593e456e'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pay securely with <strong>Visa, Mastercard, bKash, Nagad, Rocket, Upay</strong> or Internet Banking via the official EPS Payment Gateway.
                    </p>

                    <div className="p-2.5 rounded-xl border border-emerald-200/80 bg-white shadow-2xs">
                      <img 
                        src="/eps/Group 106.png" 
                        alt="Supported EPS Payment Channels" 
                        className="w-full h-auto object-contain rounded-lg max-h-11 mx-auto"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <p className="text-[11px] text-slate-700 leading-snug">
                        Clicking <strong>"Proceed to EPS Payment"</strong> will redirect you to the secure EPS hosted payment page. Complete payment there and you'll be brought back automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="text-[11px]">Pay <strong>৳{grandTotal.toLocaleString()}</strong> in cash upon parcel delivery in {customerInfo.district}.</span>
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
                      {paymentMethod === 'COD' ? 'Pay upon doorstep delivery' : 'Payable right now via EPS Gateway'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || isEpsRedirecting || cart.length === 0}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {(isSubmitting || isEpsRedirecting) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {isEpsRedirecting ? 'Connecting to EPS Gateway...' : 'Processing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'COD'
                        ? `Confirm Order with Cash on Delivery (৳${grandTotal.toLocaleString()})`
                        : `Proceed to EPS Payment (৳${grandTotal.toLocaleString()})`}
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

import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from '../common/PaymentLogos';

export const CustomerStockCheckoutModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const { 
    cart, 
    createCustomerStockOrder, 
    setCustomerTab 
  } = useApp();

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Rahim Chowdhury',
    phone: '+880 1712-345678',
    email: 'rahim.c@example.com',
    district: 'Dhaka',
    address: 'House 12, Road 5, Dhanmondi, Dhaka-1205',
    note: 'Please call 30 minutes before arrival.'
  });

  const [deliveryMethod, setDeliveryMethod] = useState('Standard Courier'); // 'Standard Courier' | 'Express Same-Day'
  const [paymentMethod, setPaymentMethod] = useState('bKash'); // 'COD' | 'bKash' | 'Nagad' | 'Card'
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isOpen) return null;

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.quantity || 1)), 0);
  
  let deliveryFee = customerInfo.district === 'Dhaka' ? 80 : 150;
  if (deliveryMethod === 'Express Same-Day') {
    deliveryFee = 150;
  }

  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const genTrx = paymentMethod === 'COD' 
        ? null 
        : (transactionId || `TRX-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);

      const order = createCustomerStockOrder({
        customerInfo,
        items: cart,
        deliveryMethod,
        deliveryFee: deliveryFee,
        paymentMethod,
        transactionId: genTrx,
        subtotal,
        discountAmount: 0,
        grandTotal,
        advancePaid: paymentMethod === 'COD' ? 0 : grandTotal,
        paymentStatus: paymentMethod === 'COD' ? 'Unpaid' : 'Fully Paid'
      });

      setConfirmedOrder(order);
      setIsSubmitting(false);

      // Trigger Confetti
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

  const handleTrackOrder = () => {
    onClose();
    if (setCustomerTab) setCustomerTab('orders');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-navy-900">
                {confirmedOrder ? 'Order Confirmed!' : 'Ready Stock Checkout'}
              </h2>
              <p className="text-xs text-slate-400">
                {confirmedOrder 
                  ? 'Your order has been routed to Dhaka Tejgaon warehouse' 
                  : 'Fast doorstep delivery with genuine store invoice'}
              </p>
            </div>
          </div>

          {!confirmedOrder && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          
          {confirmedOrder ? (
            /* ========================================================= */
            /* SUCCESS CONFIRMATION SCREEN */
            /* ========================================================= */
            <div className="space-y-6 text-center animate-fade-in py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-teal-glow">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Order Successful</span>
                <h3 className="text-2xl font-extrabold text-navy-900">Thank You, {customerInfo.name}!</h3>
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

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Delivery Address:</span>
                  <p className="font-medium text-slate-800">{customerInfo.address} ({customerInfo.district})</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
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
            /* CHECKOUT FORM */
            /* ========================================================= */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* 1. Items in this order */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Order Items ({cart.length})</span>
                  <span className="text-brand-600">Subtotal: ৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        <span className="font-semibold text-navy-900 truncate">{item.name}</span>
                        <span className="text-slate-400">×{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-800 flex-shrink-0 ml-2">
                        ৳{((item.sellingPrice || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Customer & Delivery Address */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  1. Delivery Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mobile Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Delivery District</label>
                    <select
                      value={customerInfo.district}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
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
                    <label className="block text-slate-600 font-semibold mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Detailed Street Address / Landmark</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="House, Road, Area, Thana, District"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  2. Courier Speed
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label 
                    onClick={() => setDeliveryMethod('Standard Courier')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === 'Standard Courier'
                        ? 'border-brand-500 bg-brand-50/50 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">Standard Delivery</p>
                        <span className="text-[10px] text-slate-400">24-48h Delivery</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-navy-900">
                      ৳{customerInfo.district === 'Dhaka' ? 80 : 150}
                    </span>
                  </label>

                  <label 
                    onClick={() => setDeliveryMethod('Express Same-Day')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === 'Express Same-Day'
                        ? 'border-brand-500 bg-brand-50/50 shadow-2xs'
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

              {/* 4. Payment Method Selection */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  3. Payment Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod('bKash')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'bKash' 
                        ? 'border-pink-500 bg-pink-50 text-pink-900 shadow-2xs' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <BKashLogo className="h-6 w-auto" />
                    <span className="font-bold text-[11px]">bKash Pay</span>
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'Nagad' 
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-2xs' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <NagadLogo className="h-6 w-auto" />
                    <span className="font-bold text-[11px]">Nagad</span>
                  </label>

                  {/* Card */}
                  <label
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'Card' 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <VisaLogo className="h-4 w-auto" />
                      <MastercardLogo className="h-4 w-auto" />
                    </div>
                    <span className="font-bold text-[11px]">Cards</span>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'COD' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      💵
                    </div>
                    <span className="font-bold text-[11px]">Cash on Del.</span>
                  </label>
                </div>

                {/* Online TrxID simulation input */}
                {paymentMethod !== 'COD' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600">Simulate {paymentMethod} Transaction:</span>
                      <span className="text-emerald-600 font-bold">Gateway Sandbox Active</span>
                    </div>
                    <input
                      type="text"
                      placeholder={`Enter ${paymentMethod} TrxID or leave blank for instant auto-verify`}
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {/* 5. Financial Breakdown & Submit */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-slate-800">৳{deliveryFee}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-navy-900">Total Payable:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-xl text-brand-600">৳{grandTotal.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400">
                      {paymentMethod === 'COD' ? 'Pay upon doorstep delivery' : 'Payable right now online'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
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
                      {paymentMethod === 'COD' ? `Confirm Order with Cash on Delivery (৳${grandTotal.toLocaleString()})` : `Pay & Confirm Order (৳${grandTotal.toLocaleString()})`}
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

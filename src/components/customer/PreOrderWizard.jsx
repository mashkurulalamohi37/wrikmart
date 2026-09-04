import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Info,
  Globe2,
  Lock,
  RotateCcw
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from '../common/PaymentLogos';

export const PreOrderWizard = ({ onComplete, onCancel }) => {
  const { createCustomerPreOrder } = useApp();

  // Wizard Steps: 1 (Country & Link), 2 (Product Details), 3 (Cart), 4 (Customer Info), 5 (Review & Pay), 6 (Confirmed)
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('India');
  
  // Current Item in Builder
  const [currentItem, setCurrentItem] = useState({
    name: 'Nike Air Max 270',
    url: 'https://www.nike.com/in/t/air-max-270-mens-shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    size: '42',
    color: 'Black/Red',
    quantity: 1,
    expectedPrice: 8000,
    notes: 'Please check original tags and box condition.'
  });

  // Items in Order Cart
  const [items, setItems] = useState([
    {
      id: 'it-1',
      name: 'Nike Air Max 270',
      url: 'https://www.nike.com/in/t/air-max-270-mens-shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
      specs: { size: '42', color: 'Black/Red', unit: 1 },
      expectedPrice: 8000,
      notes: 'Black/Red edition'
    }
  ]);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Rahim Chowdhury',
    phone: '+880 1712-345678',
    email: 'rahim.c@example.com',
    address: 'House 12, Road 5, Dhanmondi, Dhaka-1205',
    district: 'Dhaka',
    note: 'Please call 30 minutes before arrival.'
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Financial Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.expectedPrice) * (it.specs?.unit || 1)), 0);
  const deliveryCharge = 200;
  const total = subtotal + deliveryCharge;
  const advanceRequired = Math.round(total * 0.25); // 25% advance rule

  // Add Item to Cart
  const handleAddItemToCart = () => {
    if (!currentItem.name) return;
    const newItem = {
      id: `it-${Date.now()}`,
      name: currentItem.name,
      url: currentItem.url,
      image: currentItem.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      specs: {
        size: currentItem.size || 'Standard',
        color: currentItem.color || 'Default',
        unit: Number(currentItem.quantity || 1)
      },
      expectedPrice: Number(currentItem.expectedPrice || 0),
      notes: currentItem.notes
    };

    setItems(prev => [...prev, newItem]);
    
    // Reset current item builder for next product
    setCurrentItem({
      name: '',
      url: '',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
      size: '',
      color: '',
      quantity: 1,
      expectedPrice: 0,
      notes: ''
    });

    setStep(3); // Go to Cart preview
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      showToast("Pre-order must have at least one product.", "warning");
      return;
    }
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // Submit Payment & Create Confirmed Order
  const handleConfirmAndPay = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const generatedTrxId = `TRX-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder = createCustomerPreOrder({
        country,
        items,
        customerInfo,
        paymentMethod,
        transactionId: generatedTrxId,
        advancePaid: advanceRequired
      });

      setConfirmedOrder(newOrder);
      setIsProcessingPayment(false);
      setStep(6); // Confirmation screen

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Progress Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          {step > 1 && step < 6 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Cross-Border Pre-Order Wizard</span>
            <h2 className="text-lg font-extrabold text-navy-900">
              {step === 1 && '1. Sourcing Country & Product Link'}
              {step === 2 && '2. Product Specifications & Customization'}
              {step === 3 && '3. Review Multi-Product Order Cart'}
              {step === 4 && '4. Delivery Address in Bangladesh'}
              {step === 5 && '5. Advance Payment & Order Placement'}
              {step === 6 && '6. Order Successfully Confirmed!'}
            </h2>
          </div>
        </div>

        {/* 5-Step Progress Indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-300' :
                s < step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {s < step ? '✓' : s}
              </span>
              {s < 5 && <div className={`w-4 h-0.5 ${s < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Desktop Layout */}
      {step < 6 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Wizard Forms (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
            
            {/* STEP 1: Country & Link */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-2">1. Select Sourcing Country *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'India', flag: '🇮🇳', subtitle: 'Amazon, Flipkart, Nike, Zara' },
                      { name: 'Dubai', flag: '🇦🇪', subtitle: 'Dubai Mall, Apple, Noon, Sephora' },
                      { name: 'Thailand', flag: '🇹🇭', subtitle: 'Shopee TH, CentralWorld, Siam' }
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCountry(c.name)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          country === c.name 
                            ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm ring-2 ring-brand-500/20' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                        }`}
                      >
                        <span className="text-3xl block mb-2">{c.flag}</span>
                        <span className="font-extrabold text-sm block text-navy-900">{c.name}</span>
                        <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">{c.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1">2. Product Website Link (URL)</label>
                  <p className="text-xs text-slate-500 mb-2">Paste the web link from Nike, Amazon, Apple, Zara, Flipkart etc.</p>
                  <div className="relative">
                    <input
                      type="url"
                      value={currentItem.url}
                      onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
                      placeholder="https://www.example.com/product/123"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 pr-24"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.readText().then(text => setCurrentItem({ ...currentItem, url: text }))}
                      className="absolute right-2 top-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Paste
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1">3. Or Upload Product Image / Screenshot</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors bg-slate-50">
                    {currentItem.image ? (
                      <div className="flex items-center justify-center gap-4">
                        <img src={currentItem.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border shadow-sm" />
                        <div className="text-left">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Product Image Attached
                          </span>
                          <p className="text-[11px] text-slate-500">Nike_AirMax_Black.jpg (450 KB)</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-slate-400 mt-1">JPG, PNG or Screenshot</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Next: Product Specifications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Product Specifications */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-200 flex items-center gap-4">
                  <img src={currentItem.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border" />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{country} Pre-Order</span>
                    <h4 className="font-extrabold text-base text-navy-900">{currentItem.name || 'Custom Product'}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-md">{currentItem.url}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    placeholder="e.g. Nike Air Max 270 Men's Running Shoes"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Size (Optional)</label>
                    <input
                      type="text"
                      value={currentItem.size}
                      onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value })}
                      placeholder="e.g. 42 / UK 8 / XL"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Color (Optional)</label>
                    <input
                      type="text"
                      value={currentItem.color}
                      onChange={(e) => setCurrentItem({ ...currentItem, color: e.target.value })}
                      placeholder="e.g. Black / Sky Blue"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Unit / Quantity *</label>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCurrentItem({ ...currentItem, quantity: Math.max(1, currentItem.quantity - 1) })}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                        className="w-full text-center py-2.5 text-xs font-bold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentItem({ ...currentItem, quantity: currentItem.quantity + 1 })}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Estimated Price (৳ BDT) *</label>
                    <input
                      type="number"
                      value={currentItem.expectedPrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, expectedPrice: Number(e.target.value) })}
                      placeholder="e.g. 8000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-brand-700 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Product Remarks / SKU (Optional)</label>
                  <textarea
                    rows="2"
                    value={currentItem.notes}
                    onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                    placeholder="Write any special instructions for the purchasing agent..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToCart}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Pre-Order Cart</span>
                </button>
              </div>
            )}

            {/* STEP 3: Multi-Product Cart */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-navy-900 text-base">Items in this Pre-Order ({items.length})</h3>
                  <span className="text-xs text-slate-500">Target Country: <strong className="text-brand-600">{country}</strong></span>
                </div>

                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                      <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded-xl border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-navy-900 truncate">{it.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>Size: <strong className="text-slate-800">{it.specs.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-slate-800">{it.specs.color}</strong></span>
                          <span>•</span>
                          <span>Qty: <strong className="text-slate-800">{it.specs.unit}</strong></span>
                        </div>
                        <span className="text-xs font-bold text-brand-600 mt-1 block">
                          ৳{(it.expectedPrice * it.specs.unit).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(it.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 border-2 border-dashed border-brand-400 text-brand-600 hover:bg-brand-50 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Product from {country}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span>Continue to Delivery Information</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 4: Customer Details */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">WhatsApp Mobile Number *</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Full Delivery Address in Bangladesh *</label>
                  <textarea
                    rows="2"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Delivery Notes (Optional)</label>
                  <input
                    type="text"
                    value={customerInfo.note}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                    placeholder="e.g. Call before delivery"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span>Proceed to Advance Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 5: Payment Method */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-2">Select Advance Payment Gateway</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* bKash Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === 'bKash'
                          ? 'border-[#E2136E] bg-pink-50/70 ring-2 ring-[#E2136E] font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <BKashLogo className="w-8 h-8 flex-shrink-0" />
                      <span className="block text-xs font-bold text-[#D81B60]">bKash Payment</span>
                      <span className="text-[10px] text-slate-400">Direct / App Checkout</span>
                    </button>

                    {/* Nagad Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === 'Nagad'
                          ? 'border-[#F7941D] bg-orange-50/70 ring-2 ring-[#F7941D] font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <NagadLogo className="w-8 h-8 flex-shrink-0" />
                      <span className="block text-xs font-bold text-[#E64A19]">Nagad Direct</span>
                      <span className="text-[10px] text-slate-400">Postal Digital Cash</span>
                    </button>

                    {/* Visa / Mastercard Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === 'Card'
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <VisaLogo className="w-7 h-4 flex-shrink-0" />
                        <MastercardLogo className="w-6 h-4 flex-shrink-0" />
                      </div>
                      <span className="block text-xs font-bold text-indigo-900">Cards / Banking</span>
                      <span className="text-[10px] text-slate-400">Visa, Master, Amex</span>
                    </button>

                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <p className="leading-snug">
                    <strong>100% Secure Purchase Guarantee:</strong> You only pay <strong>25% advance (৳{advanceRequired.toLocaleString()})</strong> now. The remaining due is collected upon physical doorstep delivery.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmAndPay}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold py-4 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isProcessingPayment ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Connecting to {paymentMethod} Gateway...
                    </span>
                  ) : (
                    <span>Pay Advance ৳{advanceRequired.toLocaleString()} & Confirm Order</span>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Desktop Order Summary Card (lg:col-span-4) */}
          <div className="lg:col-span-4 sticky top-36 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-navy-900 text-sm">Order Summary</h3>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {country} 🌐
                </span>
              </div>

              {/* Items Snapshot */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs text-slate-700">
                    <span className="truncate max-w-[160px] font-medium">{it.name} (x{it.specs.unit})</span>
                    <span className="font-bold">৳{(it.expectedPrice * it.specs.unit).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Subtotal:</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Bangladesh Courier Charge:</span>
                  <span className="font-bold text-slate-800">৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-navy-900 text-sm">
                  <span>Total Order Estimate:</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-brand-50 p-3 rounded-xl text-brand-800 font-extrabold text-sm border border-brand-200">
                  <span>Advance Required (25%):</span>
                  <span className="text-base text-brand-600">৳{advanceRequired.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Sourced from official {country} stores.</p>
                <p>• Remaining balance paid upon BD delivery.</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* STEP 6: Full-Width Confirmation Page */
        confirmedOrder && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-card text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-2">
                Advance Payment Received ✓
              </span>
              <h3 className="text-3xl font-extrabold text-navy-900">Pre-Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Order Tracking ID: <strong className="text-brand-600 font-mono text-sm">{confirmedOrder.orderNumber}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-800">{confirmedOrder.country} {confirmedOrder.countryFlag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Agent:</span>
                <span className="font-bold text-slate-800">{confirmedOrder.assignedAgentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advance Paid:</span>
                <span className="font-bold text-emerald-600">৳{confirmedOrder.financials.advancePaid.toLocaleString()} (Verified)</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="text-slate-700 font-bold">Remaining Due on Delivery:</span>
                <span className="font-extrabold text-navy-900">৳{confirmedOrder.financials.dueAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onComplete}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-6 rounded-xl shadow transition-all text-xs"
              >
                Go to Order Tracking
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>
        )
      )}

    </div>
  );
};

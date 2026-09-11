import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  Cake,
  Image as ImageIcon
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from '../common/PaymentLogos';
import { CountryFlag } from '../common/CountryFlag';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

/**
 * Extracts the Amazon ASIN from any Amazon URL format:
 * /dp/ASIN, /gp/product/ASIN, /product/ASIN, ?ASIN=, amzn.to short links
 */
const extractAmazonAsin = (urlStr) => {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]ASIN=([A-Z0-9]{10})/i,
    /\/([A-Z0-9]{10})(?:[/?&]|$)/i,
  ];
  for (const re of patterns) {
    const m = urlStr.match(re);
    if (m && m[1]) return m[1].toUpperCase();
  }
  return null;
};

/**
 * Returns a real Amazon product image URL from an ASIN.
 * Uses Amazon's publicly-accessible image CDN — no CORS, no auth needed.
 */
const buildAmazonImageUrl = (asin) => {
  if (!asin) return null;
  // SL500 = 500×500 main image, _AC_SL500_ quality preset
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL500_&ID=AsinImage&MarketPlace=IN&ServiceVersion=20070822&WS=1&tag=wrikmart-21`;
};

export const parseProductFromUrl = (rawUrl) => {
  if (!rawUrl || !rawUrl.trim()) return null;
  const urlStr = rawUrl.trim();
  const lower = urlStr.toLowerCase();

  // 1. Detect Country
  let detectedCountry = 'India';
  if (lower.includes('.ae') || lower.includes('dubai') || lower.includes('noon.com') || lower.includes('amazon.ae') || lower.includes('apple.com/ae')) {
    detectedCountry = 'Dubai';
  } else if (lower.includes('.th') || lower.includes('thailand') || lower.includes('shopee.co.th') || lower.includes('central.co.th') || lower.includes('lazada.co.th')) {
    detectedCountry = 'Thailand';
  } else if (lower.includes('.in') || lower.includes('flipkart') || lower.includes('amazon.in') || lower.includes('myntra') || lower.includes('ajio')) {
    detectedCountry = 'India';
  }

  // 2. Identify Platform
  let detectedPlatform = 'Global Online Store';
  if (lower.includes('amazon') || lower.includes('amzn')) detectedPlatform = `Amazon ${detectedCountry}`;
  else if (lower.includes('flipkart')) detectedPlatform = 'Flipkart India';
  else if (lower.includes('nike')) detectedPlatform = 'Nike Official';
  else if (lower.includes('apple')) detectedPlatform = 'Apple Store';
  else if (lower.includes('noon')) detectedPlatform = 'Noon UAE';
  else if (lower.includes('zara')) detectedPlatform = 'Zara Official';
  else if (lower.includes('sephora')) detectedPlatform = 'Sephora';

  // 3. Extract ASIN for Amazon URLs
  const isAmazon = lower.includes('amazon') || lower.includes('amzn');
  const asin = isAmazon ? extractAmazonAsin(urlStr) : null;

  // 4. Extract Name from URL path
  let detectedName = '';
  try {
    const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const pathname = decodeURIComponent(parsed.pathname);
    const parts = pathname.split('/').filter(Boolean);

    const dpIdx = parts.indexOf('dp');
    if (dpIdx > 0) {
      detectedName = parts[dpIdx - 1].replace(/[-_+]/g, ' ');
    } else if (parts.length > 0) {
      const candidates = parts.filter(p =>
        p !== 'dp' && p !== 'gp' && p !== 'product' && p !== 'd' &&
        p !== 'p' && p !== 'item' && !/^[A-Z0-9]{10}$/i.test(p) && p.length > 2
      );
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.length - a.length);
        detectedName = candidates[0].replace(/[-_+]/g, ' ');
      }
    }
  } catch (e) {}

  if (detectedName) {
    detectedName = detectedName
      .split(' ')
      .filter(w => w.length > 0 && !/^\d{5,}$/.test(w) && w.length < 35)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  if (!detectedName) {
    if (lower.includes('amazon') || lower.includes('amzn')) detectedName = 'Amazon Verified Product';
    else if (lower.includes('apple')) detectedName = 'Apple Product Import';
    else if (lower.includes('nike')) detectedName = 'Nike Authentic Footwear';
    else detectedName = 'Imported Global Product';
  }

  // 5. Detect Category & Price
  let category = 'General';
  let suggestedPrice = 3500;
  const lowerName = detectedName.toLowerCase();
  const lowerUrl = lower;
  if (lowerName.includes('beauty') || lowerName.includes('lipstick') || lowerName.includes('serum') || lowerName.includes('cream') || lowerName.includes('cosmetic') || lowerUrl.includes('beauty') || lowerUrl.includes('skincare')) {
    category = 'Beauty & Cosmetics';
    suggestedPrice = 1850;
  } else if (lowerName.includes('shoe') || lowerName.includes('sneaker') || lowerName.includes('nike') || lowerName.includes('running') || lowerName.includes('air max') || lowerUrl.includes('footwear') || lowerUrl.includes('shoes')) {
    category = 'Footwear';
    suggestedPrice = 8500;
  } else if (lowerName.includes('iphone') || lowerName.includes('macbook') || lowerName.includes('airpods') || lowerName.includes('apple') || lowerName.includes('laptop') || lowerName.includes('camera') || lowerName.includes('electronics') || lowerUrl.includes('electronics') || lowerUrl.includes('laptop') || lowerUrl.includes('phone') || lowerUrl.includes('headphone') || lowerUrl.includes('tablet')) {
    category = 'Electronics';
    suggestedPrice = 45000;
  } else if (lowerName.includes('dress') || lowerName.includes('shirt') || lowerName.includes('jacket') || lowerName.includes('zara') || lowerName.includes('hoodie') || lowerUrl.includes('fashion') || lowerUrl.includes('clothing') || lowerUrl.includes('apparel')) {
    category = 'Fashion';
    suggestedPrice = 4200;
  } else if (lowerName.includes('book') || lowerName.includes('stories') || lowerName.includes('novel') || lowerUrl.includes('books')) {
    category = 'Books';
    suggestedPrice = 900;
  } else if (lowerName.includes('toy') || lowerName.includes('game') || lowerName.includes('lego') || lowerName.includes('kids') || lowerName.includes('princess') || lowerName.includes('barbie') || lowerUrl.includes('toys')) {
    category = 'Toys & Kids';
    suggestedPrice = 2500;
  } else if (lowerName.includes('watch') || lowerUrl.includes('watch')) {
    category = 'Watches';
    suggestedPrice = 12000;
  } else if (lowerName.includes('perfume') || lowerName.includes('fragrance') || lowerUrl.includes('perfume')) {
    category = 'Perfumes';
    suggestedPrice = 5500;
  }

  // 6. Best image to show
  // For Amazon: use ASIN-based CDN image (publicly accessible, no CORS)
  // For others: curated high-quality Unsplash by category
  const categoryFallbacks = {
    'Beauty & Cosmetics': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    'Fashion': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    'Books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    'Toys & Kids': 'https://images.unsplash.com/photo-1558060370-d6752b65f7f9?w=600&auto=format&fit=crop&q=80',
    'Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    'Perfumes': 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&auto=format&fit=crop&q=80',
  };
  const fallbackImage = categoryFallbacks[category] || FALLBACK_PRODUCT_IMAGE;

  // Try Amazon image CDN first (ASIN-based), else use category fallback
  const amazonImg = asin ? `https://images-na.ssl-images-amazon.com/images/I/${asin}._AC_SL500_.jpg` : null;

  return {
    name: detectedName,
    platform: detectedPlatform,
    country: detectedCountry,
    category,
    suggestedPrice,
    asin,
    // Primary: real Amazon CDN image if ASIN found, else category Unsplash
    image: amazonImg || fallbackImage,
    // Kept as fallback if Amazon CDN 403s (used via onError in <img>)
    fallbackImage,
  };
};

export const PreOrderWizard = ({ onComplete, onCancel }) => {
  const { createCustomerPreOrder, customerProfile, prefilledPreOrder, setPrefilledPreOrder, showToast, preOrderFormSettings } = useApp();

  // Wizard Steps: 1 (Country & Link), 2 (Product Details), 3 (Cart), 4 (Customer Info), 5 (Review & Pay), 6 (Confirmed)
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('India');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Current Item in Builder (starts clean and dynamically updates)
  const [currentItem, setCurrentItem] = useState({
    name: '',
    url: '',
    image: '',
    imageName: '',
    imageSize: '',
    hasUserCustomImage: false,
    category: 'General',
    size: 'Standard',
    color: 'Default',
    quantity: 1,
    expectedPrice: '',
    notes: ''
  });

  // Handle pre-filled Pre-Order data from Header Search or Home Hero
  useEffect(() => {
    if (prefilledPreOrder) {
      if (prefilledPreOrder.url || prefilledPreOrder.name) {
        const rawUrl = (prefilledPreOrder.url || '').trim();
        const lower = rawUrl.toLowerCase();
        let detectedCountry = prefilledPreOrder.country || 'India';
        if (!prefilledPreOrder.country) {
          if (lower.includes('.ae') || lower.includes('dubai') || lower.includes('noon.com') || lower.includes('apple.com/ae') || lower.includes('amazon.ae')) {
            detectedCountry = 'Dubai';
          } else if (lower.includes('.th') || lower.includes('thailand') || lower.includes('shopee.co.th') || lower.includes('central.co.th') || lower.includes('lazada')) {
            detectedCountry = 'Thailand';
          } else {
            detectedCountry = 'India';
          }
        }
        setCountry(detectedCountry);

        let itemName = prefilledPreOrder.name || '';
        if (!itemName && rawUrl) {
          try {
            const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
            const parts = decodeURIComponent(parsed.pathname).split('/').filter(Boolean);
            const dpIdx = parts.indexOf('dp');
            if (dpIdx > 0) {
              itemName = parts[dpIdx - 1].replace(/[-_+]/g, ' ');
            } else if (parts.length > 0) {
              const candidates = parts.filter(p => p !== 'dp' && p !== 'gp' && p !== 'product' && p !== 'd' && !/^[A-Z0-9]{10}$/i.test(p));
              if (candidates.length > 0) {
                candidates.sort((a, b) => b.length - a.length);
                itemName = candidates[0].replace(/[-_+]/g, ' ');
              }
            }
          } catch (e) {}

          if (itemName) {
            itemName = itemName.split(' ').filter(w => w.length > 1 && !/^\d+$/.test(w) && w.length < 30).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }
        }

        if (!itemName) {
          if (lower.includes('amazon') || lower.includes('amzn')) itemName = 'Amazon Imported Product';
          else if (lower.includes('apple') || lower.includes('iphone')) itemName = 'Apple Device Import';
          else if (lower.includes('nike')) itemName = 'Nike Footwear Import';
          else itemName = 'Imported Global Product';
        }

        const isAppleOrExpensive = itemName.toLowerCase().includes('apple') || itemName.toLowerCase().includes('iphone');
        const estPrice = prefilledPreOrder.expectedPrice || (isAppleOrExpensive ? 85000 : 4500);

        const newCartItem = {
          id: `item-${Date.now()}`,
          name: itemName,
          url: rawUrl,
          category: itemName.toLowerCase().includes('shoe') || itemName.toLowerCase().includes('nike') ? 'Footwear' : 'Electronics',
          brand: itemName.toLowerCase().includes('apple') ? 'Apple' : itemName.toLowerCase().includes('nike') ? 'Nike' : (lower.includes('amazon') ? 'Amazon' : 'Global Brand'),
          image: prefilledPreOrder.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
          specs: { unit: 1, size: '', color: '' },
          expectedPrice: estPrice,
          notes: `Imported via ${detectedCountry} Agent`
        };

        setCurrentItem({
          name: itemName,
          url: rawUrl,
          category: newCartItem.category,
          expectedPrice: estPrice,
          quantity: 1,
          size: '',
          color: '',
          notes: '',
          image: newCartItem.image
        });

        // Replace demo item with customer's pasted product
        setItems([newCartItem]);
        setStep(2); // Directly show specifications
        setPrefilledPreOrder(null);
        showToast(`Pre-order created for "${itemName}" from ${detectedCountry}!`, 'success');
      }
    }
  }, [prefilledPreOrder, setPrefilledPreOrder]);

  const allCountriesList = [
    { name: 'India', key: 'india', subtitle: 'Amazon, Flipkart, Nike, Zara' },
    { name: 'Dubai', key: 'dubai', subtitle: 'Dubai Mall, Apple, Noon, Sephora' },
    { name: 'Thailand', key: 'thailand', subtitle: 'Shopee TH, CentralWorld, Siam' }
  ];

  const availableCountries = allCountriesList.filter(c => 
    preOrderFormSettings?.countries ? preOrderFormSettings.countries[c.key] !== false : true
  );

  useEffect(() => {
    if (availableCountries.length > 0 && !availableCountries.some(c => c.name === country)) {
      setCountry(availableCountries[0].name);
    }
  }, [preOrderFormSettings, country]);

  // Items in Order Cart (starts empty for clean user pre-orders)
  const [items, setItems] = useState([]);

  // Live URL Change Handler - Parses product title, platform, country, and category instantly
  const handleUrlChange = (newUrl) => {
    setCurrentItem(prev => {
      const updated = { ...prev, url: newUrl };
      if (!newUrl || !newUrl.trim()) {
        if (!prev.hasUserCustomImage) {
          updated.image = '';
          updated.name = '';
        }
        return updated;
      }

      const parsed = parseProductFromUrl(newUrl);
      if (parsed) {
        if (parsed.country && availableCountries.some(c => c.name === parsed.country)) {
          setCountry(parsed.country);
        }
        updated.name = parsed.name;
        updated.category = parsed.category;
        updated.brand = parsed.platform;
        if (!prev.hasUserCustomImage && parsed.image) {
          updated.image = parsed.image;
          updated.fallbackImage = parsed.fallbackImage || FALLBACK_PRODUCT_IMAGE;
        }
        if (!prev.expectedPrice || prev.expectedPrice === 8000) {
          updated.expectedPrice = parsed.suggestedPrice;
        }
      }
      return updated;
    });
  };

  // Real Image Upload Handlers (File Picker & Drag-and-Drop)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be less than 8MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const dataUrl = uploadEvt.target.result;
      setCurrentItem(prev => ({
        ...prev,
        image: dataUrl,
        imageName: file.name,
        imageSize: `${Math.round(file.size / 1024)} KB`,
        hasUserCustomImage: true
      }));
      showToast(`Uploaded ${file.name} successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be less than 8MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const dataUrl = uploadEvt.target.result;
      setCurrentItem(prev => ({
        ...prev,
        image: dataUrl,
        imageName: file.name,
        imageSize: `${Math.round(file.size / 1024)} KB`,
        hasUserCustomImage: true
      }));
      showToast(`Attached ${file.name}!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: customerProfile?.name || 'Rahim Chowdhury',
    phone: customerProfile?.phone || '+880 1712-345678',
    email: customerProfile?.email || 'rahim.c@example.com',
    address: customerProfile?.address || 'House 12, Road 5, Dhanmondi, Dhaka-1205',
    district: customerProfile?.district || 'Dhaka',
    dateOfBirth: customerProfile?.dateOfBirth || '',
    note: 'Please call 30 minutes before arrival.'
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('EPS');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Financial Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.expectedPrice) * (it.specs?.unit || 1)), 0);
  const deliveryCharge = 200;
  const total = subtotal + deliveryCharge;
  const advanceRequired = Math.round(total * 0.25); // 25% advance rule

  // Add Item to Cart
  const handleAddItemToCart = () => {
    if (!currentItem.name || !currentItem.name.trim()) {
      showToast("Please enter a valid product name or title.", "warning");
      return;
    }
    const priceNum = Number(currentItem.expectedPrice || 0);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Please enter a valid estimated price greater than ৳0.", "warning");
      return;
    }
    const qtyNum = Math.max(1, Math.floor(Number(currentItem.quantity || 1)));

    const newItem = {
      id: `it-${Date.now()}`,
      name: currentItem.name.trim(),
      url: currentItem.url,
      image: currentItem.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      specs: {
        size: currentItem.size || 'Standard',
        color: currentItem.color || 'Default',
        unit: qtyNum
      },
      expectedPrice: priceNum,
      notes: currentItem.notes
    };

    setItems(prev => [...prev, newItem]);
    
    // Reset current item builder for next product
    setCurrentItem({
      name: '',
      url: '',
      image: '',
      imageName: '',
      imageSize: '',
      hasUserCustomImage: false,
      category: 'General',
      size: '',
      color: '',
      quantity: 1,
      expectedPrice: '',
      notes: ''
    });

    setStep(3); // Go to Cart preview
  };

  const handleProceedToPayment = () => {
    if (!customerInfo.name || !customerInfo.name.trim()) {
      showToast("Please enter full recipient name.", "warning");
      return;
    }
    if (!customerInfo.phone || !customerInfo.phone.trim()) {
      showToast("Please enter a valid mobile / WhatsApp number.", "warning");
      return;
    }
    if (!customerInfo.address || !customerInfo.address.trim()) {
      showToast("Please enter complete delivery address in Bangladesh.", "warning");
      return;
    }
    setStep(5);
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
      const generatedTrxId = paymentMethod === 'EPS'
        ? `EPS-TRX-${Math.floor(100000 + Math.random() * 900000)}`
        : `TRX-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = createCustomerPreOrder({
        country,
        items,
        customerInfo,
        paymentMethod: paymentMethod === 'EPS' ? 'EPS Payment Gateway' : paymentMethod,
        epsStoreId: paymentMethod === 'EPS' ? 'f49c63f4-3c57-495c-ac00-b136093671d4' : undefined,
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
                    {availableCountries.map((c) => (
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
                        <div className="mb-2">
                          <CountryFlag country={c.name} className="w-10 h-7 rounded shadow-xs" />
                        </div>
                        <span className="font-extrabold text-sm block text-navy-900">{c.name}</span>
                        <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">{c.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Product Website Link (URL) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-navy-900">2. Product Website Link (URL)</label>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      Auto-Detects Product Info
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Paste any product web link from Amazon, Flipkart, Nike, Apple, Sephora, Noon etc.</p>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={currentItem.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="Paste product link (e.g. https://www.amazon.in/...)..."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 pr-24 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard?.readText) {
                          navigator.clipboard.readText()
                            .then(text => {
                              if (text) {
                                handleUrlChange(text);
                                showToast('Link pasted & product analyzed!', 'success');
                              }
                            })
                            .catch(() => showToast('Unable to read clipboard. Please paste manually.', 'info'));
                        }
                      }}
                      className="absolute right-2 top-2 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-brand-200"
                    >
                      Paste Link
                    </button>
                  </div>

                  {/* Live Detected Product Feedback Card */}
                  {currentItem.url && (
                    <div className="mt-2.5 p-3.5 bg-brand-50/70 border border-brand-200/80 rounded-2xl flex items-center gap-3.5 animate-fade-in shadow-2xs">
                      <img 
                        src={currentItem.image || FALLBACK_PRODUCT_IMAGE} 
                        alt={currentItem.name || 'Detected Product'}
                        className="w-14 h-14 object-cover rounded-xl border border-brand-200 bg-white flex-shrink-0 shadow-2xs"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          // Use category-specific fallback, not the generic watch image
                          e.currentTarget.src = currentItem.fallbackImage || FALLBACK_PRODUCT_IMAGE;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white font-extrabold text-[9px] uppercase tracking-wider">
                            {currentItem.brand || 'Online Store'}
                          </span>
                          <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                            <CountryFlag country={country} className="w-3.5 h-2.5 rounded-xs" />
                            {country} Hub
                          </span>
                          {currentItem.category && (
                            <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {currentItem.category}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-xs sm:text-sm text-navy-900 truncate mt-1" title={currentItem.name || currentItem.url}>
                          {currentItem.name || 'Analyzing product link...'}
                        </h4>

                        <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Link verified for agent procurement</span>
                          {currentItem.expectedPrice > 0 && (
                            <span className="text-slate-400 font-normal ml-1">
                              • Est. ৳{Number(currentItem.expectedPrice).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Or Upload Product Image / Screenshot */}
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1">3. Or Upload Product Image / Screenshot</label>
                  <p className="text-xs text-slate-500 mb-2">Upload a photo, catalog image, or mobile screenshot of the item you want.</p>
                  
                  {/* Real Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Interactive Upload Zone with Drag & Drop */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleImageDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer select-none ${
                      isDragging 
                        ? 'border-brand-500 bg-brand-50/70 scale-[1.01]' 
                        : currentItem.hasUserCustomImage && currentItem.image
                          ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/60' 
                          : 'border-slate-300 hover:border-brand-400 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    {currentItem.hasUserCustomImage && currentItem.image ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img 
                            src={currentItem.image} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-xl border border-emerald-300 shadow-sm bg-white" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div className="text-left">
                            <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Product Image Attached
                            </span>
                            <p className="text-xs font-bold text-navy-900 truncate max-w-xs mt-0.5">
                              {currentItem.imageName || 'Product Screenshot'}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {currentItem.imageSize || 'Image uploaded for purchasing agent'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            Replace Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentItem(prev => ({
                                ...prev,
                                image: '',
                                imageName: '',
                                imageSize: '',
                                hasUserCustomImage: false
                              }));
                              showToast('Uploaded image removed', 'info');
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Remove Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-extrabold text-navy-900">
                          Click to browse or drag & drop photo / screenshot
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports JPG, PNG, WEBP up to 8MB • Screenshots from mobile or laptop
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!currentItem.url?.trim() && !currentItem.name?.trim() && !currentItem.hasUserCustomImage && !currentItem.image) {
                      showToast("Please paste a product web link or upload a screenshot/photo.", "warning");
                      return;
                    }

                    if (currentItem.url && !currentItem.name) {
                      const parsed = parseProductFromUrl(currentItem.url);
                      if (parsed) {
                        setCurrentItem(prev => ({
                          ...prev,
                          name: parsed.name,
                          category: parsed.category,
                          brand: parsed.platform,
                          image: prev.hasUserCustomImage ? prev.image : (parsed.image || prev.image),
                          expectedPrice: prev.expectedPrice || parsed.suggestedPrice
                        }));
                      }
                    }

                    setStep(2);
                  }}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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
                  <img 
                    src={currentItem.image || FALLBACK_PRODUCT_IMAGE} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-xl border bg-white shadow-2xs" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
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
                        onClick={() => setCurrentItem({ ...currentItem, quantity: Math.max(1, (currentItem.quantity || 1) - 1) })}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setCurrentItem({ ...currentItem, quantity: isNaN(v) || v < 1 ? 1 : v });
                        }}
                        className="w-full text-center py-2.5 text-xs font-bold focus:outline-none"
                        aria-label="Product quantity"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentItem({ ...currentItem, quantity: (currentItem.quantity || 1) + 1 })}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Estimated Price (৳ BDT) *</label>
                    <input
                      type="number"
                      min="1"
                      value={currentItem.expectedPrice || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCurrentItem({ ...currentItem, expectedPrice: isNaN(val) ? 0 : Math.max(0, val) });
                      }}
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

                {items.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No items in your pre-order cart yet.</p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      + Add Product via Link or Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                        <img 
                          src={it.image || FALLBACK_PRODUCT_IMAGE} 
                          alt={it.name} 
                          className="w-16 h-16 object-cover rounded-xl border flex-shrink-0 bg-white" 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
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
                )}

                <button
                  type="button"
                  onClick={() => setStep(1)}
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
                  <label className="block text-xs font-bold text-navy-900 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Cake className="w-3.5 h-3.5 text-rose-500" />
                      <span>Date of Birth / Birthday (Optional)</span>
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      🎂 Unlock annual birthday discount vouchers!
                    </span>
                  </label>
                  <input
                    type="date"
                    value={customerInfo.dateOfBirth || ''}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                  />
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
                  onClick={handleProceedToPayment}
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* EPS Gateway Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('EPS')}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
                        paymentMethod === 'EPS'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 bg-emerald-600 text-white text-[7px] font-black rounded uppercase">Fast</span>
                      <img src="/eps/Group 93.png" alt="EPS Gateway" className="h-6 sm:h-7 w-auto object-contain" />
                      <span className="block text-xs font-black text-emerald-950">EPS Gateway</span>
                      <span className="text-[10px] text-slate-500">Cards, MFS & Banking</span>
                    </button>

                    {/* bKash Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === 'bKash'
                          ? 'border-[#E2136E] bg-pink-50/70 ring-2 ring-[#E2136E] font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <BKashLogo className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
                      <span className="block text-xs font-bold text-[#D81B60]">bKash Payment</span>
                      <span className="text-[10px] text-slate-400">Direct Checkout</span>
                    </button>

                    {/* Nagad Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === 'Nagad'
                          ? 'border-[#F7941D] bg-orange-50/70 ring-2 ring-[#F7941D] font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <NagadLogo className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
                      <span className="block text-xs font-bold text-[#E64A19]">Nagad Direct</span>
                      <span className="text-[10px] text-slate-400">Postal Digital Cash</span>
                    </button>

                    {/* Visa / Mastercard Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        paymentMethod === 'Card'
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <VisaLogo className="w-6 h-3.5 sm:w-7 sm:h-4 flex-shrink-0" />
                        <MastercardLogo className="w-5 h-3.5 sm:w-6 sm:h-4 flex-shrink-0" />
                      </div>
                      <span className="block text-xs font-bold text-indigo-900">Cards / Bank</span>
                      <span className="text-[10px] text-slate-400">Visa, Master, Amex</span>
                    </button>

                  </div>
                </div>

                {paymentMethod === 'EPS' && (
                  <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Certified EPS PGW Merchant Gateway • Instant Verification</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      Store ID: f49c63f4-3c57-495c-ac00-b136093671d4
                    </span>
                  </div>
                )}

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
                <span className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>{confirmedOrder.country}</span>
                  <CountryFlag country={confirmedOrder.country} className="w-4 h-3 rounded-xs" />
                </span>
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

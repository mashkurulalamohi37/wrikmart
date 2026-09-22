import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  createEpsPaymentSession,
  generateEpsTransactionId,
  verifyEpsTransaction
} from '../../utils/epsPaymentService';
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
  Image as ImageIcon,
  MessageCircle,
  Calculator,
  Bot,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from '../common/PaymentLogos';
import { CountryFlag } from '../common/CountryFlag';
import { detectAutomatedPrice } from '../../utils/productPricingEngine';

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
  if (!urlStr) return null;
  for (const p of patterns) {
    const m = urlStr.match(p);
    if (m && m[1]) return m[1].toUpperCase();
  }
  return null;
};

export const parseProductFromUrl = (rawUrl, exchangeRates = null) => {
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

  // 5. Detect Category
  let category = 'General';
  const lowerName = detectedName.toLowerCase();
  const lowerUrl = lower;

  if (lowerName.includes('beauty') || lowerName.includes('lipstick') || lowerName.includes('serum') || lowerName.includes('cream') || lowerName.includes('cosmetic') || lowerUrl.includes('beauty') || lowerUrl.includes('skincare') || lowerUrl.includes('sephora')) {
    category = 'Beauty & Cosmetics';
  } else if (lowerName.includes('shoe') || lowerName.includes('sneaker') || lowerName.includes('nike') || lowerName.includes('running') || lowerName.includes('air max') || lowerName.includes('jordan') || lowerName.includes('adidas') || lowerUrl.includes('footwear') || lowerUrl.includes('shoes')) {
    category = 'Footwear';
  } else if (lowerName.includes('iphone') || lowerName.includes('macbook') || lowerName.includes('airpods') || lowerName.includes('apple') || lowerName.includes('laptop') || lowerName.includes('camera') || lowerName.includes('electronics') || lowerUrl.includes('electronics') || lowerUrl.includes('laptop') || lowerUrl.includes('phone') || lowerUrl.includes('headphone') || lowerUrl.includes('tablet')) {
    category = 'Electronics';
  } else if (lowerName.includes('book') || lowerName.includes('stories') || lowerName.includes('story') || lowerName.includes('princess') || lowerName.includes('disney') || lowerName.includes('novel') || lowerName.includes('manga') || lowerName.includes('comic') || lowerUrl.includes('book') || lowerUrl.includes('stories')) {
    category = 'Books & Stories';
  } else if (lowerName.includes('dress') || lowerName.includes('shirt') || lowerName.includes('jacket') || lowerName.includes('zara') || lowerName.includes('hoodie') || lowerUrl.includes('fashion') || lowerUrl.includes('clothing') || lowerUrl.includes('apparel')) {
    category = 'Fashion';
  } else if (lowerName.includes('toy') || lowerName.includes('game') || lowerName.includes('lego') || lowerName.includes('kids') || lowerName.includes('barbie') || lowerUrl.includes('toys')) {
    category = 'Toys & Kids';
  } else if (lowerName.includes('watch') || lowerUrl.includes('watch')) {
    category = 'Watches';
  } else if (lowerName.includes('perfume') || lowerName.includes('fragrance') || lowerUrl.includes('perfume')) {
    category = 'Perfumes';
  }

  // 6. Category curated Unsplash images
  const categoryFallbacks = {
    'Beauty & Cosmetics': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    'Books & Stories': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'Fashion': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    'Toys & Kids': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
    'Watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    'Perfumes': 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&auto=format&fit=crop&q=80',
    'General': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  };
  const fallbackImage = categoryFallbacks[category] || categoryFallbacks['General'];

  // Amazon ASIN Image CDN
  const amazonImg = asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg` : null;

  // 7. Automated Retail Price & Currency Detection
  const autoPrice = detectAutomatedPrice({
    name: detectedName,
    url: urlStr,
    country: detectedCountry,
    category,
    exchangeRates
  });

  return {
    name: detectedName,
    platform: detectedPlatform,
    country: detectedCountry,
    category,
    asin,
    image: amazonImg || fallbackImage,
    fallbackImage,
    mrp: '',
    expectedPrice: '',
    confidence: '',
    isAutoDetected: true
  };
};

export const PreOrderWizard = ({ onComplete, onCancel }) => {
  const { 
    createCustomerPreOrder, 
    customerProfile, 
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    prefilledPreOrder, 
    setPrefilledPreOrder, 
    showToast, 
    preOrderFormSettings,
    exchangeRates,
    epsSettings
  } = useApp();

  // Wizard Steps: 1 (Country & Link), 2 (Product Details), 3 (Cart), 4 (Customer Info), 5 (Review & Pay), 6 (Confirmed)
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('India');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to get currency details & exchange rate for active sourcing country
  const getCurrencyDetails = (countryName) => {
    if (countryName === 'India') {
      const rate = exchangeRates?.INR?.rateToBDT || 1.43;
      return { code: 'INR', symbol: '₹', rate, label: 'Indian Rupee (INR)' };
    }
    if (countryName === 'Dubai') {
      const rate = exchangeRates?.AED?.rateToBDT || 32.5;
      return { code: 'AED', symbol: 'AED', rate, label: 'UAE Dirham (AED)' };
    }
    if (countryName === 'Thailand') {
      const rate = exchangeRates?.THB?.rateToBDT || 3.55;
      return { code: 'THB', symbol: '฿', rate, label: 'Thai Baht (THB)' };
    }
    return { code: 'BDT', symbol: '৳', rate: 1.0, label: 'Bangladesh Taka (BDT)' };
  };

  const currentFx = getCurrencyDetails(country);
  
  // Current Item in Builder
  const [currentItem, setCurrentItem] = useState({
    name: '',
    url: '',
    image: '',
    fallbackImage: '',
    imageName: '',
    imageSize: '',
    hasUserCustomImage: false,
    category: 'General',
    size: 'Standard',
    color: 'Default',
    quantity: 1,
    mrp: '',
    expectedPrice: '',
    confidence: '',
    isAutoDetected: false,
    notes: ''
  });

  // Handle pre-filled Pre-Order data from Header Search or Home Hero
  useEffect(() => {
    if (prefilledPreOrder) {
      const rawUrl = (prefilledPreOrder.url || '').trim();
      const rawName = (prefilledPreOrder.name || '').trim();
      
      const parsed = parseProductFromUrl(rawUrl || rawName, exchangeRates);
      
      const itemName = rawName || parsed?.name || 'Imported Product';
      const detectedCountry = prefilledPreOrder.country || parsed?.country || 'India';
      const detectedCategory = parsed?.category || 'General';
      const detectedBrand = prefilledPreOrder.platform || parsed?.platform || 'Global Online Store';
      const detectedImage = prefilledPreOrder.image || parsed?.image || parsed?.fallbackImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
      const detectedFallback = parsed?.fallbackImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
      
      const fx = getCurrencyDetails(detectedCountry);
      
      // Auto-Price calculation
      const autoPrice = detectAutomatedPrice({
        name: itemName,
        url: rawUrl,
        country: detectedCountry,
        category: detectedCategory,
        exchangeRates
      });

      const estPrice = prefilledPreOrder.expectedPrice || autoPrice.expectedPrice;
      const estMrp = prefilledPreOrder.mrp || autoPrice.mrp;

      setCountry(detectedCountry);

      setCurrentItem({
        name: itemName,
        url: rawUrl,
        category: detectedCategory,
        brand: detectedBrand,
        mrp: estMrp,
        expectedPrice: estPrice,
        confidence: autoPrice.confidence,
        isAutoDetected: true,
        quantity: 1,
        size: '',
        color: '',
        notes: '',
        image: detectedImage,
        fallbackImage: detectedFallback
      });

      setItems([]); // Keep cart clean until user confirms in Step 2
      setStep(2); // Directly show specifications
      setPrefilledPreOrder(null);
      showToast(`🤖 Automated price detected for ${detectedBrand}: ${fx.symbol}${estMrp} (৳${estPrice.toLocaleString()} BDT)`, 'success');
    }
  }, [prefilledPreOrder, setPrefilledPreOrder, exchangeRates]);

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

  // Auto-switch country & auto-detect price if user pastes a URL matching a different country
  const handleUrlChange = (urlVal) => {
    const rawUrl = urlVal.trim();
    const parsed = parseProductFromUrl(rawUrl, exchangeRates);

    if (parsed) {
      if (parsed.country && parsed.country !== country) {
        setCountry(parsed.country);
        showToast(`Switched sourcing station to ${parsed.country}!`, 'info');
      }

      setCurrentItem(prev => ({
        ...prev,
        url: rawUrl,
        name: parsed.name,
        category: parsed.category,
        brand: parsed.platform,
        mrp: parsed.mrp,
        expectedPrice: parsed.expectedPrice,
        confidence: parsed.confidence,
        isAutoDetected: true,
        image: prev.hasUserCustomImage ? prev.image : (parsed.image || prev.image),
        fallbackImage: parsed.fallbackImage
      }));
    } else {
      setCurrentItem(prev => ({ ...prev, url: urlVal }));
    }
  };

  // Image Upload Handlers
  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      showToast('Please drop a valid image file (PNG, JPG, WEBP)', 'warning');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    if (file.size > 8 * 1024 * 1024) {
      showToast('File size is too large. Please select an image under 8MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
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

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState(() => ({
    name: customerProfile?.name || (currentUser?.name && currentUser?.role !== 'admin' ? currentUser.name : ''),
    phone: customerProfile?.phone || (currentUser?.phone && currentUser?.role !== 'admin' ? currentUser.phone : ''),
    email: customerProfile?.email || (currentUser?.email && currentUser?.role !== 'admin' ? currentUser.email : ''),
    address: customerProfile?.address || '',
    district: customerProfile?.district || 'Dhaka',
    dateOfBirth: customerProfile?.dateOfBirth || '',
    note: ''
  }));

  useEffect(() => {
    if (customerProfile?.name || currentUser?.name) {
      setCustomerInfo(prev => ({
        ...prev,
        name: prev.name || customerProfile?.name || (currentUser?.role !== 'admin' ? currentUser?.name : '') || '',
        phone: prev.phone || customerProfile?.phone || (currentUser?.role !== 'admin' ? currentUser?.phone : '') || '',
        email: prev.email || customerProfile?.email || (currentUser?.role !== 'admin' ? currentUser?.email : '') || '',
        address: prev.address || customerProfile?.address || '',
        district: prev.district || customerProfile?.district || 'Dhaka',
        dateOfBirth: prev.dateOfBirth || customerProfile?.dateOfBirth || ''
      }));
    }
  }, [customerProfile, currentUser]);

  // Payment Selection - Unified Certified EPS Gateway
  const [paymentMethod, setPaymentMethod] = useState('EPS');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [epsActiveSession, setEpsActiveSession] = useState(null);
  const [epsVerificationStatus, setEpsVerificationStatus] = useState('waiting');
  const [epsErrorMessage, setEpsErrorMessage] = useState('');
  const [isCheckingEps, setIsCheckingEps] = useState(false);

  // Financial Calculations: 30% Advance Rule on Estimated Subtotal (Reactively supports currentItem during builder Step 2)
  const standardDelivery = Number(preOrderFormSettings?.courierDeliveryCharge ?? 200);
  const freeThreshold = Number(preOrderFormSettings?.freeShippingThreshold || 0);
  const currentItemSubtotal = (Number(currentItem.expectedPrice) || 0) * (Number(currentItem.quantity) || 1);
  const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.expectedPrice) * (it.specs?.unit || 1)), 0);
  const subtotal = items.length > 0 ? itemsSubtotal : (step <= 2 ? currentItemSubtotal : 0);
  const deliveryCharge = subtotal > 0 ? ((freeThreshold > 0 && subtotal >= freeThreshold) ? 0 : standardDelivery) : 0;
  const total = subtotal + deliveryCharge;
  const advanceRequired = Math.round(subtotal * 0.30); // 30% advance on product estimated subtotal!

  // Add Item to Cart
  const handleAddItemToCart = () => {
    if (!currentItem.name || !currentItem.name.trim()) {
      showToast("Please enter a valid product name or title.", "warning");
      return;
    }
    const priceNum = Number(currentItem.expectedPrice || 0);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast(`Please enter the Store MRP (in ${currentFx.symbol} ${currentFx.code}) or Estimated BDT price greater than 0.`, "warning");
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
      mrp: currentItem.mrp || Math.round(priceNum / currentFx.rate),
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
      mrp: '',
      expectedPrice: '',
      notes: ''
    });

    setStep(3); // Go to Cart preview
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
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

  const finalizeEpsPreOrder = (pending, trxId) => {
    try {
      const order = createCustomerPreOrder({
        country: pending.country,
        items: pending.items,
        customerInfo: pending.customerInfo,
        paymentMethod: 'EPS Payment Gateway',
        epsStoreId: pending.epsStoreId,
        transactionId: trxId,
        advancePaid: pending.advancePaid
      });
      sessionStorage.removeItem('eps_pending_order');
      localStorage.removeItem('wrikmart_pending_order');
      setEpsActiveSession(null);
      setConfirmedOrder(order);
      setIsProcessingPayment(false);
      setStep(6);
      try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch (_) {}
      if (showToast) showToast('Payment verified successfully! Pre-order confirmed.', 'success');
    } catch (err) {
      console.error('Error finalizing pre-order:', err);
      if (showToast) showToast('Error saving order. Contact support with Trx: ' + trxId, 'error');
    }
  };

  // Real-time EPS polling effect for pre-orders
  useEffect(() => {
    if (!epsActiveSession || confirmedOrder || epsVerificationStatus === 'failed') return;
    let isCancelled = false;

    const intervalId = setInterval(async () => {
      try {
        const epsData = await verifyEpsTransaction(epsActiveSession.merchantTransactionId, epsSettings);
        const statusStr = String(epsData?.Status || epsData?.TransactionStatus || epsData?.status || '').toLowerCase();

        if (statusStr.includes('success') || statusStr === '1' || epsData?.TransactionStatusId === 1) {
          if (isCancelled) return;
          clearInterval(intervalId);
          if (epsActiveSession.popupWindow && !epsActiveSession.popupWindow.closed) {
            try { epsActiveSession.popupWindow.close(); } catch (_) {}
          }
          finalizeEpsPreOrder(epsActiveSession.pendingOrder, epsActiveSession.merchantTransactionId);
        } else if (statusStr.includes('fail') || statusStr.includes('cancel')) {
          if (isCancelled) return;
          setEpsVerificationStatus('failed');
          setEpsErrorMessage(epsData?.ErrorMessage || 'Transaction was cancelled or failed in gateway.');
        }
      } catch (err) {
        console.warn('EPS pre-order polling check error:', err.message);
      }
    }, 3500);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [epsActiveSession, confirmedOrder, epsVerificationStatus]);

  const handleManualEpsVerify = async () => {
    if (!epsActiveSession) return;
    setIsCheckingEps(true);
    try {
      const epsData = await verifyEpsTransaction(epsActiveSession.merchantTransactionId, epsSettings);
      const statusStr = String(epsData?.Status || epsData?.TransactionStatus || epsData?.status || '').toLowerCase();

      if (statusStr.includes('success') || statusStr === '1' || epsData?.TransactionStatusId === 1) {
        if (epsActiveSession.popupWindow && !epsActiveSession.popupWindow.closed) {
          try { epsActiveSession.popupWindow.close(); } catch (_) {}
        }
        finalizeEpsPreOrder(epsActiveSession.pendingOrder, epsActiveSession.merchantTransactionId);
      } else if (statusStr.includes('fail') || statusStr.includes('cancel')) {
        setEpsVerificationStatus('failed');
        setEpsErrorMessage(epsData?.ErrorMessage || 'Payment failed or cancelled.');
        if (showToast) showToast('Payment was not completed in gateway.', 'warning');
      } else {
        if (showToast) showToast('Payment is still pending in EPS gateway. Please complete payment in the gateway window.', 'info');
      }
    } catch (err) {
      if (showToast) showToast(`Verification check: ${err.message}`, 'error');
    } finally {
      setIsCheckingEps(false);
    }
  };

  const reopenPaymentWindow = () => {
    if (!epsActiveSession?.redirectUrl) return;
    const popup = window.open(epsActiveSession.redirectUrl, 'EPS_Payment_Window', 'width=520,height=760,top=80,left=80');
    setEpsActiveSession(prev => prev ? ({ ...prev, popupWindow: popup }) : null);
    setEpsVerificationStatus('waiting');
  };

  // Submit Payment & Open Real-Time EPS Verification Window
  const handleConfirmAndPay = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      if (showToast) showToast('Please provide your name, phone number, and delivery address in Step 4.', 'warning');
      setStep(4);
      return;
    }

    const epsStore = epsSettings?.storeId || '5c6d0f37-2974-4be8-818d-0736593e456e';
    setIsProcessingPayment(true);

    try {
      const merchantTransactionId = generateEpsTransactionId();

      // Save pending order data to sessionStorage and localStorage before gateway session
      const pendingOrder = {
        type: 'preorder',
        merchantTransactionId,
        country,
        items,
        customerInfo,
        epsStoreId: epsStore,
        advancePaid: advanceRequired
      };
      sessionStorage.setItem('eps_pending_order', JSON.stringify(pendingOrder));
      localStorage.setItem('wrikmart_pending_order', JSON.stringify(pendingOrder));

      // Call EPS API to initialize payment session
      const session = await createEpsPaymentSession({
        orderNumber: `PRE-${merchantTransactionId}`,
        merchantTransactionId,
        totalAmount: advanceRequired, // 30% advance
        customerInfo,
        orderType: 'Pre-Order',
        items: items.map((item, idx) => ({
          name: item.name || `Item ${idx + 1}`,
          quantity: item.specs?.unit || 1,
          price: item.expectedPrice || 0,
          sellingPrice: item.expectedPrice || 0,
          category: item.category || 'Pre-Order'
        }))
      }, epsSettings);

      if (!session.redirectUrl) {
        throw new Error('EPS did not return a redirect URL. Please try again.');
      }

      // Open EPS payment page in a secure focused popup window
      const popup = window.open(session.redirectUrl, 'EPS_Payment_Window', 'width=520,height=760,top=80,left=80');

      setEpsActiveSession({
        merchantTransactionId,
        totalAmount: advanceRequired,
        redirectUrl: session.redirectUrl,
        pendingOrder,
        popupWindow: popup
      });
      setEpsVerificationStatus('waiting');
      setEpsErrorMessage('');
      setIsProcessingPayment(false);

      if (showToast) showToast('EPS payment window opened. Please complete your payment.', 'info');

    } catch (err) {
      console.error('EPS pre-order payment initialization failed:', err);
      setIsProcessingPayment(false);
      sessionStorage.removeItem('eps_pending_order');
      localStorage.removeItem('wrikmart_pending_order');
      if (showToast) showToast(
        `EPS Gateway Error: ${err.message || 'Could not connect to EPS. Please try again or contact support.'}`,
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Progress Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {step > 1 && step < 6 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">Cross-Border Pre-Order Wizard</span>
            <h2 className="text-base sm:text-lg font-extrabold text-navy-900 truncate sm:whitespace-normal">
              {step === 1 && '1. Sourcing Country & Product Link'}
              {step === 2 && '2. Product Specifications & Customization'}
              {step === 3 && '3. Review Multi-Product Order Cart'}
              {step === 4 && '4. Delivery Address in Bangladesh'}
              {step === 5 && '5. Advance Payment & Order Placement'}
              {step === 6 && '6. Order Successfully Confirmed!'}
            </h2>
          </div>
        </div>

        {/* Desktop/Tablet 5-Step Progress Indicators */}
        <div className="hidden sm:flex items-center gap-2">
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

        {/* Mobile Compact Progress Bar */}
        <div className="w-full sm:hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span className="text-brand-600">Step {step} of 5</span>
            <span className="text-slate-400">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Desktop Layout */}
      {step < 6 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Interactive Wizard Forms (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card p-4 sm:p-8 space-y-6">
            
            {/* STEP 1: Country & Link */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-2">1. Select Sourcing Country *</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {availableCountries.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCountry(c.name)}
                        className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${
                          country === c.name 
                            ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm ring-2 ring-brand-500/20' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-center sm:justify-start mb-1.5 sm:mb-2">
                          <CountryFlag country={c.name} className="w-8 h-5 sm:w-10 sm:h-7 rounded shadow-xs" />
                        </div>
                        <span className="font-extrabold text-xs sm:text-sm block text-navy-900 truncate">{c.name}</span>
                        <span className="text-[9px] sm:text-[11px] text-slate-500 block leading-tight mt-0.5 truncate">{c.subtitle}</span>
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
                          {currentItem.expectedPrice > 0 ? (
                            <span className="text-slate-600 font-bold ml-1">
                              • Est. ৳{Number(currentItem.expectedPrice).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium ml-1">
                              • Enter Store MRP in Step 2 for live BDT conversion (1 {currentFx.code} = ৳{currentFx.rate})
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
                          image: prev.hasUserCustomImage ? prev.image : (parsed.image || prev.image)
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
                    src={currentItem.image || currentItem.fallbackImage || FALLBACK_PRODUCT_IMAGE} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-xl border bg-white shadow-2xs" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = currentItem.fallbackImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{country} Pre-Order</span>
                    <h4 className="font-extrabold text-base text-navy-900 truncate">{currentItem.name || 'Custom Product'}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-md">{currentItem.url || 'Manual Specification'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    placeholder="e.g. Nike Air Max 270 Men's Running Shoes"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
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

                {/* MRP in Local Sourcing Currency & Estimated BDT Price Calculation */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-brand-50/20 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-navy-900 flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-brand-600" />
                        <span>Store Price & Exchange Rate Calculator</span>
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Enter the price shown on the {currentItem.brand || country} store page
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-brand-200 text-brand-700 text-xs font-black shadow-2xs self-start sm:self-auto">
                      <Globe2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Live FX: 1 {currentFx.code} = ৳{currentFx.rate} BDT</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* 1. Unit / Qty */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit / Quantity *</label>
                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setCurrentItem({ ...currentItem, quantity: Math.max(1, (currentItem.quantity || 1) - 1) })}
                          className="px-3.5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold transition-colors cursor-pointer"
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
                          className="w-full text-center py-2 text-xs font-extrabold text-navy-900 focus:outline-none"
                          aria-label="Product quantity"
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentItem({ ...currentItem, quantity: (currentItem.quantity || 1) + 1 })}
                          className="px-3.5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 2. Store MRP in Origin Currency */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Store MRP ({currentFx.symbol} {currentFx.code}) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-black text-slate-400">
                          {currentFx.symbol}
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={currentItem.mrp || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const newMrp = isNaN(val) ? '' : Math.max(0, val);
                            const calculatedBDT = newMrp ? Math.round(newMrp * currentFx.rate) : '';
                            setCurrentItem(prev => ({
                              ...prev,
                              mrp: newMrp,
                              expectedPrice: calculatedBDT
                            }));
                          }}
                          placeholder={`e.g. ${country === 'India' ? '5995' : country === 'Dubai' ? '299' : '1500'}`}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800 bg-white focus:ring-2 focus:ring-brand-500 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* 3. Estimated Price in BDT */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Estimated BDT Price (৳) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-black text-brand-600">
                          ৳
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={currentItem.expectedPrice || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const newBDT = isNaN(val) ? '' : Math.max(0, val);
                            const calculatedMRP = newBDT ? Math.round(newBDT / currentFx.rate) : '';
                            setCurrentItem(prev => ({
                              ...prev,
                              expectedPrice: newBDT,
                              mrp: calculatedMRP
                            }));
                          }}
                          placeholder="e.g. 8573"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-brand-300 text-xs font-black text-brand-700 bg-brand-50/40 focus:ring-2 focus:ring-brand-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Math & 30% Advance Breakdown Pill */}
                  {Number(currentItem.expectedPrice) > 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-brand-200/90 shadow-2xs space-y-1.5 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <span>🧮 Math Breakdown:</span>
                          <span className="font-mono text-navy-900 font-extrabold">
                            {currentFx.symbol}{Number(currentItem.mrp || 0).toLocaleString()} × ৳{currentFx.rate}
                          </span>
                          <span>=</span>
                          <span className="font-mono text-brand-600 font-extrabold">
                            ৳{Number(currentItem.expectedPrice).toLocaleString()} BDT / unit
                          </span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                          30% Advance: ৳{Math.round(Number(currentItem.expectedPrice) * (currentItem.quantity || 1) * 0.30).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Total item subtotal: <strong className="text-navy-900">৳{(Number(currentItem.expectedPrice) * (currentItem.quantity || 1)).toLocaleString()} BDT</strong> ({currentItem.quantity || 1} {currentItem.quantity > 1 ? 'units' : 'unit'}). 70% remaining balance is settled upon delivery.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-100/80 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                      <Info className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>
                        Please enter the store price (Store MRP) from the product link. Our system converts it to Bangladeshi Taka (BDT) in real time.
                      </span>
                    </div>
                  )}

                  {/* Sourcing Cost & Delivery Notice Note */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-2">
                    <p className="leading-relaxed">
                      📌 <strong>Note:</strong> The Estimated Price is calculated from store MRP. International air shipping & handling from <strong>{country}</strong> and Bangladesh home delivery charge will be finalized and added to the invoice upon arrival in Bangladesh.
                    </p>
                    <a
                      href="https://wa.me/8801712345678?text=Hello%20WrikMart,%20I%20would%20like%20to%20know%20the%20exact%20shipping%20cost%20for%20pre-ordering%20from%20"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200/90 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>💬 Message us on WhatsApp / Chat to check exact shipping cost from {country}</span>
                    </a>
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
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
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
                      <div key={it.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm relative">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img 
                            src={it.image || it.fallbackImage || FALLBACK_PRODUCT_IMAGE} 
                            alt={it.name} 
                            className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0 bg-white" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = it.fallbackImage || FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div className="flex-1 sm:hidden min-w-0 pr-8">
                            <h4 className="font-bold text-xs text-navy-900 line-clamp-2">{it.name}</h4>
                            <span className="text-xs font-black text-brand-600 mt-0.5 block">
                              ৳{(it.expectedPrice * it.specs.unit).toLocaleString()} BDT
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="font-bold text-sm text-navy-900 truncate hidden sm:block">{it.name}</h4>
                          
                          {/* Stacked badges for Mobile & Desktop */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-600 mt-1">
                            {it.mrp ? (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                                Store MRP: <strong className="text-navy-900 font-bold">{currentFx.symbol}{Number(it.mrp).toLocaleString()}</strong>
                              </span>
                            ) : null}
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                              Size: <strong className="text-navy-900 font-bold">{it.specs.size || 'Standard'}</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                              Color: <strong className="text-navy-900 font-bold">{it.specs.color || 'Default'}</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-brand-50 border border-brand-200 text-brand-700 font-bold">
                              Qty: {it.specs.unit}
                            </span>
                          </div>

                          <span className="text-xs font-black text-brand-600 mt-1.5 hidden sm:block">
                            Total: ৳{(it.expectedPrice * it.specs.unit).toLocaleString()} BDT
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(it.id)}
                          className="absolute sm:static top-3 right-3 p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove product"
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
                    placeholder="e.g. Rahim Chowdhury"
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
                      placeholder="e.g. +880 1712-345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="e.g. customer@example.com"
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
                    placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
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

            {/* STEP 5: Payment Gateway - Official Certified EPS Gateway */}
            {step === 5 && (
              epsActiveSession ? (
                <div className="space-y-6 text-center animate-fade-in py-2">
                  {epsVerificationStatus === 'failed' ? (
                    <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                      <AlertCircle className="w-10 h-10 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 relative z-10">
                        <Loader2 className="w-10 h-10 animate-spin" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 max-w-md mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Lock className="w-3.5 h-3.5" />
                      Official EPS Gateway Checkout
                    </span>
                    <h3 className="text-2xl font-black text-navy-900">
                      {epsVerificationStatus === 'failed' ? 'Payment Not Completed' : 'Awaiting 30% Advance Payment'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {epsVerificationStatus === 'failed'
                        ? (epsErrorMessage || 'The payment was cancelled or failed in the EPS gateway.')
                        : 'A secure EPS payment window has opened. Complete your payment using bKash, Nagad, or Card.'}
                    </p>
                  </div>

                  {/* Transaction & Amount Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4 max-w-lg mx-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">30% Advance Amount</span>
                        <span className="font-mono font-black text-2xl text-emerald-600">৳{Number(epsActiveSession.totalAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          epsVerificationStatus === 'failed'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {epsVerificationStatus === 'failed' ? (
                            <>● Cancelled / Failed</>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Auto-Verifying...
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-slate-400 text-[11px]">Merchant Transaction ID:</span>
                        <span className="font-mono font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">{epsActiveSession.merchantTransactionId}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-slate-400 text-[11px]">Supported Channels:</span>
                        <span className="font-semibold text-slate-700">bKash, Nagad, Rocket, Visa, Mastercard</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <p className="text-[11px] leading-tight">
                        This window will <strong>automatically confirm your pre-order</strong> as soon as EPS confirms payment. You do not need to refresh.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 max-w-lg mx-auto pt-1">
                    <button
                      type="button"
                      disabled={isCheckingEps}
                      onClick={handleManualEpsVerify}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isCheckingEps ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking with EPS Gateway...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>I Have Completed Payment — Verify Now</span>
                        </>
                      )}
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={reopenPaymentWindow}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Re-open Payment Gateway Window</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (epsActiveSession?.popupWindow && !epsActiveSession.popupWindow.closed) {
                            try { epsActiveSession.popupWindow.close(); } catch (_) {}
                          }
                          setEpsActiveSession(null);
                          setEpsVerificationStatus('waiting');
                          setEpsErrorMessage('');
                        }}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Cancel & Return
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-navy-900">Official Payment Gateway</label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ⚡ Instant Auto-Verification
                      </span>
                    </div>

                    {/* Certified EPS Payment Gateway Hero Box */}
                    <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/90 to-white shadow-soft space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                            <img src="/eps/Group 93.png" alt="EPS Gateway" className="h-8 w-auto object-contain" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-emerald-950">EPS Payment Gateway</h4>
                              <span className="px-2 py-0.2 bg-emerald-600 text-white text-[8px] font-black rounded-full uppercase tracking-wider">
                                Official Gateway
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Single secure checkout engine for all Cards, MFS & Internet Banking
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 block">
                            🔒 Bank & MFS Protected
                          </span>
                        </div>
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

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-700">Bangladesh Bank Certified EPS Gateway (PSO)</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          SSL-256-BIT
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center gap-2.5">
                        <ExternalLink className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-[11px] text-slate-700 leading-snug">
                          Clicking <strong>"Pay 30% Advance via EPS Gateway"</strong> will open the secure EPS payment page. Complete payment and you'll be returned automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 30% Advance Guarantee Box */}
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <p className="leading-snug">
                      <strong>100% Secure Purchase Guarantee:</strong> You only pay <strong>30% advance (৳{advanceRequired.toLocaleString()})</strong> now. The remaining due is collected upon physical doorstep delivery.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleConfirmAndPay}
                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Connecting to Official EPS Gateway...</span>
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay 30% Advance ৳{advanceRequired.toLocaleString()} via EPS Gateway</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )
            )}

          </div>

          {/* Right Column: Sticky Desktop Order Summary Card (lg:col-span-4) */}
          <div className={`lg:col-span-4 sticky top-36 space-y-4 ${items.length === 0 && step <= 2 ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-navy-900 text-sm">Order Summary</h3>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {country} 🌐
                </span>
              </div>

              {/* Items Snapshot */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.length > 0 ? (
                  items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs text-slate-700">
                      <span className="truncate max-w-[160px] font-medium">{it.name} (x{it.specs.unit})</span>
                      <span className="font-bold text-slate-900">৳{(it.expectedPrice * it.specs.unit).toLocaleString()}</span>
                    </div>
                  ))
                ) : (currentItem.name || currentItem.expectedPrice) ? (
                  <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      <span className="truncate max-w-[150px] font-bold text-navy-900">{currentItem.name || 'Configuring Item'} (x{currentItem.quantity || 1})</span>
                    </div>
                    <span className="font-extrabold text-brand-600">৳{currentItemSubtotal.toLocaleString()}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-1">No products added yet.</p>
                )}
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
                <div className="flex justify-between bg-brand-50 p-3 rounded-xl text-brand-800 font-extrabold text-sm border border-brand-200 shadow-2xs">
                  <span>Advance Required (30% on Products):</span>
                  <span className="text-base text-brand-600 font-black">৳{advanceRequired.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Sourced from official {country} stores.</p>
                <p>• Courier & handling added upon BD arrival.</p>
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

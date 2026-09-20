import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Globe2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Lock, 
  CreditCard, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  HelpCircle,
  Clock,
  FileText
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from './PaymentLogos';
import { CountryFlag } from './CountryFlag';
import { useApp } from '../../context/AppContext';

const STORE_LINKS = {
  'Nike India Official': 'https://www.nike.com/in',
  'Apple Store Dubai Mall': 'https://www.apple.com/ae',
  'Zara & H&M Global': 'https://www.zara.com/in',
  'Amazon & Flipkart India': 'https://www.amazon.in',
  'CentralWorld Bangkok': 'https://www.central.co.th',
  'Noon UAE & Sephora': 'https://www.noon.com/uae-en'
};

const HELP_MODAL_DATA = {
  'How Pre-Order Works': {
    title: 'How WrikMart Pre-Order Works',
    icon: <ShoppingBag className="w-5 h-5 text-brand-600" />,
    content: (
      <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
        <p>WrikMart lets you purchase authentic branded items directly from official retail stores in India, Dubai, and Thailand.</p>
        <div className="space-y-2.5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Step 1: Paste Link & Specs</h5>
            <p>Paste the web link or product name from any official store (Amazon, Nike, Apple, Zara, Noon, Central). Select your desired color, size, and quantity.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Step 2: Pay 30% Advance Deposit</h5>
            <p>Confirm the pre-order with a 30% advance deposit via our authentic EPS Payment Gateway (bKash, Nagad, Cards, or Net Banking).</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Step 3: On-Ground Overseas Purchasing</h5>
            <p>Our dedicated verified agents in Delhi, Mumbai, Dubai, and Bangkok buy the genuine item from the store shelf and upload the official tax invoice receipt.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Step 4: Air Freight & Doorstep Delivery</h5>
            <p>Your item is dispatched via fast air cargo to Dhaka DAC, customs-cleared, and delivered straight to your home across all 64 districts in Bangladesh with Cash on Delivery for the remaining balance.</p>
          </div>
        </div>
      </div>
    )
  },
  'Advance Payment (30%) Rules': {
    title: '30% Advance Payment & Escrow Protection',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    content: (
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
          🛡️ <strong>100% Escrow Guarantee:</strong> Your 30% advance is held safely in escrow until our overseas agent inspects and purchases your product with original store receipts.
        </div>
        <p><strong>Why is a 30% advance required?</strong></p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Secures international currency exchange and retail reservation at official brand outlets.</li>
          <li>Prevents frivolous cancellations once our on-ground purchasing agent travels to the store.</li>
          <li>The remaining 70% balance is payable via Cash on Delivery or digital payment upon doorstep arrival in Bangladesh.</li>
          <li>If the store is out of stock, your 30% advance is instantly 100% refunded to your bKash/Nagad/Bank account with zero deduction.</li>
        </ul>
      </div>
    )
  },
  'Refund & Cancellation Terms': {
    title: 'Refund & Order Cancellation Policy',
    icon: <FileText className="w-5 h-5 text-brand-600" />,
    content: (
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <p>We believe in total transparency and fair policies for every Bangladeshi shopper.</p>
        <div className="space-y-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Cancellation Before Store Purchase</h5>
            <p>If you cancel before our overseas agent purchases the item, you receive an immediate 100% full refund of your 30% advance.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Store Out of Stock</h5>
            <p>If your specified size or color is unavailable in overseas stores, your order is marked as Unfulfillable and refunded in full within 2-4 hours.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="font-bold text-navy-900 text-xs mb-1">Damaged or Incorrect Item on Delivery</h5>
            <p>If the delivered product does not match your ordered specifications or arrives defective, we provide a 100% free return, replacement, or full refund within 48 hours.</p>
          </div>
        </div>
      </div>
    )
  },
  'Customs & Air Freight Timelines': {
    title: 'Air Freight Shipping & Delivery SLA',
    icon: <Truck className="w-5 h-5 text-cyan-600" />,
    content: (
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <p>All items are shipped via scheduled commercial air cargo directly to Dhaka Hazrat Shahjalal International Airport (DAC) with automated customs clearance.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="font-bold text-navy-900 block">🇮🇳 India</span>
            <span className="text-brand-600 font-extrabold text-xs block mt-0.5">5 to 7 Days</span>
            <span className="text-[10px] text-slate-400">Delhi & Mumbai Flights</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="font-bold text-navy-900 block">🇦🇪 Dubai</span>
            <span className="text-brand-600 font-extrabold text-xs block mt-0.5">4 to 6 Days</span>
            <span className="text-[10px] text-slate-400">Emirates Air Express</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="font-bold text-navy-900 block">🇹🇭 Thailand</span>
            <span className="text-brand-600 font-extrabold text-xs block mt-0.5">6 to 8 Days</span>
            <span className="text-[10px] text-slate-400">Bangkok Logistics Hub</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 pt-1">
          Ready Stock products located in our Dhaka Central Tejgaon warehouse are dispatched within 24 hours for Dhaka and 48 hours nationwide via Pathao / Steadfast courier.
        </p>
      </div>
    )
  },
  'Track Order Status': {
    title: 'Real-Time Order Tracking',
    icon: <Clock className="w-5 h-5 text-purple-600" />,
    content: (
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <p>You can track the live progress of your order at every milestone from our website.</p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <span className="font-bold text-navy-900 block">Tracking Milestones:</span>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>1. Advance Paid & Assigned to Purchasing Agent</li>
            <li>2. Purchased in Overseas Store (Receipt & Photo Attached)</li>
            <li>3. Shipped via Air Cargo & Customs In-Transit</li>
            <li>4. Received at Dhaka Central Sorting Hub</li>
            <li>5. Handed over to Local Courier for Doorstep Delivery</li>
          </ul>
        </div>
        <p>To view your live order updates, click <strong>"Track Orders"</strong> in the top navigation bar or mobile menu anytime.</p>
      </div>
    )
  },
  'Privacy Policy': {
    title: 'Privacy & Data Protection Policy',
    icon: <Lock className="w-5 h-5 text-emerald-600" />,
    content: (
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <p>Your privacy and confidential shopping information are strictly protected under international data protection and Bangladesh ICT guidelines.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>We only collect essential delivery information: recipient name, delivery address, phone number, and pre-order preferences.</li>
          <li>Payment credentials are processed exclusively via Bangladesh Bank licensed EPS Payment Gateway; WrikMart never stores debit/credit card numbers or MFS PINs.</li>
          <li>Your personal data is never sold, shared, or rented to third-party marketing companies.</li>
        </ul>
      </div>
    )
  },
  'Terms of Service': {
    title: 'Terms of Service & Cross-Border Agreement',
    icon: <FileText className="w-5 h-5 text-brand-600" />,
    content: (
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <p>By placing an order on WrikMart, you authorize our verified cross-border sourcing agents to act as your personal shopping representative in overseas brand retail stores.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>All products are 100% genuine retail items sourced directly from authorized overseas stores.</li>
          <li>Exchange rates are locked upon placing the 30% advance deposit.</li>
          <li>Prohibited contraband items under Bangladesh Customs rules cannot be imported.</li>
        </ul>
      </div>
    )
  }
};

export const Footer = () => {
  const { footerSettings, setCustomerTab } = useApp();
  const [activeModalKey, setActiveModalKey] = useState(null);

  const address = footerSettings?.address || 'House-08, Road-12, Sector-11, Mirpur, Dhaka-1216';
  const phone = footerSettings?.phone || '+880 1700-000000';
  const email = footerSettings?.email || 'support@wrikmart.com';
  const tagline = footerSettings?.tagline || 'Global Logistics & Sourcing';
  const aboutText = footerSettings?.aboutText || "Bangladesh's leading cross-border pre-order platform. We connect Bangladeshi consumers with on-ground purchasing agents in India, Dubai, and Thailand for authentic international products.";
  
  const popularStores = footerSettings?.popularStores || [
    'Nike India Official',
    'Apple Store Dubai Mall',
    'Zara & H&M Global',
    'Amazon & Flipkart India',
    'CentralWorld Bangkok',
    'Noon UAE & Sephora'
  ];

  const helpLinks = footerSettings?.helpLinks || [
    'How Pre-Order Works',
    'Advance Payment (30%) Rules',
    'Refund & Cancellation Terms',
    'Customs & Air Freight Timelines',
    'Track Order Status'
  ];

  const sourcingHubs = footerSettings?.sourcingHubs || [
    { country: 'India', label: 'India (Delhi / Mumbai)' },
    { country: 'Dubai', label: 'Dubai (Al Quoz)' },
    { country: 'Thailand', label: 'Thailand (Bangkok)' }
  ];

  const trustBadges = footerSettings?.trustBadges || [
    { title: '100% Genuine Receipts', desc: 'Purchased from official overseas brand stores with tax invoices.' },
    { title: '30% Advance Protection', desc: 'Held in escrow until order purchased. 100% refund guarantee.' },
    { title: 'Express Air Freight', desc: 'Regular flights from Delhi, Dubai, and Bangkok to Dhaka DAC.' },
    { title: '24/7 Agent Support', desc: 'WhatsApp hotline and live portal chat for order updates.' }
  ];

  const trustIcons = [
    <ShieldCheck className="w-5 h-5" key="shield" />,
    <Lock className="w-5 h-5" key="lock" />,
    <Truck className="w-5 h-5" key="truck" />,
    <PhoneCall className="w-5 h-5" key="phone" />
  ];
  const trustColors = [
    'bg-brand-500/10 border-brand-500/30 text-brand-400',
    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    'bg-purple-500/10 border-purple-500/30 text-purple-400'
  ];

  const handleHelpClick = (helpTitle) => {
    if (helpTitle === 'Track Order Status' && setCustomerTab) {
      setCustomerTab('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveModalKey(helpTitle);
  };

  const activeModalData = activeModalKey ? HELP_MODAL_DATA[activeModalKey] : null;

  return (
    <footer className="bg-[#08132B] text-slate-400 border-t border-slate-800 text-xs select-none">
      
      {/* 1. Top Trust & Value Proposition Strip */}
      <div className="border-b border-slate-800/80 bg-[#060F23] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${trustColors[idx % trustColors.length]}`}>
                {trustIcons[idx % trustIcons.length]}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{badge.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main 4-Column Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand & Overview (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-white p-1 rounded-xl shadow-teal-glow flex items-center justify-center border border-white/20 flex-shrink-0">
                <img 
                  src="/wrikmart-logo.jpeg" 
                  alt="WrikMart Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-sans leading-none">
                    Wrik<span className="text-brand-400">Mart</span>
                  </span>
                  <span className="text-[9px] uppercase font-black tracking-wider bg-brand-500 text-white px-1.5 py-0.5 rounded">
                    PRE-ORDER
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 block">
                  {tagline}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {aboutText}
            </p>

            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Verified Sourcing Hubs</span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {sourcingHubs.map((hub, idx) => (
                  <span key={idx} className="px-2.5 py-1.5 rounded-xl bg-[#0D1B3D] border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 shadow-xs">
                    <CountryFlag country={hub.country} className="w-5 h-3.5 rounded-[2px]" />
                    <span>{hub.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Global Stores & Sourcing (With direct target="_blank" links) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400">Popular Stores</h4>
            <ul className="space-y-2 text-xs">
              {popularStores.map((store, idx) => {
                const targetUrl = typeof store === 'object' && store.url 
                  ? store.url 
                  : (STORE_LINKS[store] || `https://www.google.com/search?q=${encodeURIComponent((typeof store === 'object' ? store.name : store) + ' official store')}`);
                const storeLabel = typeof store === 'object' ? store.name : store;

                return (
                  <li key={idx}>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer"
                      title={`Open official ${storeLabel} website in a new tab`}
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{storeLabel}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policy (With interactive modal popups) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400">Pre-Order Help</h4>
            <ul className="space-y-2 text-xs">
              {helpLinks.map((help, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handleHelpClick(help)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{help}</span>
                    <HelpCircle className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Bangladesh HQ */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400">Bangladesh HQ</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-white">{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Official EPS PGW Payment Banner */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Official Payment Gateway Partner
            </span>
          </div>
          <div className="w-full max-w-4xl p-2 rounded-2xl bg-[#08132B]/60 border border-slate-800/80 shadow-md">
            <img 
              src="/eps/Group 106.png" 
              alt="EPS Payment System - Visa, Mastercard, bKash, Nagad, Rocket, Nexus" 
              className="w-full h-auto object-contain rounded-xl opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright & System Status Bar */}
      <div className="bg-[#050C1D] py-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <p>© 2026 {footerSettings?.companyName || 'WrikMart'} Global Logistics & Pre-Order Commerce Ltd. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <p className="flex items-center gap-1.5 text-slate-400">
              <span>Powered by</span>
              <a 
                href={footerSettings?.poweredByLink || "https://inovasitech.net"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors cursor-pointer inline-flex items-center"
              >
                {footerSettings?.poweredByText || "Inovasi Tech Pvt. Ltd."}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => setActiveModalKey('Privacy Policy')} 
              className="hover:text-slate-300 cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => setActiveModalKey('Terms of Service')} 
              className="hover:text-slate-300 cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Help & Policy Modal (via createPortal) */}
      {activeModalData && createPortal(
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalKey(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-auto max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  {activeModalData.icon || <HelpCircle className="w-5 h-5" />}
                </div>
                <h3 className="font-extrabold text-base text-navy-900 leading-snug">
                  {activeModalData.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalKey(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-1">
              {activeModalData.content}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm"
              >
                Got It, Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </footer>
  );
};


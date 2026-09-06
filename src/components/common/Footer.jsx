import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { BKashLogo, NagadLogo, VisaLogo, MastercardLogo } from './PaymentLogos';
import { CountryFlag } from './CountryFlag';

export const Footer = () => {
  return (
    <footer className="bg-[#08132B] text-slate-400 border-t border-slate-800 text-xs select-none">
      
      {/* 1. Top Trust & Value Proposition Strip */}
      <div className="border-b border-slate-800/80 bg-[#060F23] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">100% Genuine Receipts</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Purchased from official overseas brand stores with tax invoices.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">25% Advance Protection</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Held in escrow until order purchased. 100% refund guarantee.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Express Air Freight</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Regular flights from Delhi, Dubai, and Bangkok to Dhaka DAC.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">24/7 Agent Support</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">WhatsApp hotline and live portal chat for order updates.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main 4-Column Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand & Overview (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-teal-glow">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Wrik<span className="text-brand-400">Mart</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Bangladesh's leading cross-border pre-order platform. We connect Bangladeshi consumers with on-ground purchasing agents in India, Dubai, and Thailand for authentic international products.
            </p>

            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Verified Sourcing Hubs</span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1.5 rounded-xl bg-[#0D1B3D] border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 shadow-xs">
                  <CountryFlag country="India" className="w-5 h-3.5 rounded-[2px]" />
                  <span>India (Delhi / Mumbai)</span>
                </span>
                <span className="px-2.5 py-1.5 rounded-xl bg-[#0D1B3D] border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 shadow-xs">
                  <CountryFlag country="Dubai" className="w-5 h-3.5 rounded-[2px]" />
                  <span>Dubai (Al Quoz)</span>
                </span>
                <span className="px-2.5 py-1.5 rounded-xl bg-[#0D1B3D] border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 shadow-xs">
                  <CountryFlag country="Thailand" className="w-5 h-3.5 rounded-[2px]" />
                  <span>Thailand (Bangkok)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Global Stores & Sourcing */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400">Popular Stores</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Nike India Official</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Apple Store Dubai Mall</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Zara & H&M Global</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Amazon & Flipkart India</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">CentralWorld Bangkok</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Noon UAE & Sephora</span></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policy */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400">Pre-Order Help</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">How Pre-Order Works</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Advance Payment (25%) Rules</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Refund & Cancellation Terms</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Customs & Air Freight Timelines</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Track Order Status</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Bangladesh HQ */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-400">Bangladesh HQ</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>House-08, Road-12, Sector-11, Mirpur, Dhaka-1216</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-white">+880 1700-000000</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>support@wrikmart.com</span>
              </div>
            </div>

            {/* Payment Method Badges with Official Logos */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Supported Payment Gateways</span>
              <div className="flex flex-wrap items-center gap-2">
                
                {/* bKash Badge with Origami Bird Logo */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E2136E]/10 border border-[#E2136E]/40 hover:bg-[#E2136E]/20 transition-colors shadow-sm">
                  <BKashLogo className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#FF4081]">bKash</span>
                </div>

                {/* Nagad Badge with Swirl Ribbon Logo */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7941D]/10 border border-[#F7941D]/40 hover:bg-[#F7941D]/20 transition-colors shadow-sm">
                  <NagadLogo className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#FF9800]">Nagad</span>
                </div>

                {/* Visa & Mastercard Badges */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-colors shadow-sm">
                  <VisaLogo className="w-6 h-3 flex-shrink-0" />
                  <span className="text-slate-600">/</span>
                  <MastercardLogo className="w-5 h-3 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Cards</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright & System Status Bar */}
      <div className="bg-[#050C1D] py-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 WrikMart Global Logistics & Pre-Order Commerce Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">v2.6 Enterprise</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

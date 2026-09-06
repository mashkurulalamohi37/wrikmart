import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Cake, Gift, Sparkles, X, CheckCircle2, ArrowRight, Tag } from 'lucide-react';

export const CustomerBirthdayModal = () => {
  const { 
    customerProfile, 
    getBirthdayStatus, 
    generateBirthdayCoupon, 
    setAppliedCoupon, 
    birthdaySettings, 
    showToast 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (!customerProfile?.dateOfBirth) return;
    const bday = getBirthdayStatus(customerProfile.dateOfBirth);
    
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem(`wrikmart_bday_modal_${new Date().getFullYear()}`);
    
    if (bday.isToday && !isDismissed) {
      // Auto open modal on birthday!
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [customerProfile, getBirthdayStatus]);

  if (!isOpen || !customerProfile?.dateOfBirth) return null;

  const bday = getBirthdayStatus(customerProfile.dateOfBirth);
  if (!bday.isToday) return null;

  const cleanFirstName = (customerProfile.name || 'VIP').split(' ')[0];
  const discountVal = birthdaySettings.discountValue || 20;
  const discountText = birthdaySettings.discountType === 'percentage' ? `${discountVal}% OFF` : `৳${discountVal} OFF`;
  const code = `BDAY-${cleanFirstName.toUpperCase()}-${new Date().getFullYear()}`;

  const handleClaim = () => {
    const coupon = generateBirthdayCoupon(customerProfile);
    if (coupon) {
      setAppliedCoupon({
        ...coupon,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountBDT: coupon.maxDiscountBDT,
        minOrderBDT: coupon.minOrderBDT
      });
      setHasClaimed(true);
      showToast(`🎉 Happy Birthday! Coupon ${coupon.code} applied to your cart!`, 'success');
      setTimeout(() => {
        handleDismiss();
      }, 1800);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(`wrikmart_bday_modal_${new Date().getFullYear()}`, 'dismissed');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border-2 border-rose-200 shadow-2xl overflow-hidden relative text-center">
        
        {/* Festive Header Banner */}
        <div className="bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-8 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Floating Cake Icon */}
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 mx-auto flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
            <Cake className="w-10 h-10 text-white" />
          </div>

          <div className="mt-4 space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Special Celebration Milestone
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              Happy Birthday, {cleanFirstName}! 🎂
            </h2>
            <p className="text-xs text-rose-100 font-medium">
              Turning {bday.turningAge} today! Wishing you a blessed and joyful year ahead.
            </p>
          </div>
        </div>

        {/* Voucher Offer Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            To celebrate your special day, the <strong>WrikMart Family</strong> has gifted you an exclusive birthday shopping voucher!
          </p>

          {/* Coupon Display Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
              Exclusive Birthday Privilege
            </span>
            <div className="flex items-center justify-center gap-2">
              <Tag className="w-4 h-4 text-rose-600" />
              <span className="text-xl font-black font-mono tracking-wider text-navy-950">
                {code}
              </span>
            </div>
            <p className="text-xs font-bold text-rose-800">
              Get {discountText} on any order (Valid for 7 days)
            </p>
          </div>

          {/* Action Button */}
          {hasClaimed ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Coupon Auto-Applied to Your Cart!</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Claim & Apply {discountText} Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};

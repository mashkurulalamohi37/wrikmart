import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cake, 
  Gift, 
  Calendar, 
  Search, 
  Users, 
  Send, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Sparkles, 
  AlertCircle, 
  Sliders, 
  Phone, 
  Mail, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Save, 
  X, 
  ShoppingBag,
  Percent,
  DollarSign,
  HeartHandshake
} from 'lucide-react';

export const AdminCustomerManagement = () => {
  const { 
    customers = [], 
    getBirthdayStatus, 
    sendBirthdayWish, 
    updateCustomerDOB, 
    birthdaySettings, 
    setBirthdaySettings, 
    coupons = [], 
    showToast 
  } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'missing'
  
  // Modals state
  const [wishModalCustomer, setWishModalCustomer] = useState(null);
  const [wishDiscountValue, setWishDiscountValue] = useState(birthdaySettings.discountValue || 20);
  const [wishDiscountType, setWishDiscountType] = useState(birthdaySettings.discountType || 'percentage');
  const [wishCustomNote, setWishCustomNote] = useState('');

  const [editCustomerModal, setEditCustomerModal] = useState(null);
  const [editDobInput, setEditDobInput] = useState('');

  // Settings edit state
  const [showSettingsCard, setShowSettingsCard] = useState(false);
  const [tempSettings, setTempSettings] = useState(birthdaySettings);

  // Compute enriched customer data with birthday metrics
  const enrichedCustomers = useMemo(() => {
    return customers.map(c => {
      const bday = getBirthdayStatus(c.dateOfBirth);
      const currentYear = new Date().getFullYear();
      const wishes = c.birthdayWishes || [];
      const currentYearWish = wishes.find(w => w.year === currentYear);

      return {
        ...c,
        bday,
        isWishedThisYear: !!currentYearWish,
        currentYearWish
      };
    });
  }, [customers, getBirthdayStatus]);

  // Metric counts
  const todayBirthdays = useMemo(() => enrichedCustomers.filter(c => c.bday.isToday), [enrichedCustomers]);
  const upcomingBirthdays = useMemo(() => enrichedCustomers.filter(c => c.bday.isUpcoming), [enrichedCustomers]);
  const missingDobCount = useMemo(() => enrichedCustomers.filter(c => !c.bday.hasDOB).length, [enrichedCustomers]);
  const birthdayCoupons = useMemo(() => coupons.filter(c => c.isBirthdaySpecial), [coupons]);

  // Filtered customers for table
  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter(c => {
      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'today') return c.bday.isToday;
      if (activeFilter === 'upcoming') return c.bday.isUpcoming;
      if (activeFilter === 'missing') return !c.bday.hasDOB;
      return true;
    });
  }, [enrichedCustomers, searchQuery, activeFilter]);

  // Open Wish Modal
  const handleOpenWishModal = (customer) => {
    setWishModalCustomer(customer);
    setWishDiscountValue(birthdaySettings.discountValue || 20);
    setWishDiscountType(birthdaySettings.discountType || 'percentage');
    setWishCustomNote('');
  };

  // Dispatch Wish
  const handleDispatchWish = () => {
    if (!wishModalCustomer) return;
    const result = sendBirthdayWish(wishModalCustomer.id, {
      discountValue: Number(wishDiscountValue),
      discountType: wishDiscountType,
      customNote: wishCustomNote
    });

    if (result?.whatsappUrl) {
      window.open(result.whatsappUrl, '_blank');
    }
    setWishModalCustomer(null);
  };

  // Copy Wish Message
  const handleCopyWishMessage = () => {
    if (!wishModalCustomer) return;
    const cleanFirstName = (wishModalCustomer.name || 'VIP').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const discountText = wishDiscountType === 'percentage' ? `${wishDiscountValue}%` : `৳${wishDiscountValue}`;
    const code = `BDAY-${cleanFirstName}-${new Date().getFullYear()}`;

    const template = birthdaySettings.wishTemplate || "Happy Birthday {name}! 🎂 Team WrikMart wishes you a joyful day! We've gifted you an exclusive {discount} birthday discount voucher: {code}. Shop authentic global products: https://wrikmart.com";
    const message = template
      .replace('{name}', wishModalCustomer.name)
      .replace('{discount}', discountText)
      .replace('{code}', code);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(message)
        .then(() => showToast('Birthday wish message & coupon code copied to clipboard!', 'success'))
        .catch(() => showToast('Could not access clipboard automatically. Please copy manually.', 'warning'));
    } else {
      showToast('Clipboard API not supported on this browser.', 'warning');
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    setBirthdaySettings(tempSettings);
    setShowSettingsCard(false);
    showToast('Birthday Club reward settings saved successfully!', 'success');
  };

  // Save Customer DOB
  const handleSaveCustomerDOB = () => {
    if (!editCustomerModal) return;
    updateCustomerDOB(editCustomerModal.id, editDobInput);
    setEditCustomerModal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header & Quick Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Cake className="w-3 h-3 text-rose-500" />
              Customer Birthday Club & CRM
            </span>
            {todayBirthdays.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1">
                🎉 {todayBirthdays.length} Birthday{todayBirthdays.length > 1 ? 's' : ''} Today!
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Customer Birthday & Reward Management
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Record customer birth dates, automatically celebrate milestones with personalized greetings, and issue exclusive birthday promotional vouchers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => {
              setTempSettings(birthdaySettings);
              setShowSettingsCard(!showSettingsCard);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-2xs ${
              showSettingsCard 
                ? 'bg-brand-500 text-white border-brand-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Reward Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (KPI Ribbon) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Total Customers</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900 mt-1">{customers.length}</p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {missingDobCount > 0 ? `${missingDobCount} without DOB` : '100% DOB captured'}
          </span>
        </div>

        {/* Birthdays Today */}
        <div className={`p-4 rounded-2xl border shadow-soft transition-all ${
          todayBirthdays.length > 0 
            ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 ring-2 ring-rose-300/40' 
            : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase ${todayBirthdays.length > 0 ? 'text-rose-800' : 'text-slate-400'}`}>
              Birthdays Today
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              todayBirthdays.length > 0 ? 'bg-rose-500 text-white animate-bounce' : 'bg-slate-100 text-slate-500'
            }`}>
              <Cake className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-1 ${todayBirthdays.length > 0 ? 'text-rose-700' : 'text-navy-900'}`}>
            {todayBirthdays.length}
          </p>
          <span className={`text-[11px] font-bold block mt-0.5 ${todayBirthdays.length > 0 ? 'text-rose-800' : 'text-slate-400'}`}>
            {todayBirthdays.length > 0 ? 'Ready for wishing & discount!' : 'No birthdays today'}
          </span>
        </div>

        {/* Upcoming Birthdays (Next 30 Days) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Upcoming (Next 30d)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{upcomingBirthdays.length}</p>
          <span className="text-[11px] text-amber-800 font-bold block mt-0.5">
            {upcomingBirthdays.filter(c => c.bday.daysLeft <= 7).length} in next 7 days
          </span>
        </div>

        {/* Birthday Vouchers Issued */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Birthday Vouchers</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gift className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{birthdayCoupons.length}</p>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            Default {birthdaySettings.discountValue}% OFF
          </span>
        </div>
      </div>

      {/* 3. Settings Card (Collapsible) */}
      {showSettingsCard && (
        <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-card space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <h3 className="font-extrabold text-sm text-navy-900">
                Birthday Club Discount & Automated Wishing Policy
              </h3>
            </div>
            <button 
              onClick={() => setShowSettingsCard(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Discount Type */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">Discount Type</label>
              <select
                value={tempSettings.discountType}
                onChange={(e) => setTempSettings({ ...tempSettings, discountType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Flat Amount Off (৳ BDT)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                {tempSettings.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Flat Discount (৳ BDT)'}
              </label>
              <input
                type="number"
                value={tempSettings.discountValue}
                onChange={(e) => setTempSettings({ ...tempSettings, discountValue: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-brand-600 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Max Discount (for %) */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">Max Discount Cap (৳ BDT)</label>
              <input
                type="number"
                value={tempSettings.maxDiscountBDT}
                onChange={(e) => setTempSettings({ ...tempSettings, maxDiscountBDT: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Validity Days */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">Voucher Validity (Days)</label>
              <input
                type="number"
                value={tempSettings.validityDays}
                onChange={(e) => setTempSettings({ ...tempSettings, validityDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Template Text */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 text-xs">
              WhatsApp & SMS Wishing Template <span className="text-slate-400 font-normal">(Variables: {'{name}'}, {'{discount}'}, {'{code}'})</span>
            </label>
            <textarea
              rows="2"
              value={tempSettings.wishTemplate}
              onChange={(e) => setTempSettings({ ...tempSettings, wishTemplate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowSettingsCard(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Reward Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Priority Queue: Today's Birthday Celebrations */}
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-5 sm:p-6 rounded-3xl border-2 border-rose-200 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-rose-950 flex items-center gap-2">
                  Action Required: Celebrate Today's Birthdays!
                </h3>
                <p className="text-xs text-rose-800">
                  {todayBirthdays.length} valued client{todayBirthdays.length > 1 ? 's are' : ' is'} celebrating their birthday today. Send a warm wish & grant their voucher.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full border border-rose-200 self-start sm:self-auto">
              Today • 6 September 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {todayBirthdays.map((c) => (
              <div 
                key={c.id} 
                className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-sm space-y-3 relative overflow-hidden"
              >
                {/* Festive top strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 absolute top-0 left-0"></div>

                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center text-sm shadow-2xs">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-navy-900">{c.name}</h4>
                      <p className="text-[11px] text-slate-500">{c.phone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Turning {c.bday.turningAge} yrs
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lifetime Spend:</span>
                    <span className="font-black text-navy-900">৳{(c.totalSpent || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Orders:</span>
                    <span className="font-bold text-slate-700">{c.totalOrders || 0} orders</span>
                  </div>
                </div>

                {/* Wish Action Button */}
                {c.isWishedThisYear ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Wished! ({c.currentYearWish?.couponCode})
                    </span>
                    <button
                      onClick={() => handleOpenWishModal(c)}
                      className="text-[10px] font-bold text-slate-500 hover:text-brand-600 underline"
                    >
                      Resend
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenWishModal(c)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Wish & Send {birthdaySettings.discountValue}% Promo</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Main Customer Directory with Birthday Filtering */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden space-y-3">
        
        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-navy-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Clients ({enrichedCustomers.length})
            </button>
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                activeFilter === 'today'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Cake className="w-3 h-3" />
              <span>Today ({todayBirthdays.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                activeFilter === 'upcoming'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Next 30 Days ({upcomingBirthdays.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('missing')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'missing'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              DOB Missing ({missingDobCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="overflow-x-auto no-scrollbar sm:scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Client Name & Contacts</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Date of Birth</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Birthday Status</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Orders & Spend</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Birthday Voucher</th>
                <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No customers found matching the selected filter or search term.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Contacts */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-xs">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-extrabold text-navy-900">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.phone} • {c.district || 'Dhaka'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date of Birth */}
                    <td className="py-3.5 px-4 font-medium">
                      {c.bday.hasDOB ? (
                        <div>
                          <p className="font-bold text-slate-800">{c.bday.formattedDOB}</p>
                          <span className="text-[10px] text-slate-400">Age: {c.bday.turningAge} yrs</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditCustomerModal(c);
                            setEditDobInput('');
                          }}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Set DOB</span>
                        </button>
                      )}
                    </td>

                    {/* Birthday Status Badge */}
                    <td className="py-3.5 px-4">
                      {c.bday.isToday ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-300 animate-pulse inline-flex items-center gap-1">
                          <Cake className="w-3 h-3" />
                          <span>Birthday Today!</span>
                        </span>
                      ) : c.bday.isUpcoming ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{c.bday.nextOccurrenceLabel}</span>
                        </span>
                      ) : c.bday.hasDOB ? (
                        <span className="text-slate-500 font-medium text-xs">
                          {c.bday.nextOccurrenceLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Not Captured
                        </span>
                      )}
                    </td>

                    {/* Orders & Spend */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-brand-700">৳{(c.totalSpent || 0).toLocaleString()}</p>
                      <span className="text-[10px] text-slate-400">{c.totalOrders || 0} order(s) placed</span>
                    </td>

                    {/* Birthday Voucher Status */}
                    <td className="py-3.5 px-4">
                      {c.isWishedThisYear ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200 inline-block">
                            {c.currentYearWish.couponCode}
                          </span>
                          <p className="text-[9px] text-emerald-600 font-semibold">
                            {c.currentYearWish.discount} OFF Issued
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No voucher issued yet</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenWishModal(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1"
                          title="Wish & Send Birthday Voucher"
                        >
                          <Gift className="w-3 h-3" />
                          <span>Wish & Promo</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditCustomerModal(c);
                            setEditDobInput(c.dateOfBirth || '');
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Edit Customer Profile & Birthday"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. MODAL: WISH & SEND BIRTHDAY PROMO */}
      {/* ========================================================= */}
      {wishModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-navy-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-navy-900">
                    Send Birthday Wish & Promo Code
                  </h3>
                  <p className="text-xs text-slate-500">
                    For client <strong>{wishModalCustomer.name}</strong> ({wishModalCustomer.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWishModalCustomer(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voucher Settings for This Wish */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-3">
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">
                1. Configure Exclusive Birthday Discount
              </span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Discount Type</label>
                  <select
                    value={wishDiscountType}
                    onChange={(e) => setWishDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat (৳ BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    {wishDiscountType === 'percentage' ? 'Discount %' : 'Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    value={wishDiscountValue}
                    onChange={(e) => setWishDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-black text-rose-600"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Code to be generated:</span>
                <span className="font-mono font-black text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  BDAY-{(wishModalCustomer.name || 'VIP').split(' ')[0].toUpperCase()}-{new Date().getFullYear()}
                </span>
              </div>
            </div>

            {/* Greeting Message Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  WhatsApp & SMS Greeting Message Preview
                </span>
                <button
                  type="button"
                  onClick={handleCopyWishMessage}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Message</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans select-all">
                Happy Birthday {wishModalCustomer.name}! 🎂 Team WrikMart wishes you a joyful day! We've gifted you an exclusive {wishDiscountType === 'percentage' ? `${wishDiscountValue}%` : `৳${wishDiscountValue}`} birthday discount voucher: <strong>BDAY-{(wishModalCustomer.name || 'VIP').split(' ')[0].toUpperCase()}-{new Date().getFullYear()}</strong>. Valid for 7 days. Shop authentic global products: https://wrikmart.com
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleCopyWishMessage}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message & Voucher</span>
              </button>

              <button
                onClick={handleDispatchWish}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: EDIT CUSTOMER DOB & PROFILE */}
      {/* ========================================================= */}
      {editCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-navy-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <h3 className="font-extrabold text-sm text-navy-900">
                  Update Customer Birthday Date
                </h3>
              </div>
              <button 
                onClick={() => setEditCustomerModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-0.5">Client Name</label>
                <p className="font-extrabold text-sm text-navy-900">{editCustomerModal.name}</p>
                <p className="text-slate-400">{editCustomerModal.phone}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Date of Birth (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  value={editDobInput}
                  onChange={(e) => setEditDobInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Once set, WrikMart will automatically track upcoming birthdays and allow sending exclusive celebration promos.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditCustomerModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs w-full sm:w-auto text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomerDOB}
                disabled={!editDobInput}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Birthday</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

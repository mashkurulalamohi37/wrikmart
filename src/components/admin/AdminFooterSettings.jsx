import React, { useState } from 'react';
import { useApp, DEFAULT_FOOTER_SETTINGS } from '../../context/AppContext';
import { 
  Building2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Store, 
  HelpCircle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Globe2, 
  Sparkles,
  Edit3,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminFooterSettings = () => {
  const { footerSettings, updateFooterSettings, resetFooterSettings, showToast } = useApp();

  const [formData, setFormData] = useState(() => ({
    companyName: footerSettings?.companyName || 'WrikMart',
    tagline: footerSettings?.tagline || 'Global Logistics & Sourcing',
    aboutText: footerSettings?.aboutText || "Bangladesh's leading cross-border pre-order platform. We connect Bangladeshi consumers with on-ground purchasing agents in India, Dubai, and Thailand for authentic international products.",
    address: footerSettings?.address || 'House-08, Road-12, Sector-11, Mirpur, Dhaka-1216',
    phone: footerSettings?.phone || '+880 1700-000000',
    email: footerSettings?.email || 'support@wrikmart.com',
    whatsapp: footerSettings?.whatsapp || '+880 1700-000000',
    popularStores: footerSettings?.popularStores || [
      'Nike India Official',
      'Apple Store Dubai Mall',
      'Zara & H&M Global',
      'Amazon & Flipkart India',
      'CentralWorld Bangkok',
      'Noon UAE & Sephora'
    ],
    helpLinks: footerSettings?.helpLinks || [
      'How Pre-Order Works',
      'Advance Payment (30%) Rules',
      'Refund & Cancellation Terms',
      'Customs & Air Freight Timelines',
      'Track Order Status'
    ],
    sourcingHubs: footerSettings?.sourcingHubs || [
      { country: 'India', label: 'India (Delhi / Mumbai)' },
      { country: 'Dubai', label: 'Dubai (Al Quoz)' },
      { country: 'Thailand', label: 'Thailand (Bangkok)' }
    ],
    trustBadges: footerSettings?.trustBadges || [
      { title: '100% Genuine Receipts', desc: 'Purchased from official overseas brand stores with tax invoices.' },
      { title: '30% Advance Protection', desc: 'Held in escrow until order purchased. 100% refund guarantee.' },
      { title: 'Express Air Freight', desc: 'Regular flights from Delhi, Dubai, and Bangkok to Dhaka DAC.' },
      { title: '24/7 Agent Support', desc: 'WhatsApp hotline and live portal chat for order updates.' }
    ],
    poweredByText: footerSettings?.poweredByText || 'Inovasi Tech Pvt. Ltd.',
    poweredByLink: footerSettings?.poweredByLink || 'https://inovasitech.net'
  }));

  const [newStore, setNewStore] = useState('');
  const [newHelpLink, setNewHelpLink] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    updateFooterSettings(formData);
  };

  const handleAddStore = () => {
    if (!newStore.trim()) return;
    setFormData(prev => ({
      ...prev,
      popularStores: [...prev.popularStores, newStore.trim()]
    }));
    setNewStore('');
  };

  const handleRemoveStore = (index) => {
    setFormData(prev => ({
      ...prev,
      popularStores: prev.popularStores.filter((_, i) => i !== index)
    }));
  };

  const handleAddHelpLink = () => {
    if (!newHelpLink.trim()) return;
    setFormData(prev => ({
      ...prev,
      helpLinks: [...prev.helpLinks, newHelpLink.trim()]
    }));
    setNewHelpLink('');
  };

  const handleRemoveHelpLink = (index) => {
    setFormData(prev => ({
      ...prev,
      helpLinks: prev.helpLinks.filter((_, i) => i !== index)
    }));
  };

  const handleTrustBadgeChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.trustBadges];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, trustBadges: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Footer & Storefront CMS Editor</h2>
          <p className="text-xs text-slate-500">
            Edit live footer contacts, Bangladesh HQ address, popular stores, help links & trust guarantees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all footer settings to default?')) {
                resetFooterSettings();
                setFormData(DEFAULT_FOOTER_SETTINGS);
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Footer Changes</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* 1. Bangladesh HQ & Direct Contact Info */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-navy-900 text-sm">Bangladesh HQ & Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>HQ Physical Address (Mirpur / Dhaka)</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House-08, Road-12, Sector-11, Mirpur, Dhaka-1216"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Primary Hotline Phone Number</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1700-000000"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-600" />
                <span>Official Support Email</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="support@wrikmart.com"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Brand Overview & Mission Text */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe2 className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-navy-900 text-sm">Brand Overview & Footer Tagline</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Subtitle / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Global Logistics & Sourcing"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Footer About Description</label>
              <textarea
                rows={3}
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                placeholder="Bangladesh's leading cross-border pre-order platform..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Powered By Brand / Company</label>
              <input
                type="text"
                value={formData.poweredByText}
                onChange={(e) => setFormData({ ...formData, poweredByText: e.target.value })}
                placeholder="Inovasi Tech Pvt. Ltd."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Powered By Website URL</label>
              <input
                type="url"
                value={formData.poweredByLink}
                onChange={(e) => setFormData({ ...formData, poweredByLink: e.target.value })}
                placeholder="https://inovasitech.net"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Popular Stores & Help Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Popular Stores */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Store className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-navy-900 text-sm">Popular Stores Column</h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStore(); } }}
                placeholder="e.g. Sephora Dubai Mall"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddStore}
                className="px-3 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold rounded-xl flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {formData.popularStores.map((st, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 group">
                  <span className="font-medium text-slate-800 truncate">{st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStore(i)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Order Help Links */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <HelpCircle className="w-4 h-4 text-cyan-500" />
              <h3 className="font-bold text-navy-900 text-sm">Pre-Order Help Topics</h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newHelpLink}
                onChange={(e) => setNewHelpLink(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHelpLink(); } }}
                placeholder="e.g. Customs Clearance FAQs"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddHelpLink}
                className="px-3 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold rounded-xl flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {formData.helpLinks.map((hl, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 group">
                  <span className="font-medium text-slate-800 truncate">{hl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHelpLink(i)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. Trust Badges & Guarantee Pillars */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-navy-900 text-sm">Trust Badges & 4-Pillar Guarantees (Top Footer Strip)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.trustBadges.map((badge, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 block">
                  Pillar #{idx + 1}
                </span>
                <input
                  type="text"
                  value={badge.title}
                  onChange={(e) => handleTrustBadgeChange(idx, 'title', e.target.value)}
                  placeholder="Badge Title"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-navy-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={badge.desc}
                  onChange={(e) => handleTrustBadgeChange(idx, 'desc', e.target.value)}
                  placeholder="Badge description text..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Footer Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save All Footer & Contact Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};

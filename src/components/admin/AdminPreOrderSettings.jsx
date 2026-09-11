import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Copy, 
  Check, 
  Link, 
  Globe, 
  CheckSquare, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Store, 
  Layers, 
  X, 
  AlertTriangle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';
import { StoreBrandBadge } from '../common/BrandLogo';

const BRAND_PRESETS = [
  { id: 'nike', label: 'Nike' },
  { id: 'apple', label: 'Apple' },
  { id: 'zara', label: 'Zara' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'noon', label: 'Noon' },
  { id: 'shopee', label: 'Shopee' },
  { id: 'flipkart', label: 'Flipkart' },
  { id: 'sephora', label: 'Sephora' },
  { id: 'myntra', label: 'Myntra' },
  { id: 'central', label: 'Central Department Store' },
  { id: 'lazada', label: 'Lazada' },
  { id: 'custom', label: 'Custom Brand / Initials' }
];

const COUNTRY_OPTIONS = [
  'India',
  'Dubai',
  'Thailand',
  'Global',
  'USA',
  'UK',
  'China',
  'Japan',
  'Other'
];

export const AdminPreOrderSettings = () => {
  const { 
    showToast, 
    preOrderFormSettings, 
    setPreOrderFormSettings,
    sourcingStores = [],
    addSourcingStore,
    updateSourcingStore,
    deleteSourcingStore,
    toggleSourcingStoreStatus,
    resetSourcingStores
  } = useApp();

  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'form_settings'
  const [copied, setCopied] = useState(false);

  // Search & Filter for Sourcing Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deletingStore, setDeletingStore] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    cat: '',
    url: '',
    brand: 'custom',
    logoUrl: '',
    isActive: true
  });

  // Pre-Order Form Settings State
  const [countries, setCountries] = useState(() => preOrderFormSettings?.countries || {
    india: true,
    dubai: true,
    thailand: true
  });
  const [requiredFields, setRequiredFields] = useState(() => preOrderFormSettings?.requiredFields || {
    name: true,
    whatsapp: true,
    address: true,
    productLinkOrImage: true,
    size: false,
    color: false,
    quantity: true,
    advancePayment: true
  });

  const publicUrl = "https://wrikmart.com/pre-order";

  const handleCopyUrl = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(publicUrl)
        .then(() => {
          setCopied(true);
          showToast("Public Pre-Order Form link copied to clipboard!", "success");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          showToast("Could not access clipboard automatically", "warning");
        });
    } else {
      showToast("Clipboard API not supported on this browser.", "warning");
    }
  };

  const handleSaveSettings = () => {
    if (setPreOrderFormSettings) {
      setPreOrderFormSettings({ countries, requiredFields });
    }
    showToast("Pre-Order form settings saved successfully!", "success");
  };

  // Open Add Store Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      country: 'India',
      cat: '',
      url: '',
      brand: 'custom',
      logoUrl: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  // Open Edit Store Modal
  const handleOpenEditModal = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      country: store.country || 'India',
      cat: store.cat || '',
      url: store.url || '',
      brand: store.brand || 'custom',
      logoUrl: store.logoUrl || '',
      isActive: store.isActive !== false
    });
  };

  // Submit Add Store
  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Store name is required", "warning");
      return;
    }
    addSourcingStore(formData);
    setShowAddModal(false);
  };

  // Submit Edit Store
  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Store name is required", "warning");
      return;
    }
    updateSourcingStore(editingStore.id, formData);
    setEditingStore(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingStore) {
      deleteSourcingStore(deletingStore.id);
      setDeletingStore(null);
    }
  };

  // Confirm Reset Defaults
  const handleConfirmReset = () => {
    resetSourcingStores();
    setShowResetConfirm(false);
  };

  // Filtered stores
  const filteredStores = useMemo(() => {
    return sourcingStores.filter(store => {
      const matchSearch = 
        (store.name || '').toLowerCase().includes(storeSearch.toLowerCase()) ||
        (store.country || '').toLowerCase().includes(storeSearch.toLowerCase()) ||
        (store.cat || '').toLowerCase().includes(storeSearch.toLowerCase());
      
      const matchCountry = countryFilter === 'all' || 
        (store.country || '').toLowerCase() === countryFilter.toLowerCase();

      return matchSearch && matchCountry;
    });
  }, [sourcingStores, storeSearch, countryFilter]);

  const activeCount = sourcingStores.filter(s => s.isActive !== false).length;
  const inactiveCount = sourcingStores.length - activeCount;

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-600" />
            <span>Pre-Order & Sourcing Store Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the supported global e-commerce stores displayed on the home page and customize pre-order form rules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl self-start sm:self-auto border border-slate-300/60">
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stores'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-brand-500" />
            <span>Supported Global Stores ({sourcingStores.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('form_settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'form_settings'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-brand-500" />
            <span>Form & Public Link</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SUPPORTED GLOBAL SOURCING STORES (HOME PAGE) */}
      {/* ======================================================== */}
      {activeTab === 'stores' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Total Sourcing Stores
                </span>
                <span className="text-2xl font-black text-navy-900 mt-0.5 block">
                  {sourcingStores.length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                  Visible on Home Page
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
                  {activeCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Hidden / Disabled
                </span>
                <span className="text-2xl font-black text-slate-600 mt-0.5 block">
                  {inactiveCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search, Filter, and Action Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stores by name, category, or country..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Country Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {['all', 'India', 'Dubai', 'Thailand', 'Global'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCountryFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      countryFilter.toLowerCase() === c.toLowerCase()
                        ? 'bg-navy-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c === 'all' ? 'All Countries' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
                title="Reset back to default 12 official stores"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Store</span>
              </button>
            </div>
          </div>

          {/* Stores Grid */}
          {filteredStores.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-soft">
              <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-navy-900">No stores found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {storeSearch || countryFilter !== 'all' 
                  ? "No stores match your search or filter criteria. Try resetting filters." 
                  : "Click '+ Add Store' above to add your first sourcing store card."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className={`bg-white rounded-3xl border p-4 shadow-soft transition-all flex flex-col justify-between group ${
                    store.isActive === false
                      ? 'border-slate-200 opacity-60 bg-slate-50/50'
                      : 'border-slate-200/90 hover:border-brand-400 hover:shadow-card'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Store Badge + Country & Active Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <StoreBrandBadge 
                          storeName={store.name} 
                          brand={store.brand} 
                          logoUrl={store.logoUrl} 
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-navy-900 truncate leading-tight group-hover:text-brand-600 transition-colors">
                            {store.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CountryFlag country={store.country} className="w-3.5 h-2.5 rounded-2xs" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {store.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active Status Badge / Toggle */}
                      <button
                        onClick={() => toggleSourcingStoreStatus(store.id)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          store.isActive !== false
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={store.isActive !== false ? 'Click to hide on homepage' : 'Click to show on homepage'}
                      >
                        {store.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Category / Subtext */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                        Category / Subtitle
                      </span>
                      <p className="text-xs text-navy-900 font-medium mt-1 truncate">
                        {store.cat || 'General Items'}
                      </p>
                    </div>

                    {/* Target URL */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {store.url ? (
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-brand-600 hover:underline text-slate-600 font-mono text-[10px]"
                        >
                          {store.url.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="italic text-slate-400">No URL configured</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      store.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {store.isActive !== false ? 'Visible on Home' : 'Hidden'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(store)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit Store"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingStore(store)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Store"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRE-ORDER FORM SETTINGS & PUBLIC LINK */}
      {/* ======================================================== */}
      {activeTab === 'form_settings' && (
        <div className="space-y-6 max-w-3xl animate-fade-in">
          {/* Public URL Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-navy-900 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-brand-600" />
                <span>Public Customer Pre-Order Link</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Form Active & Online
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Enabled Sourcing Countries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Enabled Sourcing Countries in Pre-Order Wizard</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { id: 'india', name: 'India', key: 'india' },
                { id: 'dubai', name: 'Dubai', key: 'dubai' },
                { id: 'thailand', name: 'Thailand', key: 'thailand' }
              ].map(c => (
                <label key={c.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={countries[c.key]}
                    onChange={(e) => setCountries({ ...countries, [c.key]: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-bold text-navy-900 inline-flex items-center gap-1.5">
                    <CountryFlag country={c.name} className="w-4 h-3 rounded-xs" />
                    <span>{c.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Fields Validation Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Required Pre-Order Customer Form Fields</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(requiredFields).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setRequiredFields({ ...requiredFields, [key]: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="capitalize font-medium text-slate-800">{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              Save Form Settings
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD SOURCING STORE */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-navy-900">Add Global Sourcing Store</h3>
                  <p className="text-xs text-slate-500">New store card will appear on the customer home page</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adidas India"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold"
                  >
                    {COUNTRY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Category / Subtext</label>
                <input
                  type="text"
                  placeholder="e.g. Sneakers & Streetwear"
                  value={formData.cat}
                  onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Store Website URL</label>
                <input
                  type="url"
                  placeholder="https://www.adidas.co.in"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">Brand Logo Preset</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold"
                  >
                    {BRAND_PRESETS.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Custom Image / Logo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-bold text-navy-900">Show store immediately on Customer Home Page</span>
              </label>

              {/* Live Preview Card */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  Customer Card Live Preview:
                </span>
                <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-soft max-w-xs flex flex-col justify-between">
                  <div className="mb-3">
                    <StoreBrandBadge 
                      storeName={formData.name || 'Store Name'} 
                      brand={formData.brand} 
                      logoUrl={formData.logoUrl} 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {formData.country || 'Global'}
                    </span>
                    <h4 className="font-bold text-xs text-navy-900 leading-tight">
                      {formData.name || 'New Store'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {formData.cat || 'Category description'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Store Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT SOURCING STORE */}
      {/* ======================================================== */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-navy-900">Edit Store: {editingStore.name}</h3>
                  <p className="text-xs text-slate-500">Update logo, country, URL, or visibility</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStore(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nike India"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold"
                  >
                    {COUNTRY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Category / Subtext</label>
                <input
                  type="text"
                  placeholder="e.g. Sneakers & Apparel"
                  value={formData.cat}
                  onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Store Website URL</label>
                <input
                  type="url"
                  placeholder="https://www.nike.com/in"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">Brand Logo Preset</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold"
                  >
                    {BRAND_PRESETS.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Custom Image / Logo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-bold text-navy-900">Visible on Customer Home Page</span>
              </label>

              {/* Live Preview Card */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  Live Preview:
                </span>
                <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-soft max-w-xs flex flex-col justify-between">
                  <div className="mb-3">
                    <StoreBrandBadge 
                      storeName={formData.name || 'Store Name'} 
                      brand={formData.brand} 
                      logoUrl={formData.logoUrl} 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {formData.country || 'Global'}
                    </span>
                    <h4 className="font-bold text-xs text-navy-900 leading-tight">
                      {formData.name || 'Store Name'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {formData.cat || 'Category description'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Store Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE STORE CONFIRMATION */}
      {/* ======================================================== */}
      {deletingStore && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-navy-900">Delete Store Card?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-navy-900">{deletingStore.name}</strong> from the supported global stores list? This will remove it from the home page.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingStore(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RESET DEFAULTS CONFIRMATION */}
      {/* ======================================================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-navy-900">Reset to 12 Default Stores?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will restore the original 12 global stores (Nike India, Apple Dubai, Zara Global, Amazon India, Noon Dubai, Shopee Thailand, Flipkart, Sephora, etc.) and discard any custom additions.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                Yes, Restore 12 Defaults
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPreOrderSettings;

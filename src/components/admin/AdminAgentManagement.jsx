import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Wallet, 
  ShoppingBag, 
  X, 
  Check, 
  Globe, 
  FileText, 
  ShieldCheck, 
  User, 
  ExternalLink,
  MessageCircle,
  Building,
  Upload,
  Edit3,
  Trash2,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminAgentManagement = () => {
  const { agents = [], addAgent, updateAgent, deleteAgent, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgentProfile, setSelectedAgentProfile] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(null);

  // Form State with all 8 Required Fields
  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    initialBalance: '0',
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    // Reference Person
    refName: '',
    refPhone: '',
    refAddress: '',
    // Govt. Document
    docType: 'Aadhaar Card',
    docNumber: '',
    docUrl: ''
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    country: 'India',
    balance: '0',
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active',
    avatar: '',
    refName: '',
    refPhone: '',
    refAddress: '',
    docType: 'Aadhaar Card',
    docNumber: '',
    docUrl: '',
    docVerified: true
  });

  const handleCountryChange = (selectedCountry) => {
    let defaultDoc = 'Aadhaar Card';
    if (selectedCountry === 'Dubai') defaultDoc = 'Emirates ID';
    else if (selectedCountry === 'Thailand') defaultDoc = 'Thai National ID / Passport';

    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      docType: defaultDoc
    }));
  };

  const handleEditCountryChange = (selectedCountry) => {
    let defaultDoc = 'Aadhaar Card';
    if (selectedCountry === 'Dubai') defaultDoc = 'Emirates ID';
    else if (selectedCountry === 'Thailand') defaultDoc = 'Thai National ID / Passport';

    setEditFormData(prev => ({
      ...prev,
      country: selectedCountry,
      docType: defaultDoc
    }));
  };

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Agent Name and Phone number are mandatory', 'warning');
      return;
    }

    addAgent({
      name: formData.name,
      country: formData.country,
      initialBalance: formData.initialBalance,
      whatsapp: formData.whatsapp || formData.phone,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      refName: formData.refName,
      refPhone: formData.refPhone,
      refAddress: formData.refAddress,
      docType: formData.docType,
      docNumber: formData.docNumber,
      docUrl: formData.docUrl
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      country: 'India',
      initialBalance: '0',
      whatsapp: '',
      phone: '',
      email: '',
      address: '',
      refName: '',
      refPhone: '',
      refAddress: '',
      docType: 'Aadhaar Card',
      docNumber: '',
      docUrl: ''
    });
  };

  const handleStartEdit = (agent) => {
    setEditingAgent(agent);
    setEditFormData({
      name: agent.name || '',
      country: agent.country || 'India',
      balance: agent.balance !== undefined ? String(agent.balance) : '0',
      whatsapp: agent.whatsapp || '',
      phone: agent.phone || '',
      email: agent.email || '',
      address: agent.address || '',
      status: agent.status || 'Active',
      avatar: agent.avatar || '',
      refName: agent.referencePerson?.name || '',
      refPhone: agent.referencePerson?.phone || '',
      refAddress: agent.referencePerson?.address || '',
      docType: agent.govtDocument?.type || (agent.country === 'India' ? 'Aadhaar Card' : agent.country === 'Dubai' ? 'Emirates ID' : 'Thai National ID / Passport'),
      docNumber: agent.govtDocument?.number || '',
      docUrl: agent.govtDocument?.documentUrl || '',
      docVerified: agent.govtDocument?.verified ?? true
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingAgent || !editFormData.name.trim() || !editFormData.phone.trim()) {
      showToast('Agent Name and Phone number are mandatory', 'warning');
      return;
    }

    if (updateAgent) {
      updateAgent(editingAgent.id, {
        name: editFormData.name.trim(),
        country: editFormData.country,
        balance: Number(editFormData.balance) || 0,
        whatsapp: editFormData.whatsapp.trim() || editFormData.phone.trim(),
        phone: editFormData.phone.trim(),
        email: editFormData.email.trim(),
        address: editFormData.address.trim(),
        status: editFormData.status,
        avatar: editFormData.avatar.trim() || editingAgent.avatar,
        referencePerson: {
          name: editFormData.refName.trim(),
          phone: editFormData.refPhone.trim(),
          address: editFormData.refAddress.trim()
        },
        govtDocument: {
          type: editFormData.docType,
          number: editFormData.docNumber.trim(),
          documentUrl: editFormData.docUrl.trim(),
          verified: Boolean(editFormData.docVerified)
        }
      });
    }

    // Keep viewing modal in sync if open
    if (selectedAgentProfile && selectedAgentProfile.id === editingAgent.id) {
      setSelectedAgentProfile(prev => ({
        ...prev,
        name: editFormData.name.trim(),
        country: editFormData.country,
        balance: Number(editFormData.balance) || 0,
        whatsapp: editFormData.whatsapp.trim() || editFormData.phone.trim(),
        phone: editFormData.phone.trim(),
        email: editFormData.email.trim(),
        address: editFormData.address.trim(),
        status: editFormData.status,
        referencePerson: {
          name: editFormData.refName.trim(),
          phone: editFormData.refPhone.trim(),
          address: editFormData.refAddress.trim()
        },
        govtDocument: {
          type: editFormData.docType,
          number: editFormData.docNumber.trim(),
          documentUrl: editFormData.docUrl.trim(),
          verified: Boolean(editFormData.docVerified)
        }
      }));
    }

    setEditingAgent(null);
  };

  const handleConfirmDelete = () => {
    if (deletingAgent && deleteAgent) {
      deleteAgent(deletingAgent.id);
      if (selectedAgentProfile && selectedAgentProfile.id === deletingAgent.id) {
        setSelectedAgentProfile(null);
      }
      setDeletingAgent(null);
    }
  };

  const filtered = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.phone && a.phone.includes(searchTerm)) ||
    (a.whatsapp && a.whatsapp.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Agent Sourcing Network (India, Dubai, Thailand)</h2>
          <p className="text-xs text-slate-500">Manage on-ground agents, 8-point KYC verification, and operating floats</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Agent</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents by name, WhatsApp, phone, or country..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar sm:scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Agent Profile</th>
                <th className="px-5 py-3.5">Station Country</th>
                <th className="px-5 py-3.5">WhatsApp / Phone</th>
                <th className="px-5 py-3.5">Govt ID Status</th>
                <th className="px-5 py-3.5">Float Balance</th>
                <th className="px-5 py-3.5">Orders Sourced</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ag) => (
                <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img src={ag.avatar} alt={ag.name} className="w-10 h-10 object-cover rounded-full border flex-shrink-0" />
                    <div>
                      <span className="font-bold text-navy-900 block">{ag.name}</span>
                      <span className="text-[10px] text-brand-600 font-semibold">{ag.id}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                      <CountryFlag country={ag.country || ag.flag} className="w-4 h-3 rounded-[2px]" />
                      <span>{ag.country}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">({ag.currency})</span>
                  </td>

                  <td className="px-5 py-3.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{ag.whatsapp || ag.phone}</span>
                    </div>
                    {ag.email && <span className="text-[11px] text-slate-400 block">{ag.email}</span>}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">
                          {ag.govtDocument?.type || 'NID / ID'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ag.govtDocument?.number || 'Verified'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-emerald-600 text-sm">
                    {ag.symbol}{ag.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {(ag.completedOrders || 0) + (ag.activeOrders || 0)} Orders
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        type="button"
                        onClick={() => setSelectedAgentProfile(ag)}
                        className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-xs font-bold text-brand-700 transition-colors"
                        title="View KYC Dossier"
                      >
                        KYC
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleStartEdit(ag)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-xs font-bold text-slate-700 transition-colors"
                        title="Edit Agent Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setDeletingAgent(ag)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Add Agent Modal (Full 8 Fields) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
            <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-navy-900">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Add New Agent (8-Point KYC)</h3>
                  <p className="text-[11px] text-slate-400">Complete all required identity, contact, and reference details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="p-6 space-y-6 text-xs">
              {/* Section 1: Basic & Financial */}
              <div className="space-y-4">
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-brand-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">1</span>
                  Basic Information & Operating Float
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">1. Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma / Tanveer Ahmed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">2. Selection Country *</label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="India">🇮🇳 India (INR ₹)</option>
                      <option value="Dubai">🇦🇪 Dubai (AED د.إ)</option>
                      <option value="Thailand">🇹🇭 Thailand (THB ฿)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">3. Initial Balance *</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-emerald-600 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">4. WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">5. Email Address</label>
                    <input
                      type="email"
                      placeholder="agent@wrikmart.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">6. Overseas Residential / Station Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Full street address, building/flat number, city, postal code"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Section 2: Reference Person */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-brand-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">2</span>
                  7. Reference Person Guarantee Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reference Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohit Agrawal / Guarantor Name"
                      value={formData.refName}
                      onChange={(e) => setFormData({ ...formData, refName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reference Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98111 22334"
                      value={formData.refPhone}
                      onChange={(e) => setFormData({ ...formData, refPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference Person Full Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Residential or business address of reference person"
                    value={formData.refAddress}
                    onChange={(e) => setFormData({ ...formData, refAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              {/* Section 3: Govt. Documents */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-brand-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">3</span>
                  8. Government Documents (NID / Aadhaar / Passport)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Document Type *</label>
                    <select
                      value={formData.docType}
                      onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="Aadhaar Card">🇮🇳 Aadhaar Card (India)</option>
                      <option value="Indian PAN Card">🇮🇳 PAN Card (India)</option>
                      <option value="Emirates ID">🇦🇪 Emirates ID (Dubai / UAE)</option>
                      <option value="Thai National ID">🇹🇭 Thai National ID (Thailand)</option>
                      <option value="National ID (NID)">🇧🇩 Bangladeshi NID</option>
                      <option value="International Passport">🌐 International Passport</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Govt Document Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4892-3819-0192 or Passport No"
                      value={formData.docNumber}
                      onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Scan / Photo URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or cloud document link"
                      value={formData.docUrl}
                      onChange={(e) => setFormData({ ...formData, docUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, docUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80' }))}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Attach Sample</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Supported: High-resolution photo scan of original Govt Document</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Register Agent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Agent Profile & Complete KYC Dossier Modal */}
      {selectedAgentProfile && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-5 sm:space-y-6 border border-slate-200 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img src={selectedAgentProfile.avatar} alt={selectedAgentProfile.name} className="w-14 h-14 object-cover rounded-2xl border shadow-sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-navy-900">{selectedAgentProfile.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {selectedAgentProfile.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 inline-flex items-center gap-1.5 mt-0.5">
                    <CountryFlag country={selectedAgentProfile.country || selectedAgentProfile.flag} className="w-4 h-3 rounded-[2px]" />
                    <span>{selectedAgentProfile.country} Sourcing Specialist • ID: {selectedAgentProfile.id}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgentProfile(null)} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Status Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Current Operating Balance</span>
                <span className="font-extrabold text-xl text-emerald-700">
                  {selectedAgentProfile.symbol}{selectedAgentProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">{selectedAgentProfile.currency} Float available</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sourced Volume</span>
                <span className="font-extrabold text-xl text-navy-900">
                  {selectedAgentProfile.symbol}{(selectedAgentProfile.totalSpent || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{(selectedAgentProfile.completedOrders || 0) + (selectedAgentProfile.activeOrders || 0)} Total consignments</span>
              </div>
            </div>

            {/* KYC & Verification Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Agent Identity & Contact Dossier</span>
              </h4>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">WhatsApp Contact</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedAgentProfile.whatsapp || selectedAgentProfile.phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Official Email</span>
                    <span className="font-bold text-slate-800">{selectedAgentProfile.email || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Overseas Station Address</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {selectedAgentProfile.address || 'Address registered on file'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reference Person Box */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-600" />
                <span>Reference Person & Guarantor</span>
              </h4>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Name</span>
                    <span className="font-bold text-slate-800">{selectedAgentProfile.referencePerson?.name || 'Verified Reference'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Phone</span>
                    <span className="font-bold text-slate-800">{selectedAgentProfile.referencePerson?.phone || '+91 98111 55667'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Address</span>
                  <span className="font-medium text-slate-700">{selectedAgentProfile.referencePerson?.address || 'Residential Address Verified'}</span>
                </div>
              </div>
            </div>

            {/* Govt Document Card */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Government Identification Document</span>
              </h4>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-900 block text-sm">
                    {selectedAgentProfile.govtDocument?.type || 'Government ID'}
                  </span>
                  <span className="font-mono text-purple-700 font-semibold">
                    Number: {selectedAgentProfile.govtDocument?.number || 'ID-VERIFIED-2026'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Official Document Authenticated</span>
                  </div>
                </div>

                {selectedAgentProfile.govtDocument?.documentUrl && (
                  <a
                    href={selectedAgentProfile.govtDocument.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 rounded-xl font-bold text-purple-700 hover:bg-purple-100/50 shadow-sm transition-colors text-[11px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Scan</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleStartEdit(selectedAgentProfile);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-xs shadow transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Agent Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAgentProfile(null)}
                className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
            <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-navy-900">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Edit Agent Profile & Sourcing KYC</h3>
                  <p className="text-[11px] text-slate-400">ID: {editingAgent.id} • {editingAgent.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingAgent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 space-y-5 text-xs">
              {/* Section 1: Basic Identity & Station */}
              <div className="space-y-3">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span>1. Identity, Station & Operating Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Agent Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Station Country *</label>
                    <select
                      value={editFormData.country}
                      onChange={(e) => handleEditCountryChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-bold"
                    >
                      <option value="India">India (INR ₹) 🇮🇳</option>
                      <option value="Dubai">Dubai (AED د.إ) 🇦🇪</option>
                      <option value="Thailand">Thailand (THB ฿) 🇹🇭</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Operating Float Balance ({editFormData.country === 'India' ? '₹ INR' : editFormData.country === 'Dubai' ? 'د.إ AED' : '฿ THB'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.balance}
                      onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.whatsapp}
                      onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Calling Phone *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Overseas Station Physical Address</label>
                    <textarea
                      rows="2"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Avatar Profile Photo URL</label>
                    <input
                      type="url"
                      value={editFormData.avatar}
                      onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white mb-2"
                    />
                    {editFormData.avatar && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={editFormData.avatar} 
                          alt="Avatar preview" 
                          className="w-8 h-8 rounded-lg object-cover border" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] text-slate-400">Preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Reference Person / Guarantor */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Building className="w-3.5 h-3.5 text-brand-600" />
                  <span>2. Reference Person & Guarantor in Bangladesh / Local Hub</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reference Person Name</label>
                    <input
                      type="text"
                      value={editFormData.refName}
                      onChange={(e) => setEditFormData({ ...editFormData, refName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reference Contact Phone</label>
                    <input
                      type="text"
                      value={editFormData.refPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, refPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference Person Address</label>
                  <input
                    type="text"
                    value={editFormData.refAddress}
                    onChange={(e) => setEditFormData({ ...editFormData, refAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Section 3: Govt. KYC Document */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>3. Government Identification & Verified KYC</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Govt. Document Type</label>
                    <input
                      type="text"
                      value={editFormData.docType}
                      onChange={(e) => setEditFormData({ ...editFormData, docType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Document / Card ID Number</label>
                    <input
                      type="text"
                      value={editFormData.docNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, docNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Scan Image URL / Storage Link</label>
                  <input
                    type="url"
                    value={editFormData.docUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, docUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editFormData.docVerified}
                    onChange={(e) => setEditFormData({ ...editFormData, docVerified: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-bold text-slate-700">Official Document Authenticated & KYC Verified</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold shadow-md transition-all"
                >
                  Save Agent Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Agent Confirmation Modal */}
      {deletingAgent && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy-900 text-base">Remove Agent?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deletingAgent.name}"</strong> ({deletingAgent.country}) from the active sourcing agent network?
              </p>
              {((deletingAgent.activeOrders || 0) > 0) && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span><strong>Warning:</strong> This agent currently has {deletingAgent.activeOrders} active orders assigned! Reassign orders before deleting.</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAgent(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

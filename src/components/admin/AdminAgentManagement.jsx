import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Plus, Search, Phone, Mail, MapPin, Wallet, ShoppingBag, X, Check, Globe } from 'lucide-react';

export const AdminAgentManagement = () => {
  const { agents, addAgent, showToast, balanceTransfers, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgentProfile, setSelectedAgentProfile] = useState(null);

  // Form State
  const [newAgent, setNewAgent] = useState({
    name: '',
    country: 'India',
    phone: '',
    email: '',
    initialBalance: '0'
  });

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.phone) {
      showToast('Please provide Agent Name and Phone number', 'warning');
      return;
    }
    addAgent(newAgent);
    setShowAddModal(false);
    setNewAgent({ name: '', country: 'India', phone: '', email: '', initialBalance: '0' });
  };

  const filtered = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Agent Management (India, Dubai, Thailand)</h2>
          <p className="text-xs text-slate-500">Manage on-ground purchasing agents, order limits, and contact details</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all"
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
            placeholder="Search agents by name, phone, or country..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Agent Profile</th>
                <th className="px-5 py-3.5">Country & Currency</th>
                <th className="px-5 py-3.5">Phone & Email</th>
                <th className="px-5 py-3.5">Current Balance</th>
                <th className="px-5 py-3.5">Total Orders Sourced</th>
                <th className="px-5 py-3.5">Status</th>
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
                    <span className="font-bold text-slate-900">{ag.flag} {ag.country}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">({ag.currency})</span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800 block">{ag.phone}</span>
                    <span className="text-[11px] text-slate-400">{ag.email}</span>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-emerald-600 text-sm">
                    {ag.symbol}{ag.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {ag.completedOrders + ag.activeOrders} Orders
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {ag.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => setSelectedAgentProfile(ag)}
                      className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-xs font-bold text-brand-700 transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-navy-900">
                <UserCheck className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-base">Register Overseas Sourcing Agent</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Agent Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Station Country *</label>
                  <select
                    value={newAgent.country}
                    onChange={(e) => setNewAgent({ ...newAgent, country: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="India">🇮🇳 India (INR)</option>
                    <option value="Dubai">🇦🇪 Dubai (AED)</option>
                    <option value="Thailand">🇹🇭 Thailand (THB)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Float Balance</label>
                  <input
                    type="number"
                    value={newAgent.initialBalance}
                    onChange={(e) => setNewAgent({ ...newAgent, initialBalance: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="agent@wrikmart.com"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Agent Profile & Ledger Inspector Modal */}
      {selectedAgentProfile && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedAgentProfile.avatar} alt={selectedAgentProfile.name} className="w-12 h-12 object-cover rounded-2xl border shadow-sm" />
                <div>
                  <h3 className="font-extrabold text-base text-navy-900">{selectedAgentProfile.name}</h3>
                  <p className="text-xs text-slate-500">{selectedAgentProfile.flag} {selectedAgentProfile.country} Purchasing Agent • {selectedAgentProfile.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgentProfile(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Live Balance</span>
                <span className="font-extrabold text-lg text-emerald-600">
                  {selectedAgentProfile.symbol}{selectedAgentProfile.balance.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sourced Volume</span>
                <span className="font-extrabold text-lg text-navy-900">
                  {selectedAgentProfile.completedOrders + selectedAgentProfile.activeOrders} Orders
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-bold text-slate-800">{selectedAgentProfile.phone}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Operating Currency:</span>
                <span className="font-bold text-slate-800">{selectedAgentProfile.currency} ({selectedAgentProfile.symbol})</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Remittance Acceptance:</span>
                <span className="font-bold text-emerald-600">Instant Dual-Ledger Sync</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAgentProfile(null)}
              className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

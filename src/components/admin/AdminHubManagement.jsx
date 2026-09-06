import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, MapPin, Phone, User, Package, CheckCircle } from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminHubManagement = () => {
  const { hubs, addHub } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: 'Bangladesh',
    location: '',
    manager: '',
    phone: ''
  });

  const handleAddHub = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;

    addHub(formData);
    setFormData({ name: '', country: 'Bangladesh', location: '', manager: '', phone: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Hub & Warehouse Management</h2>
          <p className="text-xs text-slate-500">Cross-border staging warehouses in Dhaka, Chittagong, Dubai, Delhi & Bangkok</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register New Hub</span>
        </button>
      </div>

      {/* Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hubs.map((hub) => (
          <div key={hub.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-900">{hub.name}</h3>
                  <span className="text-[11px] text-slate-500 font-semibold inline-flex items-center gap-1 mt-0.5">
                    <CountryFlag country={hub.country} className="w-3.5 h-2.5 rounded-xs" />
                    <span>{hub.country}</span>
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                {hub.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{hub.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Manager: <strong className="text-slate-800">{hub.manager}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{hub.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Active Parcels in Hub:</span>
              <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {hub.activePackages || 0} Packages
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <h3 className="font-bold text-navy-900 text-base">Register New Delivery Hub</h3>

            <form onSubmit={handleAddHub} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sylhet Regional Hub"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Bangladesh">Bangladesh 🇧🇩</option>
                  <option value="India">India 🇮🇳</option>
                  <option value="Dubai">Dubai 🇦🇪</option>
                  <option value="Thailand">Thailand 🇹🇭</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Location Address *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Full physical address..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="e.g. Shakil Ahmed"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 18..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 border rounded-lg text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded-lg shadow"
                >
                  Register Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

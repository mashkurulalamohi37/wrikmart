import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  X, 
  Search, 
  AlertTriangle,
  Boxes,
  ShieldAlert
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminHubManagement = () => {
  const { hubs = [], addHub, updateHub, deleteHub } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHub, setEditingHub] = useState(null);
  const [deletingHub, setDeletingHub] = useState(null);

  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    country: 'Bangladesh',
    location: '',
    manager: '',
    phone: '',
    capacity: 2500,
    status: 'Active'
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    country: 'Bangladesh',
    location: '',
    manager: '',
    phone: '',
    capacity: 2500,
    status: 'Active'
  });

  const handleAddHub = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) return;

    if (addHub) {
      addHub({
        ...formData,
        capacity: Number(formData.capacity) || 2000
      });
    }
    setFormData({ 
      name: '', 
      country: 'Bangladesh', 
      location: '', 
      manager: '', 
      phone: '', 
      capacity: 2500,
      status: 'Active' 
    });
    setShowAddModal(false);
  };

  const handleStartEdit = (hub) => {
    setEditingHub(hub);
    setEditFormData({
      name: hub.name || '',
      country: hub.country || 'Bangladesh',
      location: hub.location || '',
      manager: hub.manager || '',
      phone: hub.phone || '',
      capacity: hub.capacity || 2000,
      status: hub.status || 'Active'
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingHub || !editFormData.name.trim() || !editFormData.location.trim()) return;

    if (updateHub) {
      updateHub(editingHub.id, {
        ...editFormData,
        capacity: Number(editFormData.capacity) || 2000
      });
    }
    setEditingHub(null);
  };

  const handleConfirmDelete = () => {
    if (deletingHub && deleteHub) {
      deleteHub(deletingHub.id);
      setDeletingHub(null);
    }
  };

  const filteredHubs = hubs.filter(h => {
    const q = searchTerm.toLowerCase();
    return (
      (h.name && h.name.toLowerCase().includes(q)) ||
      (h.country && h.country.toLowerCase().includes(q)) ||
      (h.location && h.location.toLowerCase().includes(q)) ||
      (h.manager && h.manager.toLowerCase().includes(q))
    );
  });

  const totalCapacity = hubs.reduce((acc, h) => acc + (Number(h.capacity) || 0), 0);
  const totalActivePackages = hubs.reduce((acc, h) => acc + (Number(h.activePackages) || 0), 0);

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

      {/* Summary Stats & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operational Hubs</span>
            <span className="text-lg font-black text-navy-900">{hubs.length} Active Centers</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Packages in Transit/Hubs</span>
            <span className="text-lg font-black text-brand-600">{totalActivePackages} Parcels Staged</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Network Capacity</span>
            <span className="text-lg font-black text-emerald-700">{totalCapacity.toLocaleString()} Units</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter hubs by name, location, country, or manager..."
          className="w-full bg-transparent text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none"
        />
        {searchTerm && (
          <button 
            type="button"
            onClick={() => setSearchTerm('')} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hubs Grid */}
      {filteredHubs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-soft">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-navy-900">No Warehouses or Hubs Found</h4>
          <p className="text-xs text-slate-500">No hub matched your search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHubs.map((hub) => {
            const capacity = Number(hub.capacity) || 2000;
            const activePkg = Number(hub.activePackages) || 0;
            const loadPercent = Math.min(100, Math.round((activePkg / capacity) * 100));

            return (
              <div key={hub.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-navy-900 leading-snug">{hub.name}</h3>
                        <span className="text-[11px] text-slate-500 font-semibold inline-flex items-center gap-1 mt-0.5">
                          <CountryFlag country={hub.country} className="w-3.5 h-2.5 rounded-xs" />
                          <span>{hub.country}</span>
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      hub.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : hub.status === 'Maintenance' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {hub.status || 'Active'}
                    </span>
                  </div>

                  {/* Details Card */}
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{hub.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Manager: <strong className="text-slate-800">{hub.manager || 'Unassigned'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{hub.phone || 'No direct phone registered'}</span>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Staged Packages:</span>
                      <span className="font-bold text-navy-900">
                        <strong className="text-brand-600">{activePkg}</strong> / {capacity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          loadPercent > 85 ? 'bg-rose-500' : loadPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(4, loadPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(hub)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Hub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingHub(hub)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Hub"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Add Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-navy-900 text-base">Register New Delivery Hub</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHub} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sylhet Regional Hub"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
                  >
                    <option value="Bangladesh">Bangladesh 🇧🇩</option>
                    <option value="India">India 🇮🇳</option>
                    <option value="Dubai">Dubai 🇦🇪</option>
                    <option value="Thailand">Thailand 🇹🇭</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Capacity (Packages)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Location Address *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Full physical address, road, area, postal code..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 18..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl shadow transition-all active:scale-95"
                >
                  Register Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Hub Modal */}
      {editingHub && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy-900 text-base">Edit Hub & Warehouse</h3>
                  <p className="text-[11px] text-slate-400">ID: {editingHub.id}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingHub(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Country *</label>
                  <select
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
                  >
                    <option value="Bangladesh">Bangladesh 🇧🇩</option>
                    <option value="India">India 🇮🇳</option>
                    <option value="Dubai">Dubai 🇦🇪</option>
                    <option value="Thailand">Thailand 🇹🇭</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Operational Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Capacity (Packages)</label>
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Location Address *</label>
                <textarea
                  rows="2"
                  required
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={editFormData.manager}
                    onChange={(e) => setEditFormData({ ...editFormData, manager: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingHub(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl shadow transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deletingHub && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy-900 text-base">Delete Warehouse Hub?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deletingHub.name}"</strong>?
              </p>
              {deletingHub.activePackages > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span><strong>Warning:</strong> This hub currently has {deletingHub.activePackages} active packages registered!</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingHub(null)}
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, MapPin, Phone, Calendar, CheckCircle, Truck } from 'lucide-react';

export const AgentHubDeliveryModal = ({ order, onClose }) => {
  const { hubs, markOrderAtHub } = useApp();
  const [selectedHubId, setSelectedHubId] = useState(order.hubId || hubs[0]?.id);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedHub = hubs.find(h => h.id === selectedHubId) || hubs[0];

  const handleMarkDelivered = () => {
    markOrderAtHub(order.id, selectedHubId, deliveryDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Logistics Routing</span>
              <h3 className="font-bold text-sm">Which Hub Delivery?</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900">
            Order: <strong className="font-mono text-purple-950">{order.orderNumber}</strong> ({order.country})
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1.5">Select Destination Delivery Hub *</label>
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
            >
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} — {hub.country}
                </option>
              ))}
            </select>
          </div>

          {/* Hub Information Card */}
          {selectedHub && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>{selectedHub.name}</span>
              </h4>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{selectedHub.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Manager: {selectedHub.manager} ({selectedHub.phone})</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Expected Drop-off / Arrival Date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-medium"
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            After reaching the selected hub, the package will be prepared for cross-border air freight to Bangladesh.
          </p>

          <button
            onClick={handleMarkDelivered}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark as Arrived at Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};

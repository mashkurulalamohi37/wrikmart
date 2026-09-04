import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, History, CheckCircle2, Clock } from 'lucide-react';

export const AgentTransitionHistoryModal = ({ order, onClose }) => {
  const { orders, activeAgent } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState(order?.id || orders[0]?.id);

  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-navy-900 text-sm">Order Transition History</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Order Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Order ID</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} ({o.country}) — Status: {o.status}
                </option>
              ))}
            </select>
          </div>

          {activeOrder && (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeOrder.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    step.done 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-slate-300 text-transparent'
                  }`}>
                    {step.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${step.done ? 'text-navy-900' : 'text-slate-400'}`}>
                        {step.step}
                      </h5>
                      <span className="text-[10px] text-slate-400">{step.time}</span>
                    </div>
                    {step.actor && (
                      <span className="text-[10px] font-semibold text-brand-600 block">By {step.actor}</span>
                    )}
                    {step.note && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

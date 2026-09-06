import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  Upload, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

export const AgentDamageReportModal = ({ order, onClose }) => {
  const { reportDamageOrReturn, activeAgent, showToast } = useApp();

  const [status, setStatus] = useState(order?.status === 'Returned' ? 'Returned' : 'Damaged');
  const [incidentType, setIncidentType] = useState(
    order?.damageDetails?.incidentType || 'Damaged in Transit'
  );
  const [description, setDescription] = useState(
    order?.damageDetails?.description || ''
  );
  const [proofUrl, setProofUrl] = useState(
    order?.damageDetails?.proofUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80'
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast('Please provide an incident description', 'warning');
      return;
    }

    reportDamageOrReturn(order.id, {
      status, // 'Damaged' | 'Returned'
      incidentType,
      description,
      proofUrl,
      reportedBy: `${activeAgent?.name || 'Overseas Agent'} (${order?.country || activeAgent?.country})`,
      disposition: 'Pending Admin Investigation',
      resolutionStatus: 'Pending Investigation',
      resolutionNote: 'Reported by on-ground agent. Awaiting HQ verification.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
              status === 'Damaged' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {status === 'Damaged' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> : <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 block">Agent Sourcing Portal</span>
              <h3 className="font-extrabold text-sm sm:text-base text-navy-900">
                Report Damaged or Defective Item
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Order: {order?.orderNumber} • {order?.country}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
            <Info className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>Incident report will be logged directly to Dhaka Central Operations for review.</span>
          </div>

          {/* Classification Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Action / Classification *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Damaged')}
                className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 ${
                  status === 'Damaged' 
                    ? 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-400/20' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="block text-xs">Product Damaged</span>
                  <span className="text-[10px] font-normal text-slate-500">Broken, crushed, or leaking</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Returned')}
                className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 ${
                  status === 'Returned' 
                    ? 'border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-400/20' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="block text-xs">Store Return</span>
                  <span className="text-[10px] font-normal text-slate-500">Wrong variant or defective</span>
                </div>
              </button>
            </div>
          </div>

          {/* Incident Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Incident Category *</label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-brand-500 text-xs"
            >
              <option value="Damaged in Transit">Damaged in Transit / Courier</option>
              <option value="Defective / Store Fault">Defective Item from Retail Store</option>
              <option value="Wrong Item Shipped">Wrong Variant / Item Supplied</option>
              <option value="Packaging Broken">Severe Packaging Damage</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Incident Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe physical damage condition, store receipt issues, or packaging defects..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500 text-xs"
            />
          </div>

          {/* Photo Evidence URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Damage Photo / Evidence URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://... photo link"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setProofUrl('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Sample</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                status === 'Damaged' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Incident Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Upload,
  ExternalLink,
  PackageCheck
} from 'lucide-react';

export const AdminDamageReturnModal = ({ order, onClose }) => {
  const { reportDamageOrReturn, resolveDamageOrReturn, showToast } = useApp();

  const isExistingDamage = Boolean(order?.damageDetails);

  // Form State
  const [incidentType, setIncidentType] = useState(
    order?.damageDetails?.incidentType || 'Damaged in Transit'
  );
  const [status, setStatus] = useState(order?.status === 'Returned' ? 'Returned' : 'Damaged');
  const [description, setDescription] = useState(
    order?.damageDetails?.description || ''
  );
  const [proofUrl, setProofUrl] = useState(
    order?.damageDetails?.proofUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80'
  );
  const [reportedBy, setReportedBy] = useState(
    order?.damageDetails?.reportedBy || 'Hub Inspector (Dhaka Main Hub)'
  );
  const [disposition, setDisposition] = useState(
    order?.damageDetails?.disposition || 'Customer Refund Required'
  );
  const [refundAmount, setRefundAmount] = useState(
    order?.damageDetails?.refundAmount ?? (order?.financials?.advancePaid || 0)
  );
  const [resolutionStatus, setResolutionStatus] = useState(
    order?.damageDetails?.resolutionStatus || 'Pending Investigation'
  );
  const [resolutionNote, setResolutionNote] = useState(
    order?.damageDetails?.resolutionNote || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast('Please provide an incident description', 'warning');
      return;
    }

    if (isExistingDamage) {
      resolveDamageOrReturn(order.id, {
        resolutionStatus,
        resolutionNote,
        refundAmount: Number(refundAmount)
      });
    } else {
      reportDamageOrReturn(order.id, {
        status, // 'Damaged' | 'Returned'
        incidentType,
        description,
        proofUrl,
        reportedBy,
        disposition,
        refundAmount: Number(refundAmount),
        resolutionStatus,
        resolutionNote
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              status === 'Damaged' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {status === 'Damaged' ? <AlertTriangle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-navy-900">
                {isExistingDamage ? 'Manage Damage / Return Resolution' : 'Report Product Damage or Return'}
              </h3>
              <p className="text-[11px] text-slate-400">Order: {order?.orderNumber} • {order?.country}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
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
                  <span className="block text-xs">Product Return</span>
                  <span className="text-[10px] font-normal text-slate-500">Wrong size, defective, rejected</span>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Incident Category *</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="Damaged in Transit">Damaged in Transit (Air / Courier)</option>
                <option value="Defective / Store Fault">Store Defect / Defective Item</option>
                <option value="Wrong Item Shipped">Wrong Item / Variant Shipped</option>
                <option value="Customer Return at Doorstep">Customer Return at Doorstep</option>
                <option value="Packaging Broken">Severe Packaging Damage</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reported By *</label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Incident Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe physical damage condition, store receipt issues, or reason for return..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Photo Evidence URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Proof / Damage Photo URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://... photo link"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
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

          {/* Financial Disposition & Resolution */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-600" />
              <span>Financial Liability & Resolution Plan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommended Disposition</label>
                <select
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Customer Refund Required">Customer Refund Required</option>
                  <option value="Vendor Replacement">Vendor Replacement from Store</option>
                  <option value="Insurance Claim">Cargo / Courier Insurance Claim</option>
                  <option value="Business Loss Write-Off">Business Loss Write-Off</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund / Claim Amount (BDT)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Status *</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Pending Investigation">Pending Investigation</option>
                  <option value="Approved & Refunded">Approved & Refunded</option>
                  <option value="Replacement Dispatched">Replacement Dispatched</option>
                  <option value="Claim Filed with Airline">Claim Filed with Airline</option>
                  <option value="Closed / Resolved">Closed / Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. bKash refund completed TrxID: 9A817X"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 ${
                status === 'Damaged' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Update Order Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

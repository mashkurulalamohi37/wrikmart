import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CreditCard, 
  Calendar, 
  FileText, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminHqExpenseModal = ({ onClose, initialData = null }) => {
  const { addHqExpense } = useApp();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || 'Rent & Facilities',
    department: initialData?.department || 'Corporate Headquarters',
    payeeName: initialData?.payeeName || '',
    amount: initialData?.amount || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: initialData?.paymentMethod || 'Bank Transfer (BRAC Bank)',
    paymentReference: initialData?.paymentReference || '',
    status: initialData?.status || 'Paid',
    billingFrequency: initialData?.billingFrequency || 'Monthly Recurring',
    vatTaxDeduction: initialData?.vatTaxDeduction || '',
    approvedBy: initialData?.approvedBy || 'Super Administrator',
    voucherScanUrl: initialData?.voucherScanUrl || 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
    notes: initialData?.notes || ''
  });

  const categories = [
    'Rent & Facilities',
    'Salaries & Payroll',
    'Utilities & Internet',
    'Packaging & Supplies',
    'Marketing & Advertising',
    'Cloud & Software',
    'Legal & Licensing',
    'Office Operations & Misc'
  ];

  const departments = [
    'Corporate Headquarters',
    'Tejgaon Fulfillment Center',
    'Customer Service & Dispatch',
    'Engineering & IT',
    'Marketing & Growth',
    'Facilities & Administration'
  ];

  const paymentMethods = [
    'Bank Transfer (BRAC Bank)',
    'Bank Transfer (City Bank)',
    'Bank Transfer (EBL)',
    'Corporate Bank BEFTN',
    'bKash Merchant Pay',
    'Nagad Corporate Pay',
    'Corporate Credit Card',
    'Petty Cash'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) {
      alert('Please provide a valid Expense Title and Amount');
      return;
    }

    addHqExpense({
      ...formData,
      amount: Number(formData.amount),
      vatTaxDeduction: Number(formData.vatTaxDeduction || 0)
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-navy-900 to-[#14234B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Record HQ Bangladesh Office Expense
              </h3>
              <p className="text-xs text-slate-300">
                Dhaka headquarters, warehouse lease, utility, salary or operational bill
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Expense Title / Purpose <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Banani Head Office Lease Rent - June 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Department / Cost Center
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Payee / Vendor & Amount in BDT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payee / Vendor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Ahmed Properties Ltd. / DESCO / Dot Internet"
                value={formData.payeeName}
                onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Amount (BDT ৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-extrabold text-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Payment Method, Reference & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[11px] font-semibold bg-white"
              >
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cheque / Trx ID / Ref
              </label>
              <input
                type="text"
                placeholder="e.g., BRAC-FT-992140"
                value={formData.paymentReference}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[11px] font-semibold bg-white"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending / Due</option>
              </select>
            </div>
          </div>

          {/* Row 4: Dates & Nature */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Billing Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Billing Frequency
              </label>
              <select
                value={formData.billingFrequency}
                onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[11px] font-semibold bg-white"
              >
                <option value="Monthly Recurring">Monthly Recurring</option>
                <option value="One-off Expense">One-off Expense</option>
                <option value="Bi-Weekly Ad Spend">Bi-Weekly Ad Spend</option>
                <option value="Annual / Semi-Annual">Annual / Semi-Annual</option>
              </select>
            </div>
          </div>

          {/* Row 5: VAT/Tax & Authorized Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                VAT / Tax (TDS) Deducted (৳ Optional)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g., 2250"
                value={formData.vatTaxDeduction}
                onChange={(e) => setFormData({ ...formData, vatTaxDeduction: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Approved / Verified By
              </label>
              <input
                type="text"
                placeholder="Super Administrator / Finance Manager"
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          </div>

          {/* Row 6: Remarks & Attachment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Voucher Scan / Invoice Attachment URL
            </label>
            <input
              type="url"
              placeholder="https://... invoice or receipt scan"
              value={formData.voucherScanUrl}
              onChange={(e) => setFormData({ ...formData, voucherScanUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Operational Notes & Details
            </label>
            <textarea
              rows={2}
              placeholder="Specify location, meter numbers, transaction IDs, or reason for expense..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Post to Ledger</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

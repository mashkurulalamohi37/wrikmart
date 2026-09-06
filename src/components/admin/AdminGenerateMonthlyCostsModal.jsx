import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Building2, 
  CheckSquare, 
  Square, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminGenerateMonthlyCostsModal = ({ onClose }) => {
  const { DEFAULT_RECURRING_HQ_TEMPLATES, generateMonthlyHqBatch } = useApp();

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);

  // Initialize items from template
  const [items, setItems] = useState(() => 
    (DEFAULT_RECURRING_HQ_TEMPLATES || []).map((t, idx) => ({
      ...t,
      selected: true,
      amount: t.defaultAmount,
      status: 'Paid'
    }))
  );

  const toggleItem = (idx) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, selected: !it.selected } : it));
  };

  const handleAmountChange = (idx, newAmount) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, amount: Number(newAmount) } : it));
  };

  const selectAll = (checked) => {
    setItems(prev => prev.map(it => ({ ...it, selected: checked })));
  };

  const selectedItems = items.filter(it => it.selected);
  const totalAmount = selectedItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const handleGenerate = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one recurring expense to generate.');
      return;
    }

    generateMonthlyHqBatch(selectedMonth, selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-navy-900 via-[#14234B] to-brand-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Generate Monthly HQ Overhead Batch
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-300 font-bold text-[10px] border border-brand-500/40">
                  1-Click Auto-Bill
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically generate standard recurring Dhaka office rent, payroll, utilities & server expenses
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

        {/* Target Month Selector & Quick Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-700">Billing Period:</span>
            <input
              type="text"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              placeholder="e.g., June 2026"
              className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => selectAll(true)}
              className="px-2.5 py-1 text-[11px] font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => selectAll(false)}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Recurring List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2.5 text-xs text-slate-700">
          <div className="text-[11px] text-slate-500 mb-2">
            Review and adjust standard recurring bills for <strong>{selectedMonth}</strong> before posting to the financial ledger:
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  it.selected 
                    ? 'bg-white border-brand-500/40 shadow-xs' 
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                {/* Left: Checkbox & Meta */}
                <div 
                  onClick={() => toggleItem(idx)}
                  className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <button 
                    type="button" 
                    className="mt-0.5 text-brand-600 flex-shrink-0"
                  >
                    {it.selected ? (
                      <CheckSquare className="w-4 h-4 fill-brand-500 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-navy-900 truncate block">
                        {it.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {it.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Payee: {it.payeeName} • Channel: {it.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Right: Amount in BDT */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <span className="font-bold text-slate-500 text-xs">৳</span>
                  <input
                    type="number"
                    disabled={!it.selected}
                    value={it.amount}
                    onChange={(e) => handleAmountChange(idx, e.target.value)}
                    className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-300 font-extrabold text-navy-900 text-xs text-right focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Summary & Generation Button */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-500 block">Total Monthly Overhead to Post:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-navy-900 font-sans">
                ৳{totalAmount.toLocaleString()} BDT
              </span>
              <span className="text-xs font-bold text-brand-600">
                ({selectedItems.length} bills selected)
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 font-bold text-xs transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate & Post {selectedItems.length} Bills</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

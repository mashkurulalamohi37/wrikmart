import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Receipt, Upload, CheckCircle2, AlertCircle, Building, Calendar } from 'lucide-react';

export const AgentPurchaseUpdateModal = ({ order, onClose }) => {
  const { activeAgent, updateOrderPurchase, showToast } = useApp();

  // Initialize state with current order items or defaults
  const [itemsData, setItemsData] = useState(() => {
    return order.items.map(it => ({
      actualPurchasePrice: it.actualPurchasePrice || '',
      mrp: it.mrp || '',
      purchasedFrom: it.purchasedFrom || 'Official Retail Store',
      actualPurchaseCurrency: activeAgent.currency,
      receiptImage: it.receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      notes: it.notes || ''
    }));
  });

  const handleFieldChange = (index, field, value) => {
    const updated = [...itemsData];
    updated[index] = { ...updated[index], [field]: value };
    setItemsData(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Validation: Ensure mandatory purchase price and MRP
    for (let i = 0; i < itemsData.length; i++) {
      if (!itemsData[i].actualPurchasePrice || Number(itemsData[i].actualPurchasePrice) <= 0) {
        showToast(`Please enter a valid Purchase Price for Item #${i + 1}`, 'warning');
        return;
      }
      if (!itemsData[i].mrp || Number(itemsData[i].mrp) <= 0) {
        showToast(`Please enter MRP for Item #${i + 1}`, 'warning');
        return;
      }
    }

    updateOrderPurchase(order.id, itemsData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Purchase Update (Agent)</span>
              <h3 className="font-bold text-navy-900 text-sm">{order.orderNumber}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-6">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span><strong>Mandatory:</strong> Enter the exact <strong>Purchase Price</strong> (what you paid) and official printed <strong>MRP</strong> in {activeAgent.currency} ({activeAgent.symbol}).</span>
          </div>

          {order.items.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-navy-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">Qty: {item.specs.unit} • Size: {item.specs.size}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-navy-900 mb-1">
                    Purchase Price ({activeAgent.symbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemsData[idx].actualPurchasePrice}
                    onChange={(e) => handleFieldChange(idx, 'actualPurchasePrice', e.target.value)}
                    placeholder={`e.g. 6000 ${activeAgent.currency}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-navy-900 mb-1">
                    Printed MRP ({activeAgent.symbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemsData[idx].mrp}
                    onChange={(e) => handleFieldChange(idx, 'mrp', e.target.value)}
                    placeholder={`e.g. 8500 ${activeAgent.currency}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-900 mb-1">Purchased From (Store / Website)</label>
                <input
                  type="text"
                  value={itemsData[idx].purchasedFrom}
                  onChange={(e) => handleFieldChange(idx, 'purchasedFrom', e.target.value)}
                  placeholder="e.g. Nike India Official / Dubai Mall"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Receipt Upload Preview */}
              <div>
                <label className="block text-[11px] font-bold text-navy-900 mb-1">Invoice / Receipt Photo</label>
                <div className="border border-slate-300 rounded-lg p-3 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={itemsData[idx].receiptImage} alt="Receipt" className="w-10 h-10 object-cover rounded border" />
                    <div>
                      <span className="text-xs font-bold text-emerald-600 block">Receipt_Attached.jpg</span>
                      <span className="text-[10px] text-slate-400">VAT & Tax Invoice Verified</span>
                    </div>
                  </div>
                  <button type="button" className="text-xs text-brand-600 font-bold hover:underline">Change</button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Purchase Price & MRP</span>
          </button>
        </form>
      </div>
    </div>
  );
};

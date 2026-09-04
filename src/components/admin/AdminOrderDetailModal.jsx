import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Receipt, 
  TrendingUp, 
  Building2,
  Calendar
} from 'lucide-react';

export const AdminOrderDetailModal = ({ order, onClose }) => {
  const { exchangeRates } = useApp();

  if (!order) return null;

  // Calculate Agent Purchase Cost in BDT
  const targetRate = exchangeRates[order.items[0]?.actualPurchaseCurrency]?.rateToBDT || 1.43;
  const totalPurchaseInForeign = order.items.reduce((sum, it) => sum + Number(it.actualPurchasePrice || 0), 0);
  const totalPurchaseInBDT = Math.round(totalPurchaseInForeign * targetRate);
  
  const grossSellingPrice = order.financials.finalSellingPrice || order.financials.estimatedTotal;
  const estimatedProfit = grossSellingPrice - totalPurchaseInBDT - order.financials.deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Admin 360° Order Details</span>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-navy-900 text-lg">{order.orderNumber}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {order.countryFlag} {order.country}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              title="Print Order Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Top 2 Column Cards: Customer Snapshot & Assigned Agent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Customer Information</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Advance Verified</span>
              </div>
              <p className="font-bold text-navy-900 text-sm">{order.customer.name}</p>
              <p className="text-slate-600">{order.customer.phone} • {order.customer.email}</p>
              <p className="text-slate-600 flex items-start gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{order.customer.address}</span>
              </p>
              {order.customer.note && (
                <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200/60 mt-2 text-[11px]">
                  <strong>Note:</strong> {order.customer.note}
                </p>
              )}
            </div>

            {/* Agent & Hub Logistics Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Agent & Logistics Sourcing</span>
                <span className="text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded text-[10px]">{order.status}</span>
              </div>
              <p className="font-bold text-navy-900 text-sm">Agent: {order.assignedAgentName} ({order.country})</p>
              <p className="text-slate-600">Assigned Hub: <strong className="text-slate-800">{order.hubName || 'Dhaka Main Hub'}</strong></p>
              <p className="text-slate-600">Purchase Deadline: <strong className="text-slate-800">{order.purchaseDeadline || 'N/A'}</strong></p>
              <p className="text-[11px] text-slate-400 pt-1">
                Order Placed At: {order.createdAt}
              </p>
            </div>
          </div>

          {/* Products & Purchase Breakdown Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Order Items ({order.items.length}) & Sourcing Financials
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Specs</th>
                    <th className="p-3">Customer Est.</th>
                    <th className="p-3">Agent Purchase Cost</th>
                    <th className="p-3">Printed MRP</th>
                    <th className="p-3">Store Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border flex-shrink-0" />
                        <div>
                          <span className="font-bold text-navy-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400">Vendor: {item.purchasedFrom || 'Pending'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span>{item.specs.size} / {item.specs.color} (Qty: {item.specs.unit})</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        ৳{item.expectedPrice?.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        {item.actualPurchasePrice ? `${item.actualPurchaseCurrency} ${item.actualPurchasePrice.toLocaleString()}` : <span className="text-amber-600 font-normal">Pending Agent Buy</span>}
                      </td>
                      <td className="p-3 font-semibold text-slate-600">
                        {item.mrp ? `${item.actualPurchaseCurrency} ${item.mrp.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1 font-bold">
                            Link <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation & Profit Breakdown */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Pre-Order Financial Summary & Margin</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer Selling Price:</span>
                <span className="text-base font-bold text-white">৳{grossSellingPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Advance Paid by Customer:</span>
                <span className="text-base font-bold text-emerald-400">৳{order.financials.advancePaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Due to Collect on Delivery:</span>
                <span className="text-base font-bold text-amber-300">৳{order.financials.dueAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Actual Sourcing Cost (BDT):</span>
                <span className="text-base font-bold text-cyan-300">৳{totalPurchaseInBDT.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-sm font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Estimated Gross Margin / Profit:
              </span>
              <span className="text-xl font-extrabold text-emerald-400">
                ৳{estimatedProfit > 0 ? estimatedProfit.toLocaleString() : 'Calculating...'}
              </span>
            </div>
          </div>

          {/* Timeline Audit History */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Order Status Pipeline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {order.timeline.map((step, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${step.done ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${step.done ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{step.step}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

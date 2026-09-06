import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDamageReturnModal } from './AdminDamageReturnModal';
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
  Calendar,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminOrderDetailModal = ({ order, onClose }) => {
  const { exchangeRates } = useApp();
  const [showDamageModal, setShowDamageModal] = useState(false);

  if (!order) return null;

  // Calculate Agent Purchase Cost in BDT
  const targetRate = exchangeRates[order.items[0]?.actualPurchaseCurrency]?.rateToBDT || 1.43;
  const totalPurchaseInForeign = order.items.reduce((sum, it) => sum + Number(it.actualPurchasePrice || 0), 0);
  const totalPurchaseInBDT = Math.round(totalPurchaseInForeign * targetRate);
  
  const grossSellingPrice = order.financials.finalSellingPrice || order.financials.estimatedTotal;
  const estimatedProfit = grossSellingPrice - totalPurchaseInBDT - order.financials.deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Admin 360° Order Details</span>
              <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                order.orderType === 'Stock Product' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'
              }`}>
                {order.orderType || 'Pre-Order'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-navy-900 text-base sm:text-lg">{order.orderNumber}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 inline-flex items-center gap-1.5">
                <CountryFlag country={order.country || order.countryFlag} className="w-4 h-3 rounded-[2px]" />
                <span>{order.country}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={() => setShowDamageModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                order.damageDetails 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Report or Manage Damage/Return"
            >
              {order.status === 'Returned' ? <RotateCcw className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              <span>{order.damageDetails ? 'Manage Incident' : 'Report Damage/Return'}</span>
            </button>

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

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Incident / Damage Alert Banner */}
          {order.damageDetails && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>INCIDENT LOGGED: {order.damageDetails.incidentType}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 text-rose-900">
                  {order.damageDetails.resolutionStatus}
                </span>
              </div>
              <p className="text-rose-800 font-medium">{order.damageDetails.description}</p>
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-rose-700 border-t border-rose-200/60">
                <span>Disposition: <strong>{order.damageDetails.disposition}</strong></span>
                {order.damageDetails.refundAmount > 0 && (
                  <span>Refund Liability: <strong>৳{order.damageDetails.refundAmount.toLocaleString()}</strong></span>
                )}
                {order.damageDetails.proofUrl && (
                  <a href={order.damageDetails.proofUrl} target="_blank" rel="noreferrer" className="font-bold underline flex items-center gap-1 text-rose-900">
                    <ExternalLink className="w-3 h-3" /> View Photo Evidence
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Top 2 Column Cards: Customer Snapshot & Assigned Agent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Customer Information</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                  {order.paymentStatus}
                </span>
              </div>
              <p className="font-bold text-navy-900 text-sm">{order.customer.name}</p>
              <p className="text-slate-600">{order.customer.phone} • {order.customer.email || 'No email'}</p>
              <p className="text-slate-600 flex items-start gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{order.customer.address}, {order.customer.district || 'Dhaka'}</span>
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
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Fulfillment & Logistics</span>
                <span className="text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded text-[10px]">{order.status}</span>
              </div>
              <p className="font-bold text-navy-900 text-sm">
                {order.orderType === 'Stock Product' ? 'Local Fulfillment Team' : `Agent: ${order.assignedAgentName || 'Unassigned'} (${order.country})`}
              </p>
              <p className="text-slate-600">Assigned Hub: <strong className="text-slate-800">{order.hubName || 'Dhaka Main Hub'}</strong></p>
              <p className="text-slate-600">Courier Partner: <strong className="text-slate-800">{order.courierName || 'Steadfast Courier'}</strong></p>
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
            <div className="border border-slate-200 rounded-xl overflow-x-auto no-scrollbar sm:scrollbar-thin">
              <table className="w-full text-left text-xs min-w-[600px]">
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
                          <span className="text-[10px] text-slate-400">{item.brand || 'Original Brand'} • {item.category || 'General'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span>{item.specs.size} / {item.specs.color} (Qty: {item.specs.unit})</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        ৳{item.expectedPrice?.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        {item.actualPurchasePrice ? `${item.actualPurchaseCurrency} ${item.actualPurchasePrice.toLocaleString()}` : <span className="text-amber-600 font-normal">Pending Procurement</span>}
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
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order Financial Summary & Profit Margin</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer Selling Price:</span>
                <span className="text-base font-bold text-white">৳{grossSellingPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Advance Paid:</span>
                <span className="text-base font-bold text-emerald-400">৳{order.financials.advancePaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Due to Collect:</span>
                <span className="text-base font-bold text-amber-300">৳{order.financials.dueAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sourcing Cost (BDT):</span>
                <span className="text-base font-bold text-cyan-300">৳{totalPurchaseInBDT.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-sm font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Estimated Gross Margin / Profit:
              </span>
              <span className={`text-base font-extrabold ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ৳{estimatedProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Damage / Return Modal */}
      {showDamageModal && (
        <AdminDamageReturnModal
          order={order}
          onClose={() => setShowDamageModal(false)}
        />
      )}
    </div>
  );
};

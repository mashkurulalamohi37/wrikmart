import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CountryFlag } from '../common/CountryFlag';
import { 
  X, 
  PackageCheck, 
  ArrowRight, 
  DollarSign, 
  Plane, 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Receipt,
  FileText
} from 'lucide-react';

export const AdminReceiveBDModal = ({ order, onClose }) => {
  const { exchangeRates, receiveOrderInBangladesh, showToast } = useApp();

  if (!order) return null;

  // Determine foreign currency from order country or first item
  const foreignCurrency = order.items?.[0]?.actualPurchaseCurrency || 
    (order.country === 'India' ? 'INR' : order.country === 'Dubai' ? 'AED' : order.country === 'Thailand' ? 'THB' : 'INR');
  
  const defaultRate = exchangeRates?.[foreignCurrency]?.rateToBDT || (foreignCurrency === 'INR' ? 1.43 : foreignCurrency === 'AED' ? 32.5 : 3.55);
  const currencySymbol = exchangeRates?.[foreignCurrency]?.symbol || (foreignCurrency === 'INR' ? '₹' : foreignCurrency === 'AED' ? 'د.إ' : '฿');

  // Local Form State
  const [exchangeRate, setExchangeRate] = useState(defaultRate);
  const [shippingCostBDT, setShippingCostBDT] = useState(order.financials?.shippingCostBDT || 500);
  const [localCourierCostBDT, setLocalCourierCostBDT] = useState(order.financials?.localCourierCostBDT || 120);
  const [courierPartner, setCourierPartner] = useState(order.courierName || 'Steadfast Courier');
  const [condition, setCondition] = useState('Intact & Sealed');
  const [notes, setNotes] = useState('');

  // Editable purchase prices per item in foreign currency
  const [itemPrices, setItemPrices] = useState(() => {
    const initial = {};
    order.items.forEach(it => {
      initial[it.id] = it.actualPurchasePrice ?? Math.round(Number(it.expectedPrice || 0) * 0.75);
    });
    return initial;
  });

  const handlePriceChange = (itemId, val) => {
    setItemPrices(prev => ({ ...prev, [itemId]: val }));
  };

  // Live Calculations
  const totalForeignCost = useMemo(() => {
    return order.items.reduce((sum, it) => {
      const price = Number(itemPrices[it.id] ?? 0);
      const unit = it.specs?.unit || 1;
      return sum + (price * unit);
    }, 0);
  }, [order.items, itemPrices]);

  const convertedCostBDT = Math.round(totalForeignCost * Number(exchangeRate || 0));
  const intlShippingBDT = Number(shippingCostBDT || 0);
  const localDeliveryBDT = Number(localCourierCostBDT || 0);
  const totalLandedCostBDT = convertedCostBDT + intlShippingBDT + localDeliveryBDT;

  const sellingPriceBDT = Number(order.financials?.estimatedTotal || order.financials?.finalSellingPrice || 0);
  const grossProfitBDT = sellingPriceBDT - totalLandedCostBDT;
  const profitMarginPercent = sellingPriceBDT > 0 ? ((grossProfitBDT / sellingPriceBDT) * 100).toFixed(1) : 0;
  const isProfit = grossProfitBDT >= 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!exchangeRate || Number(exchangeRate) <= 0) {
      showToast('Please enter a valid currency exchange rate', 'warning');
      return;
    }

    receiveOrderInBangladesh({
      orderId: order.id,
      exchangeRate: Number(exchangeRate),
      internationalShippingCostBDT: intlShippingBDT,
      localDeliveryCostBDT: localDeliveryBDT,
      courierPartner,
      condition,
      notes,
      itemPurchasePrices: itemPrices
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full my-auto max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-navy-900">Receive in Bangladesh (BD Hub)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Dhaka Central HQ
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Record arrival, verify FX exchange rate & compute exact profit margin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-xs">
          
          {/* Order Overview Strip */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-xs text-navy-900">{order.orderNumber}</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold inline-flex items-center gap-1">
                <CountryFlag country={order.country || order.countryFlag} className="w-3.5 h-2.5 rounded-[1px]" />
                <span>{order.country}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Customer & Destination</span>
              <span className="font-bold text-navy-900">{order.customer?.name} ({order.customer?.district || 'Dhaka'})</span>
            </div>
          </div>

          {/* Section 1: Product Items & Foreign Purchase Price Verification */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-600" />
                <span>Foreign Procurement Cost ({order.items.length} Item{order.items.length > 1 ? 's' : ''})</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">In {foreignCurrency} ({currencySymbol})</span>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-white">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-50" 
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-navy-900 text-xs block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {item.specs?.size} / {item.specs?.color} • Qty: {item.specs?.unit || 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Agent Cost ({currencySymbol}):</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={itemPrices[item.id] ?? ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-full pl-6 pr-2 py-1 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg font-bold text-navy-900 text-right text-xs focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="absolute left-2 top-1 text-slate-400 font-bold">{currencySymbol}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 font-bold text-slate-800 text-xs">
                <span>Total Foreign Procurement:</span>
                <span className="text-emerald-700 font-extrabold">{currencySymbol}{totalForeignCost.toLocaleString()} {foreignCurrency}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Conversion & Freight Cost Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Exchange Rate Input */}
            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 space-y-1">
              <label className="block font-bold text-brand-900 text-[11px]">
                FX Rate (1 {foreignCurrency} = BDT) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-brand-200 rounded-lg font-black text-brand-700 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Converted: <strong>৳{convertedCostBDT.toLocaleString()}</strong>
              </span>
            </div>

            {/* International Shipping / Air Freight */}
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
              <label className="block font-bold text-purple-900 text-[11px] flex items-center gap-1">
                <Plane className="w-3 h-3 text-purple-600" />
                <span>Air Freight & Customs (৳)</span>
              </label>
              <input
                type="number"
                min="0"
                value={shippingCostBDT}
                onChange={(e) => setShippingCostBDT(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg font-bold text-purple-800 text-xs focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-[10px] text-slate-500 block">Intl air cargo fee</span>
            </div>

            {/* Local Delivery Charge */}
            <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 space-y-1">
              <label className="block font-bold text-cyan-900 text-[11px] flex items-center gap-1">
                <Truck className="w-3 h-3 text-cyan-600" />
                <span>Local BD Courier Fee (৳)</span>
              </label>
              <input
                type="number"
                min="0"
                value={localCourierCostBDT}
                onChange={(e) => setLocalCourierCostBDT(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-cyan-200 rounded-lg font-bold text-cyan-800 text-xs focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">Doorstep rider cost</span>
            </div>
          </div>

          {/* Section 3: Courier Partner & Consignment Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Local Courier Partner</label>
              <select
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy-900 bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="Steadfast Courier">Steadfast Courier (Integrated Hub API)</option>
                <option value="Pathao Courier">Pathao Courier</option>
                <option value="RedX Logistics">RedX Logistics</option>
                <option value="Paperfly Express">Paperfly Express</option>
                <option value="Dhaka Hub Self-Pickup">Dhaka Central Hub Self-Pickup</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Shipment Physical Inspection</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy-900 bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="Intact & Sealed">Intact & Sealed (Original Seal Good)</option>
                <option value="Minor Box Wear">Minor Outer Box Wear (Product Safe)</option>
                <option value="Opened & Inspected">Opened & Inspected for Quality Check</option>
              </select>
            </div>
          </div>

          {/* Optional Receiving Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Receiving Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cleared Dhaka customs without extra duty, packaged for delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Real-time Profit & Loss Summary Card */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Real-Time Profit & Loss Analysis
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                isProfit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isProfit ? 'Profitable Sourcing' : 'Margin Deficit / Loss'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Selling Price (BDT):</span>
                <span className="text-sm font-bold text-white">৳{sellingPriceBDT.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Procurement (BDT):</span>
                <span className="text-sm font-bold text-cyan-300">৳{convertedCostBDT.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Air Freight & Courier:</span>
                <span className="text-sm font-bold text-purple-300">৳{(intlShippingBDT + localDeliveryBDT).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Landed Cost:</span>
                <span className="text-sm font-bold text-amber-300">৳{totalLandedCostBDT.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Calculated Gross Profit Margin:
              </span>
              <div className="text-right">
                <span className={`text-base font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ৳{grossProfitBDT.toLocaleString()}
                </span>
                <span className={`text-xs ml-1 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({profitMarginPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Confirm Bangladesh Hub Receipt</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

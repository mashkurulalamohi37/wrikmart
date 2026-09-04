import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ArrowRightLeft, ShieldCheck, CreditCard, Lock, Save } from 'lucide-react';

export const AdminSystemSettings = () => {
  const { exchangeRates, updateExchangeRate, showToast } = useApp();

  const [inrRate, setInrRate] = useState(exchangeRates.INR.rateFromBDT);
  const [aedRate, setAedRate] = useState(exchangeRates.AED.rateFromBDT);
  const [thbRate, setThbRate] = useState(exchangeRates.THB.rateFromBDT);

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateExchangeRate('INR', inrRate);
    updateExchangeRate('AED', aedRate);
    updateExchangeRate('THB', thbRate);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-navy-900">System & Multi-Currency Settings</h2>
        <p className="text-xs text-slate-500">Live exchange rate configuration, payment credentials, and security controls</p>
      </div>

      {/* FX Rates Configuration Box */}
      <form onSubmit={handleSaveRates} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-navy-900 text-sm">Currency Exchange Rates (Base: 1 BDT)</h3>
          </div>
          <span className="text-[10px] text-slate-400">Used for Agent Balance Transfers & Profit Calculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🇮🇳</span>
              <label className="font-bold text-navy-900">1 BDT = Indian Rupee (INR)</label>
            </div>
            <input
              type="number"
              step="0.001"
              value={inrRate}
              onChange={(e) => setInrRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border font-mono font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">1 INR ≈ ৳{(1 / inrRate).toFixed(2)} BDT</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🇦🇪</span>
              <label className="font-bold text-navy-900">1 BDT = UAE Dirham (AED)</label>
            </div>
            <input
              type="number"
              step="0.0001"
              value={aedRate}
              onChange={(e) => setAedRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border font-mono font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">1 AED ≈ ৳{(1 / aedRate).toFixed(2)} BDT</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🇹🇭</span>
              <label className="font-bold text-navy-900">1 BDT = Thai Baht (THB)</label>
            </div>
            <input
              type="number"
              step="0.001"
              value={thbRate}
              onChange={(e) => setThbRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border font-mono font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">1 THB ≈ ৳{(1 / thbRate).toFixed(2)} BDT</span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors shadow flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save FX Rates</span>
        </button>
      </form>

      {/* Role-Based Permissions Summary (Visual Board 1 Screen 15) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="font-bold text-navy-900 text-sm">Role-Based Access Control (RBAC)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Role Name</th>
                <th className="p-3">Active Users</th>
                <th className="p-3">Access Permissions</th>
                <th className="p-3">Customer Privacy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-bold text-navy-900">Super Admin</td>
                <td className="p-3">2</td>
                <td className="p-3 text-emerald-700 font-bold">Full Access (All Modules & Ledgers)</td>
                <td className="p-3 text-slate-500">Full Visibility</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-navy-900">Admin</td>
                <td className="p-3">5</td>
                <td className="p-3 font-semibold">Orders, Hubs, Deliveries, Balance Top-up</td>
                <td className="p-3 text-slate-500">Full Visibility</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-brand-700">Agent (Overseas)</td>
                <td className="p-3">58</td>
                <td className="p-3 font-semibold text-brand-800">Assigned Orders, Purchase Update, Hub Delivery</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    🔒 STRICTLY HIDDEN (Price & Contacts)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

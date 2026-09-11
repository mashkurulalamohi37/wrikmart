import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ArrowRightLeft, ShieldCheck, CreditCard, Lock, Save, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminSystemSettings = () => {
  const { exchangeRates, updateExchangeRate, changeUserPassword, currentUser, showToast } = useApp();

  const [inrRate, setInrRate] = useState(exchangeRates.INR.rateFromBDT);
  const [aedRate, setAedRate] = useState(exchangeRates.AED.rateFromBDT);
  const [thbRate, setThbRate] = useState(exchangeRates.THB.rateFromBDT);

  // Admin Password Management State
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    identifier: currentUser?.email || 'admin@wrikmart.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateExchangeRate('INR', inrRate);
    updateExchangeRate('AED', aedRate);
    updateExchangeRate('THB', thbRate);
  };

  const handleAdminPasswordChange = (e) => {
    e.preventDefault();
    if (!adminPasswordForm.newPassword || adminPasswordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
      showToast('New password and confirm password do not match', 'warning');
      return;
    }

    const res = changeUserPassword({
      identifier: adminPasswordForm.identifier,
      currentPassword: adminPasswordForm.currentPassword,
      newPassword: adminPasswordForm.newPassword,
      confirmPassword: adminPasswordForm.confirmPassword
    });

    if (res?.success) {
      setPasswordSuccess(true);
      setAdminPasswordForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
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
              <CountryFlag country="India" className="w-5 h-3.5 rounded-[2px]" />
              <label className="font-bold text-navy-900">1 BDT = Indian Rupee (INR)</label>
            </div>
            <input
              type="number"
              step="0.001"
              value={inrRate}
              onChange={(e) => setInrRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border font-mono font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              1 INR ≈ ৳{Number(inrRate) > 0 ? (1 / Number(inrRate)).toFixed(2) : '0.00'} BDT
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <CountryFlag country="Dubai" className="w-5 h-3.5 rounded-[2px]" />
              <label className="font-bold text-navy-900">1 BDT = UAE Dirham (AED)</label>
            </div>
            <input
              type="number"
              step="0.0001"
              value={aedRate}
              onChange={(e) => setAedRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border font-mono font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              1 AED ≈ ৳{Number(aedRate) > 0 ? (1 / Number(aedRate)).toFixed(2) : '0.00'} BDT
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <CountryFlag country="Thailand" className="w-5 h-3.5 rounded-[2px]" />
              <label className="font-bold text-navy-900">1 BDT = Thai Baht (THB)</label>
            </div>
            <input
              type="number"
              step="0.001"
              value={thbRate}
              onChange={(e) => setThbRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border font-mono font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              1 THB ≈ ৳{Number(thbRate) > 0 ? (1 / Number(thbRate)).toFixed(2) : '0.00'} BDT
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors shadow flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save FX Rates</span>
        </button>
      </form>

      {/* Admin Security & Password Change Card */}
      <form onSubmit={handleAdminPasswordChange} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-navy-900 text-sm">Administrator Security & Password Management</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            🔒 High Security Zone
          </span>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Admin password updated successfully! Future sign-ins will require this new password.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Account Identifier</label>
            <input
              type="text"
              readOnly
              value={adminPasswordForm.identifier}
              className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 font-medium text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Password (Min. 6 chars) *</label>
            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={adminPasswordForm.newPassword}
                onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="w-full px-3 py-2 pr-9 bg-white rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type={showAdminPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={adminPasswordForm.confirmPassword}
              onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors shadow flex items-center gap-2 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Update Admin Password</span>
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

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ArrowRightLeft, ShieldCheck, CreditCard, Lock, Save, KeyRound, Eye, EyeOff, CheckCircle2, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';
import { DEFAULT_EPS_CONFIG, getEpsAuthToken } from '../../utils/epsPaymentService';

export const AdminSystemSettings = () => {
  const { exchangeRates, updateExchangeRate, changeUserPassword, currentUser, setAdminNav, showToast, epsSettings, updateEpsSettings } = useApp();

  const [inrRate, setInrRate] = useState(exchangeRates.INR.rateFromBDT);
  const [aedRate, setAedRate] = useState(exchangeRates.AED.rateFromBDT);
  const [thbRate, setThbRate] = useState(exchangeRates.THB.rateFromBDT);

  // EPS Payment Gateway Production State
  const [epsForm, setEpsForm] = useState(() => ({
    ...DEFAULT_EPS_CONFIG,
    ...(epsSettings || {})
  }));
  const [epsTesting, setEpsTesting] = useState(false);
  const [epsTestResult, setEpsTestResult] = useState(null);

  useEffect(() => {
    if (epsSettings) {
      setEpsForm(prev => ({ ...prev, ...epsSettings }));
    }
  }, [epsSettings]);

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

  const handleSaveEps = (e) => {
    e.preventDefault();
    if (updateEpsSettings) {
      updateEpsSettings(epsForm);
    }
  };

  const handleTestEpsConnection = async () => {
    setEpsTesting(true);
    setEpsTestResult(null);
    try {
      const token = await getEpsAuthToken(epsForm);
      setEpsTestResult({
        success: true,
        message: `EPS Gateway connected successfully! Live Bearer Token generated (${token.slice(0, 24)}...)`
      });
      showToast('EPS Payment Gateway connection verified!', 'success');
    } catch (err) {
      setEpsTestResult({
        success: false,
        message: err.message || 'Failed to authenticate with EPS API.'
      });
      showToast('EPS Connection Test failed. Verify credentials.', 'error');
    } finally {
      setEpsTesting(false);
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

      {/* Official EPS Payment Gateway Production Settings Card */}
      <form onSubmit={handleSaveEps} className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <img src="/eps/Group 93.png" alt="EPS Gateway" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-navy-900 text-sm">EPS Payment Gateway Integration (Production Grade)</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  epsForm.environment === 'production' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {epsForm.environment === 'production' ? '● Live Production' : '● Sandbox Testing'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Official Bangladesh Bank licensed PSO gateway credentials & API parameters</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestEpsConnection}
              disabled={epsTesting}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${epsTesting ? 'animate-spin' : ''}`} />
              <span>{epsTesting ? 'Testing API...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {epsTestResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
            epsTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {epsTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /> : <ShieldCheck className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
            <span className="font-medium">{epsTestResult.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Gateway Environment</label>
            <select
              value={epsForm.environment}
              onChange={(e) => setEpsForm({ ...epsForm, environment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-bold text-navy-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="production">Production (https://pgapi.eps.com.bd)</option>
              <option value="sandbox">Sandbox Testing (https://sandboxpgapi.eps.com.bd)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Store ID (Live / Merchant)</label>
            <input
              type="text"
              required
              value={epsForm.storeId}
              onChange={(e) => setEpsForm({ ...epsForm, storeId: e.target.value })}
              placeholder="f49c63f4-3c57-495c-ac00-..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Merchant ID</label>
            <input
              type="text"
              value={epsForm.merchantId}
              onChange={(e) => setEpsForm({ ...epsForm, merchantId: e.target.value })}
              placeholder="094980ee-..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">API User Name</label>
            <input
              type="text"
              value={epsForm.userName}
              onChange={(e) => setEpsForm({ ...epsForm, userName: e.target.value })}
              placeholder="xyz.eps@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">API Password</label>
            <input
              type="password"
              value={epsForm.password}
              onChange={(e) => setEpsForm({ ...epsForm, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block font-bold text-slate-700 mb-1">HMAC-SHA512 Hash Key</label>
            <input
              type="text"
              value={epsForm.hashKey}
              onChange={(e) => setEpsForm({ ...epsForm, hashKey: e.target.value })}
              placeholder="Base64 encoded hash key"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Payment Return / Callback Base URL (Optional)</label>
            <input
              type="text"
              value={epsForm.registeredDomain || ''}
              onChange={(e) => setEpsForm({ ...epsForm, registeredDomain: e.target.value })}
              placeholder="e.g. https://wrikmart.com (Leave blank to use current site URL automatically)"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              EPS will redirect customers back to this domain after payment. If left blank, it automatically defaults to the active website address (<code className="font-mono font-bold text-emerald-800">{typeof window !== 'undefined' ? window.location.origin : 'current host'}</code>).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Configured according to EPS Merchant API V4 / V5 Integration Specification.</span>
          </span>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save EPS Settings</span>
          </button>
        </div>
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

      {/* Footer & Storefront CMS Quick Access */}
      <div className="bg-gradient-to-r from-navy-900 to-[#14234B] text-white p-6 rounded-2xl border border-slate-700/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Storefront Content Management</span>
          <h3 className="font-extrabold text-white text-base">Footer & Bangladesh HQ Contact CMS</h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Customize Bangladesh HQ physical address, hotline numbers, support emails, popular store lists, help links, and trust guarantee badges.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdminNav && setAdminNav('footer_cms')}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          <span>Open Footer CMS Editor →</span>
        </button>
      </div>
    </div>
  );
};

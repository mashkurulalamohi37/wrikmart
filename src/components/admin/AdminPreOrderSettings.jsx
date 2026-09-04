import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Copy, Check, Link, Globe, CheckSquare } from 'lucide-react';

export const AdminPreOrderSettings = () => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [countries, setCountries] = useState({
    india: true,
    dubai: true,
    thailand: true
  });
  const [requiredFields, setRequiredFields] = useState({
    name: true,
    whatsapp: true,
    address: true,
    productLinkOrImage: true,
    size: false,
    color: false,
    quantity: true,
    advancePayment: true
  });

  const publicUrl = "https://wrikmart.com/pre-order";

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    showToast("Public Pre-Order Form link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Pre-Order Form Settings & Link Generator</h2>
        <p className="text-xs text-slate-500">Configure the customer-facing online pre-order wizard and enabled countries</p>
      </div>

      {/* Public URL Box (Visual Board 1 Screen 7) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-xs text-navy-900 flex items-center gap-1.5">
            <Link className="w-4 h-4 text-brand-600" />
            <span>Public Customer Pre-Order Link</span>
          </label>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Form Active & Online
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono"
          />
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Enabled Sourcing Countries */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Enabled Sourcing Countries</h3>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { id: 'india', name: 'India 🇮🇳', key: 'india' },
            { id: 'dubai', name: 'Dubai 🇦🇪', key: 'dubai' },
            { id: 'thailand', name: 'Thailand 🇹🇭', key: 'thailand' }
          ].map(c => (
            <label key={c.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={countries[c.key]}
                onChange={(e) => setCountries({ ...countries, [c.key]: e.target.checked })}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="font-bold text-navy-900">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Form Fields Validation Checklist */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Required Pre-Order Form Fields</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {Object.entries(requiredFields).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => setRequiredFields({ ...requiredFields, [key]: e.target.checked })}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="capitalize font-medium text-slate-800">{key.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>

        <button
          onClick={() => showToast("Pre-Order form settings saved successfully!", "success")}
          className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow"
        >
          Save Form Settings
        </button>
      </div>
    </div>
  );
};

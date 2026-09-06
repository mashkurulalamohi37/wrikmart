import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AgentProductLinkModal = ({ order, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!order) return null;

  const handleCopy = (url, index) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Product Sourcing Links</span>
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-1.5 mt-0.5">
              <span>{order.orderNumber} ({order.country})</span>
              <CountryFlag country={order.country || order.countryFlag} className="w-4 h-3 rounded-[2px]" />
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close Product Sourcing Links Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {order.items.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-navy-900">Item #{idx + 1}: {item.name}</h4>
                <span className="text-[11px] font-semibold text-slate-500">Qty: {item.specs.unit}</span>
              </div>

              {/* Product Image */}
              <div className="relative rounded-xl overflow-hidden border bg-white max-h-64 flex items-center justify-center">
                <img src={item.image} alt={item.name} className="object-contain w-full max-h-60" />
              </div>

              {/* Product Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Size:</span>
                  <span className="font-bold text-slate-800">{item.specs.size || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Color:</span>
                  <span className="font-bold text-slate-800">{item.specs.color || 'Standard'}</span>
                </div>
              </div>

              {/* URL & One-Click Copy */}
              {item.url ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Sourcing URL (From Customer)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={item.url}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono truncate select-all"
                    />
                    <button
                      onClick={() => handleCopy(item.url, idx)}
                      className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </>
                      )}
                    </button>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline mt-2"
                  >
                    <span>Open in Store Browser</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No direct URL provided. Please source in local offline retail store using the photo.</p>
              )}

              {item.notes && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-800">
                  <strong>Notes:</strong> {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

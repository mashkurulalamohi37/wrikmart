import React from 'react';
import { useApp } from '../../context/AppContext';
import { History, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';

export const AdminTransitionHistory = () => {
  const { orders } = useApp();

  // Aggregate all timeline entries across all orders
  const allTransitions = orders.flatMap(o => 
    o.timeline.filter(t => t.done).map(t => ({
      orderId: o.orderNumber,
      country: o.country,
      step: t.step,
      time: t.time,
      actor: t.actor,
      note: t.note
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-navy-900">Transition History & Audit Trail (All Orders)</h2>
        <p className="text-xs text-slate-500">Chronological history of every state change, agent purchase, and hub arrival</p>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Country</th>
                <th className="px-5 py-3.5">Lifecycle Event</th>
                <th className="px-5 py-3.5">Updated By / Actor</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allTransitions.map((tr, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-navy-900">{tr.orderId}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{tr.country}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tr.step}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{tr.actor}</td>
                  <td className="px-5 py-3.5 text-slate-500">{tr.time}</td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{tr.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

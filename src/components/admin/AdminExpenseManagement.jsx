import React from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export const AdminExpenseManagement = () => {
  const { expenses, reviewExpense } = useApp();

  const totalExpenseBDT = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Agent Operational Expense Review</h2>
          <p className="text-xs text-slate-500">Approve or dispute agent transport, travel, salary, and petrol bills</p>
        </div>

        <div className="bg-brand-50 border border-brand-200 px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-500 block">Total Claimed Expenses:</span>
          <span className="font-extrabold text-navy-900 text-sm">{expenses.length} Claims</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Expense ID</th>
                <th className="px-5 py-3.5">Agent & Country</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Receipt Voucher</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-navy-900">{exp.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{exp.agentName} ({exp.country})</td>
                  <td className="px-5 py-3.5 font-medium">{exp.category}</td>
                  <td className="px-5 py-3.5 font-bold text-navy-900 text-sm">
                    {exp.symbol}{exp.amount.toLocaleString()} ({exp.currency})
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{exp.date}</td>
                  <td className="px-5 py-3.5">
                    <a
                      href={exp.receiptImage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand-600 font-bold hover:underline"
                    >
                      <span>View Voucher</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      exp.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {exp.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => reviewExpense(exp.id, 'Approved')}
                          className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-bold transition-colors"
                          title="Approve Expense"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => reviewExpense(exp.id, 'Rejected')}
                          className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-bold transition-colors"
                          title="Reject Expense"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

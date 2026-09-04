import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Receipt, CheckCircle, Clock, AlertCircle, Upload, Calendar } from 'lucide-react';

export const AgentExpenseManager = () => {
  const { activeAgent, expenses, addAgentExpense } = useApp();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Travel / Transport',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80'
  });

  const agentExpenses = expenses.filter(e => e.agentId === activeAgent.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    addAgentExpense({
      ...formData,
      amount: Number(formData.amount)
    });

    setFormData({
      category: 'Travel / Transport',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80'
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Expense Management</h2>
          <p className="text-xs text-slate-500">Record daily commute, fuel, packaging and operational costs</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : '+ Add Expense'}</span>
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-brand-300 p-5 shadow-card space-y-4 animate-fade-in">
          <h3 className="font-bold text-xs uppercase tracking-wider text-brand-700">Record New Expense</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Expense Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
              >
                <option value="Travel / Transport">Travel / Transport (Metro, Bus, Taxi)</option>
                <option value="Fuel / Petrol">Fuel / Petrol / Gas</option>
                <option value="Agent Salary / Daily Allowance">Agent Salary / Daily Allowance</option>
                <option value="Packaging & Bubble Wrap">Packaging & Bubble Wrap</option>
                <option value="Food & Refreshment">Food & Refreshment during Sourcing</option>
                <option value="Other Operational">Other Operational Cost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Amount ({activeAgent.symbol} {activeAgent.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder={`e.g. 500 ${activeAgent.currency}`}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Expense Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Description / Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Taxi fare to Select Citywalk Mall for Zara order"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Receipt / Voucher Photo</label>
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={formData.receiptImage} alt="Receipt" className="w-10 h-10 object-cover rounded border" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Fuel_Voucher.jpg</span>
                  <span className="text-[10px] text-slate-400">Attached for admin verification</span>
                </div>
              </div>
              <button type="button" className="text-xs text-brand-600 font-bold hover:underline">Change</button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl shadow text-xs transition-colors"
          >
            Submit Expense for Approval
          </button>
        </form>
      )}

      {/* Expense History List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Expense History ({agentExpenses.length})</h3>
          <span className="text-xs font-bold text-slate-500">
            Total Logged: <strong className="text-navy-900">{activeAgent.symbol}{agentExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {agentExpenses.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">No expenses recorded yet.</p>
          ) : (
            agentExpenses.map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-navy-900">{exp.category}</h4>
                    <p className="text-[11px] text-slate-500">{exp.notes || 'No description'} • {exp.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-navy-900 block">
                    {exp.symbol}{exp.amount.toLocaleString()}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

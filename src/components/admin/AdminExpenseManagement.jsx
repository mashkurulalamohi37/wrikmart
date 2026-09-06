import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  Search, 
  Filter, 
  DollarSign, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  CreditCard,
  Layers,
  Printer
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';
import { AdminHqExpenseModal } from './AdminHqExpenseModal';
import { AdminGenerateMonthlyCostsModal } from './AdminGenerateMonthlyCostsModal';
import { AdminHqVoucherModal } from './AdminHqVoucherModal';

export const AdminExpenseManagement = () => {
  const { 
    expenses, 
    reviewExpense, 
    hqExpenses = [], 
    updateHqExpenseStatus, 
    deleteHqExpense 
  } = useApp();

  // Active Tab: 'hq_costs' | 'agent_claims' | 'analytics'
  const [activeTab, setActiveTab] = useState('hq_costs');

  // Modals
  const [showAddHqModal, setShowAddHqModal] = useState(false);
  const [showGenerateBatchModal, setShowGenerateBatchModal] = useState(false);
  const [selectedVoucherForView, setSelectedVoucherForView] = useState(null);

  // Filters for HQ Expenses
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Calculations
  const totalHqOpex = hqExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const paidHqOpex = hqExpenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pendingHqOpex = hqExpenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pendingHqCount = hqExpenses.filter(e => e.status === 'Pending').length;

  const pendingAgentClaims = expenses.filter(e => e.status === 'Pending').length;
  const totalAgentClaimsCount = expenses.length;

  // Filtered HQ Expenses
  const filteredHqExpenses = hqExpenses.filter(e => {
    const matchesSearch = (
      (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.payeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    'All',
    'Rent & Facilities',
    'Salaries & Payroll',
    'Utilities & Internet',
    'Packaging & Supplies',
    'Marketing & Advertising',
    'Cloud & Software'
  ];

  // Category Breakdown for Analytics Tab
  const categoryTotals = hqExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action CTAs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-navy-900">
              Corporate Expense & Cost Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold text-[10px] border border-brand-200">
              Dhaka HQ & Hubs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dhaka headquarters operating overhead (OPEX), monthly recurring cost generator, and overseas agent claims
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowGenerateBatchModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
            title="Generate standard monthly recurring bills for Dhaka HQ"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Generate Monthly Overhead</span>
          </button>

          <button
            onClick={() => setShowAddHqModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Record HQ Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total HQ OPEX */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total HQ OPEX (BDT)</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-navy-900 font-sans">
              ৳{totalHqOpex.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{hqExpenses.length} Total recorded bills & vouchers</p>
        </div>

        {/* Card 2: Paid Operating Costs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disbursed / Paid</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700 font-sans">
              ৳{paidHqOpex.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {hqExpenses.filter(e => e.status === 'Paid').length} Cleared via Bank & bKash
          </p>
        </div>

        {/* Card 3: Pending / Due Bills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Due / Pending Bills</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-700 font-sans">
              ৳{pendingHqOpex.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {pendingHqCount} Bills awaiting payment approval
          </p>
        </div>

        {/* Card 4: Overseas Agent Claims */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overseas Agent Claims</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-900 font-sans">
              {totalAgentClaimsCount} Claims
            </span>
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            {pendingAgentClaims} Pending overseas reviews
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('hq_costs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hq_costs'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-white hover:text-navy-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 HQ Bangladesh Office OPEX</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'hq_costs' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {hqExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('agent_claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'agent_claims'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-white hover:text-navy-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>🌍 Overseas Agent Claims</span>
          {pendingAgentClaims > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-amber-400 text-navy-950 text-[10px] font-extrabold animate-pulse">
              {pendingAgentClaims} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-white hover:text-navy-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Cost Analytics & Budget</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HQ BANGLADESH OFFICE OPEX                                          */}
      {/* ========================================================================= */}
      {activeTab === 'hq_costs' && (
        <div className="space-y-4">
          
          {/* Controls: Search & Category Filter Pills */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search voucher, title, payee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending / Due</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* HQ Expenses Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5">Voucher ID</th>
                    <th className="px-4 py-3.5">Billing Date</th>
                    <th className="px-4 py-3.5">Expense Title & Dept</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Payee / Beneficiary</th>
                    <th className="px-4 py-3.5">Payment Method</th>
                    <th className="px-4 py-3.5 text-right">Amount (BDT)</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredHqExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                        No HQ office expenses found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredHqExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-navy-900">
                          {exp.id}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <span className="font-bold text-navy-900 block truncate" title={exp.title}>
                            {exp.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {exp.department}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-900 font-medium max-w-[140px] truncate" title={exp.payeeName}>
                          {exp.payeeName}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-700 block truncate max-w-[140px]">
                            {exp.paymentMethod}
                          </span>
                          {exp.paymentReference && (
                            <span className="font-mono text-[10px] text-slate-400 block">
                              Ref: {exp.paymentReference}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-navy-900 text-sm whitespace-nowrap">
                          ৳{Number(exp.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => updateHqExpenseStatus(
                              exp.id, 
                              exp.status === 'Paid' ? 'Pending' : 'Paid',
                              exp.status === 'Pending' ? `PAID-${Date.now().toString().slice(-6)}` : exp.paymentReference
                            )}
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 cursor-pointer ${
                              exp.status === 'Paid' 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Click to toggle Paid / Pending"
                          >
                            {exp.status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedVoucherForView(exp)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-bold transition-colors"
                              title="View & Print Official Payment Voucher"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Voucher</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to void expense ${exp.id}?`)) {
                                  deleteHqExpense(exp.id);
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Expense Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OVERSEAS AGENT CLAIMS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'agent_claims' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">
              Overseas Agent Operational Expense Reimbursement Claims
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Total: {expenses.length} claims submitted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Expense ID</th>
                  <th className="px-5 py-3.5">Agent & Country</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Amount (Foreign)</th>
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
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <CountryFlag country={exp.country} className="w-4 h-3 rounded-xs" />
                        <span>{exp.agentName}</span>
                      </div>
                    </td>
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
                            className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-bold transition-colors cursor-pointer"
                            title="Approve Expense"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => reviewExpense(exp.id, 'Rejected')}
                            className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-bold transition-colors cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HQ COST ANALYTICS & BUDGET                                         */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category-wise Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>HQ Operating Expense by Category</span>
            </h3>

            <div className="space-y-3 pt-2">
              {Object.entries(categoryTotals).map(([cat, amt]) => {
                const pct = totalHqOpex > 0 ? Math.round((amt / totalHqOpex) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-navy-900">৳{amt.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Distribution & Operational Policy */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Dhaka Operating Cost Centers & Policy</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="font-bold text-navy-900 block">Dhaka Banani Corporate Headquarters</span>
                <p className="text-[11px] text-slate-500">
                  Floor 4, House 42, Road 11, Banani. Houses executive management, marketing, software engineering and accounts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="font-bold text-navy-900 block">Tejgaon Central Sorting Warehouse</span>
                <p className="text-[11px] text-slate-500">
                  Bengal Logistics Park, Tejgaon I/A. Receives airport customs air-cargo shipments, inspects quality, and packages for domestic couriers (Steadfast/Pathao).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="font-bold text-navy-900 block">Recurring Billing Workflow</span>
                <p className="text-[11px] text-slate-500">
                  Click the <strong>⚡ Generate Monthly Overhead</strong> button at the start of each calendar month to auto-populate rent, utilities, internet and payroll batches.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddHqModal && (
        <AdminHqExpenseModal onClose={() => setShowAddHqModal(false)} />
      )}

      {showGenerateBatchModal && (
        <AdminGenerateMonthlyCostsModal onClose={() => setShowGenerateBatchModal(false)} />
      )}

      {selectedVoucherForView && (
        <AdminHqVoucherModal 
          voucher={selectedVoucherForView} 
          onClose={() => setSelectedVoucherForView(null)} 
        />
      )}

    </div>
  );
};

export default AdminExpenseManagement;

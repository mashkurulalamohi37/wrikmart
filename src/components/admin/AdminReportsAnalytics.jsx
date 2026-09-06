import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe2, 
  ShoppingBag,
  Receipt, 
  Package, 
  UserCheck, 
  Users, 
  Truck, 
  CreditCard, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ChevronRight, 
  Percent, 
  ShieldCheck, 
  Search, 
  Filter,
  Calendar,
  Sparkles,
  Layers,
  Activity,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminReportsAnalytics = () => {
  const { 
    orders = [], 
    agents = [], 
    hubs = [], 
    inventory = [], 
    expenses = [], 
    hqExpenses = [], 
    balanceTransfers = [], 
    showToast 
  } = useApp();

  // Active Report Module (1 through 10)
  const [activeReport, setActiveReport] = useState('sales');

  // Time Period Filter: 'today' | 'week' | 'month' | 'all'
  const [period, setPeriod] = useState('month');

  // Search States for Tables
  const [searchSales, setSearchSales] = useState('');
  const [searchProfit, setSearchProfit] = useState('');
  const [searchReceivables, setSearchReceivables] = useState('');
  const [searchStock, setSearchStock] = useState('');
  const [searchAgent, setSearchAgent] = useState('');
  const [searchHubs, setSearchHubs] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchLogistics, setSearchLogistics] = useState('');
  const [searchHqExp, setSearchHqExp] = useState('');
  const [searchAgentExp, setSearchAgentExp] = useState('');

  // Period multiplier to simulate time-range metrics realistically
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case 'today': return 0.08;
      case 'week': return 0.28;
      case 'month': return 1.0;
      case 'all': return 2.5;
      default: return 1.0;
    }
  }, [period]);

  const periodDateLabel = useMemo(() => {
    switch (period) {
      case 'today': return 'Today • 6 Sep 2026';
      case 'week': return 'Current Week • 1 Sep – 7 Sep 2026';
      case 'month': return 'Current Month • September 2026';
      case 'all': return 'All Time Cumulative (2025–2026)';
      default: return 'Current Month • September 2026';
    }
  }, [period]);

  // Calculations from Context
  const totalOrdersCount = Math.round(orders.length * (period === 'all' ? 2.4 : (period === 'today' ? 0.2 : (period === 'week' ? 0.45 : 1))));
  const preOrders = orders.filter(o => (o.orderType || 'Pre-Order') === 'Pre-Order');
  const stockOrders = orders.filter(o => o.orderType === 'Stock Product');
  
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Damaged' && o.status !== 'Returned');
  const damagedOrders = orders.filter(o => o.status === 'Damaged');
  const returnedOrders = orders.filter(o => o.status === 'Returned');

  const rawGrossRevenue = orders.reduce((sum, o) => sum + (o.financials?.estimatedTotal || 0), 0);
  const grossRevenue = Math.round(rawGrossRevenue * periodMultiplier);

  const rawAgentPurchaseCost = orders.reduce((sum, o) => sum + (o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75)), 0);
  const totalAgentPurchaseCost = Math.round(rawAgentPurchaseCost * periodMultiplier);

  const rawShippingCost = orders.reduce((sum, o) => sum + (o.financials?.shippingCostBDT || 600), 0);
  const totalShippingCost = Math.round(rawShippingCost * periodMultiplier);

  const rawLocalCourierCost = orders.reduce((sum, o) => sum + (o.financials?.localCourierCostBDT || 120), 0);
  const totalLocalCourierCost = Math.round(rawLocalCourierCost * periodMultiplier);
  
  const totalAgentExpensesAmount = Math.round(expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) * periodMultiplier);
  const totalHqExpensesAmount = Math.round(hqExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) * periodMultiplier);
  const totalExpensesAmount = totalAgentExpensesAmount + totalHqExpensesAmount;
  const totalRefundsAmount = Math.round(damagedOrders.reduce((sum, o) => sum + (o.damageDetails?.refundAmount || 0), 0) * periodMultiplier);

  const grossProfit = grossRevenue - totalAgentPurchaseCost - totalShippingCost - totalLocalCourierCost;
  const netProfit = grossProfit - totalExpensesAmount - totalRefundsAmount;
  const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : '0';
  const netMarginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0';
  const averageOrderValue = orders.length > 0 ? Math.round(rawGrossRevenue / orders.length) : 0;

  // Inventory Calculations
  const stockItems = inventory || [];
  const totalStockQuantity = stockItems.reduce((sum, i) => sum + (i.currentStock || 0), 0);
  const totalStockValue = stockItems.reduce((sum, i) => sum + ((i.currentStock || 0) * (i.costPrice || 0)), 0);
  const lowStockItems = stockItems.filter(i => (i.currentStock || 0) > 0 && (i.currentStock || 0) <= (i.reorderLevel || 5));
  const outOfStockItems = stockItems.filter(i => (i.currentStock || 0) === 0);

  // Customer Analytics
  const customersList = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      const custId = o.customer?.phone || o.customer?.name || 'Unknown';
      if (!map.has(custId)) {
        map.set(custId, {
          name: o.customer?.name || 'Customer',
          phone: o.customer?.phone || 'N/A',
          email: o.customer?.email || '',
          district: o.customer?.district || 'Dhaka',
          ordersCount: 0,
          totalSpent: 0,
          dueAmount: 0,
          isReturning: o.customer?.isReturning
        });
      }
      const c = map.get(custId);
      c.ordersCount += 1;
      c.totalSpent += (o.financials?.estimatedTotal || 0);
      c.dueAmount += (o.financials?.dueAmount || 0);
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const repeatCustomers = customersList.filter(c => c.ordersCount > 1 || c.isReturning);
  const repeatCustomerRate = customersList.length > 0 ? Math.round((repeatCustomers.length / customersList.length) * 100) : 0;
  const repeatSalesAmount = Math.round(orders.filter(o => o.customer?.isReturning).reduce((sum, o) => sum + (o.financials?.estimatedTotal || 0), 0) * periodMultiplier);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
    if (showToast) showToast('Complete analytical dossier formatted for Print/PDF saving!', 'success');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['Report Category', 'Metric Indicator', 'Value (BDT / Count)', 'Audit Notes'];
    const rows = [
      ['Audit Scope', 'Time Period', periodDateLabel, 'Selected date range'],
      ['1. Sales & Orders', 'Gross Revenue', grossRevenue, 'Total billings volume'],
      ['1. Sales & Orders', 'Total Orders Handled', totalOrdersCount, 'Pre-order + Stock'],
      ['1. Sales & Orders', 'Pre-Orders Count', preOrders.length, 'Overseas Sourcing'],
      ['1. Sales & Orders', 'Stock Orders Count', stockOrders.length, 'Dhaka Hub Stock'],
      ['1. Sales & Orders', 'Average Order Value (AOV)', averageOrderValue, 'Per order BDT'],
      ['2. Profit & Financials', 'Product Procurement Cost', totalAgentPurchaseCost, 'Sourced by agents'],
      ['2. Profit & Financials', 'International Air Freight', totalShippingCost, 'Cargo & customs'],
      ['2. Profit & Financials', 'Gross Operating Profit', grossProfit, `${grossMarginPercent}% Gross Margin`],
      ['2. Profit & Financials', 'Net Operating Profit', netProfit, `${netMarginPercent}% Net Margin`],
      ['3. Accounts & Pre-Orders', 'Advance Collected Online', orders.reduce((s, o) => s + (o.financials?.advancePaid || 0), 0), 'bKash/Nagad/Cards'],
      ['3. Accounts & Pre-Orders', 'Due Balance at Doorstep', orders.reduce((s, o) => s + (o.financials?.dueAmount || 0), 0), 'COD to collect'],
      ['4. Stock & Inventory', 'Total Warehouse Units', totalStockQuantity, 'Units in BD Hubs'],
      ['4. Stock & Inventory', 'Total Stock Valuation', totalStockValue, 'At cost price BDT'],
      ['5. Agent Performance', 'Active Sourcing Agents', agents.length, 'India, UAE, Thailand'],
      ['6. Country & Hubs', 'Hub Storage Facilities', hubs.length, 'Operational centers'],
      ['7. Customer Analytics', 'Unique Customers', customersList.length, 'Buyers'],
      ['7. Customer Analytics', 'Repeat Purchase Rate', `${repeatCustomerRate}%`, 'Loyalty velocity'],
      ['8. Delivery & Logistics', 'Courier On-Time Rate', '96.8%', 'Steadfast & Pathao'],
      ['9. Expenses & Payments', 'HQ Bangladesh OPEX', totalHqExpensesAmount, 'Banani Head Office'],
      ['9. Expenses & Payments', 'Overseas Agent Claims', totalAgentExpensesAmount, 'Field claims'],
      ['10. Executive & Growth', 'Month-over-Month Growth', '+22.4%', 'Accelerating sales']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `WrikMart_Complete_10_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Executive Analytics CSV downloaded with all 10 reports!', 'success');
  };

  // 10 Reports grouped into 4 intuitive categories
  const reportGroups = [
    {
      groupName: 'Commercial & Revenue',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      reports: [
        { id: 'sales', num: '1', label: 'Sales & Orders', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
        { id: 'profit', num: '2', label: 'Profit & Financials', icon: <DollarSign className="w-3.5 h-3.5" /> },
        { id: 'receivables', num: '3', label: 'Accounts & Pipeline', icon: <Receipt className="w-3.5 h-3.5" /> },
      ]
    },
    {
      groupName: 'Supply Chain & Logistics',
      icon: <Package className="w-3.5 h-3.5" />,
      reports: [
        { id: 'stock', num: '4', label: 'Stock & Inventory', icon: <Package className="w-3.5 h-3.5" /> },
        { id: 'country_hub', num: '6', label: 'Country & Hubs', icon: <Globe2 className="w-3.5 h-3.5" /> },
        { id: 'logistics', num: '8', label: 'Delivery & Logistics', icon: <Truck className="w-3.5 h-3.5" /> },
      ]
    },
    {
      groupName: 'Team, Clients & OPEX',
      icon: <Users className="w-3.5 h-3.5" />,
      reports: [
        { id: 'agent', num: '5', label: 'Agent Performance', icon: <UserCheck className="w-3.5 h-3.5" /> },
        { id: 'customer', num: '7', label: 'Customer Analytics', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'expenses', num: '9', label: 'Expenses & HQ OPEX', icon: <CreditCard className="w-3.5 h-3.5" /> },
      ]
    },
    {
      groupName: 'Executive',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      reports: [
        { id: 'management', num: '10', label: 'Executive & Growth', icon: <BarChart3 className="w-3.5 h-3.5" /> },
      ]
    }
  ];

  // Flat list for quick navigation
  const allReportsFlat = reportGroups.flatMap(g => g.reports);
  const currentReportObj = allReportsFlat.find(r => r.id === activeReport) || allReportsFlat[0];

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      
      {/* Official Print Header */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black tracking-tight text-black font-sans">
                WrikMart Enterprise
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 border border-black rounded">
                Official Audit
              </span>
            </div>
            <h1 className="text-base font-black text-slate-900 mt-1">
              Report #{currentReportObj.num}: {currentReportObj.label}
            </h1>
            <p className="text-xs text-slate-600">Cross-Border Pre-Order & Ready Stock Commerce Intelligence</p>
          </div>
          <div className="text-right text-xs text-slate-700 space-y-0.5">
            <p><strong>Audit Scope:</strong> {periodDateLabel}</p>
            <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Report Channel:</strong> Admin Operations Console</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. TOP HEADER & AUDIT CONTROLS */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:hidden no-print">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" />
              10-Module Business Intelligence Suite
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {periodDateLabel}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Reports & Financial Analytics Center
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-0.5">
            Complete audited reports covering sales, margins, accounts receivable, warehouse inventory, logistics & HQ OPEX.
          </p>
        </div>

        {/* Action Controls & Period Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end print:hidden">
          {/* Period Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                  period === p.id 
                    ? 'bg-white text-navy-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-slate-300"
            title="Download executive CSV summary"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Export</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 active:scale-98 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-navy-900/10"
            title="Print or Save Official P&L Dossier"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PERSISTENT EXECUTIVE KPI RIBBON */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Gross Sales</span>
          <p className="text-xl sm:text-2xl font-black text-navy-900 mt-1">৳{grossRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% MoM
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Net Profit (Margin)</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">৳{netProfit.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
            {netMarginPercent}% Net ({grossMarginPercent}% Gross)
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Order Volume</span>
          <p className="text-xl sm:text-2xl font-black text-navy-900 mt-1">{totalOrdersCount} Orders</p>
          <span className="text-[11px] text-slate-400 block mt-1">
            {preOrders.length} Pre / {stockOrders.length} Stock
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Warehouse Stock Value</span>
          <p className="text-xl sm:text-2xl font-black text-brand-600 mt-1">৳{totalStockValue.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            {totalStockQuantity} Units on hand
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Doorstep COD Dues</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            ৳{orders.reduce((sum, o) => sum + (o.financials?.dueAmount || 0), 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">To collect upon delivery</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DROPDOWN-TYPE REPORT NAVIGATION BAR */}
      {/* ========================================================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden no-print">
        {/* Left: Dropdown Selector with Category Optgroups */}
        <div className="flex flex-1 items-center gap-2.5 w-full">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex-1 w-full max-w-full sm:max-w-lg relative">
            <label htmlFor="report-dropdown-nav" className="sr-only">Select Report Module</label>
            <select
              id="report-dropdown-nav"
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-brand-400 rounded-xl text-xs sm:text-sm font-black text-navy-900 shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {reportGroups.map((group) => (
                <optgroup key={group.groupName} label={`📁 ${group.groupName}`}>
                  {group.reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      Report #{r.num}: {r.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Step Navigation (Prev / Next) & Quick Indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => {
              const currentIndex = allReportsFlat.findIndex(r => r.id === activeReport);
              const prevIndex = (currentIndex - 1 + allReportsFlat.length) % allReportsFlat.length;
              setActiveReport(allReportsFlat[prevIndex].id);
            }}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-1 hover:border-slate-300 active:scale-98"
            title="Previous Report"
          >
            <span>← Prev</span>
          </button>

          <span className="text-[11px] font-mono font-black text-slate-500 px-2.5 py-2 rounded-lg bg-slate-100 border border-slate-200/60 text-center">
            {currentReportObj.num} / 10
          </span>

          <button
            onClick={() => {
              const currentIndex = allReportsFlat.findIndex(r => r.id === activeReport);
              const nextIndex = (currentIndex + 1) % allReportsFlat.length;
              setActiveReport(allReportsFlat[nextIndex].id);
            }}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-1 hover:border-slate-300 active:scale-98"
            title="Next Report"
          >
            <span>Next →</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SALES & ORDER REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'sales' && (
        <div className="space-y-5 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">{totalOrdersCount}</p>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3" /> +18.4% this month
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Sales (BDT)</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">৳{grossRevenue.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block mt-1">From Pre-orders & Stock</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value (AOV)</span>
              <p className="text-2xl font-extrabold text-cyan-600 mt-1">৳{averageOrderValue.toLocaleString()}</p>
              <span className="text-[11px] text-cyan-600 font-bold block mt-1">Across all categories</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Repeat Customer Sales</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">৳{repeatSalesAmount.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">{repeatCustomerRate}% Repeat Order Rate</span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pre-Order vs Stock Sales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Pre-Order vs Stock Product Sales
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Pre-Order (Overseas)</span>
                    <span className="text-brand-600">{preOrders.length} Orders ({Math.round((preOrders.length / (orders.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(preOrders.length / (orders.length || 1)) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Stock Product (Local Dhaka)</span>
                    <span className="text-purple-600">{stockOrders.length} Orders ({Math.round((stockOrders.length / (orders.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stockOrders.length / (orders.length || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Pipeline Statuses */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Fulfillment Status Distribution
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">Delivered</span>
                  <span className="text-lg font-extrabold text-emerald-700">{completedOrders.length}</span>
                </div>
                <div className="p-2.5 bg-cyan-50 rounded-xl border border-cyan-100">
                  <span className="text-[10px] text-cyan-700 font-bold block">Active / Pending</span>
                  <span className="text-lg font-extrabold text-cyan-700">{pendingOrders.length}</span>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-700 font-bold block">Damaged</span>
                  <span className="text-lg font-extrabold text-rose-700">{damagedOrders.length}</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">Returned</span>
                  <span className="text-lg font-extrabold text-amber-700">{returnedOrders.length}</span>
                </div>
              </div>
            </div>

            {/* Country Sales Share */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Country-wise Sales Volume
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                    <CountryFlag country="India" className="w-4 h-3 rounded-[2px]" />
                    <span>India</span>
                  </span>
                  <span className="font-extrabold text-brand-700">
                    ৳{orders.filter(o => o.country === 'India').reduce((s, o) => s + (o.financials?.estimatedTotal || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                    <CountryFlag country="Dubai" className="w-4 h-3 rounded-[2px]" />
                    <span>Dubai (UAE)</span>
                  </span>
                  <span className="font-extrabold text-brand-700">
                    ৳{orders.filter(o => o.country === 'Dubai').reduce((s, o) => s + (o.financials?.estimatedTotal || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                    <CountryFlag country="Thailand" className="w-4 h-3 rounded-[2px]" />
                    <span>Thailand</span>
                  </span>
                  <span className="font-extrabold text-brand-700">
                    ৳{orders.filter(o => o.country === 'Thailand').reduce((s, o) => s + (o.financials?.estimatedTotal || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category & Product Sales Table with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Category-wise, Brand-wise & Product Sales Performance
                </h3>
                <p className="text-[11px] text-slate-400">All products ordered across channels</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product, category, brand..."
                  value={searchSales}
                  onChange={(e) => setSearchSales(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Product Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Brand</th>
                    <th className="px-5 py-3 text-center">Units Sold</th>
                    <th className="px-5 py-3 text-right">Selling Price (BDT)</th>
                    <th className="px-5 py-3 text-center">Est. Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.flatMap(o => o.items || []).filter(item => {
                    const q = searchSales.toLowerCase().trim();
                    if (!q) return true;
                    return item.name?.toLowerCase().includes(q) ||
                      item.category?.toLowerCase().includes(q) ||
                      item.brand?.toLowerCase().includes(q);
                  }).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{item.name}</td>
                      <td className="px-5 py-3 font-semibold text-slate-600">{item.category || 'General'}</td>
                      <td className="px-5 py-3 text-slate-500">{item.brand || 'Original Brand'}</td>
                      <td className="px-5 py-3 text-center font-bold">{item.specs?.unit || item.quantity || 1}</td>
                      <td className="px-5 py-3 text-right font-bold text-brand-700">৳{(item.expectedPrice || item.sellingPrice || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-center text-emerald-600 font-bold">~22.5%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROFIT & FINANCIAL REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'profit' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Revenue</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">৳{grossRevenue.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block mt-1">Customer billings</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Procurement Cost</span>
              <p className="text-2xl font-extrabold text-cyan-600 mt-1">৳{totalAgentPurchaseCost.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block mt-1">Agent store purchases</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Profit (BDT)</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">৳{grossProfit.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">{grossMarginPercent}% Gross Margin</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Profit (after Overhead)</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">৳{netProfit.toLocaleString()}</p>
              <span className="text-[11px] text-brand-600 font-bold block mt-1">{netMarginPercent}% Net Margin</span>
            </div>
          </div>

          {/* Operating Cost Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Cross-Border Operational Cost Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Agent Sourcing Cost</span>
                <span className="text-base font-bold text-navy-900 mt-1 block">৳{totalAgentPurchaseCost.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Intl. Freight / Air Cargo</span>
                <span className="text-base font-bold text-navy-900 mt-1 block">৳{totalShippingCost.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Domestic BD Courier</span>
                <span className="text-base font-bold text-navy-900 mt-1 block">৳{totalLocalCourierCost.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Overseas Agent Claims</span>
                <span className="text-base font-bold text-purple-700 mt-1 block">৳{totalAgentExpensesAmount.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">HQ Bangladesh OPEX</span>
                <span className="text-base font-bold text-amber-600 mt-1 block">৳{totalHqExpensesAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order-wise Profit Table with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Order-wise Profitability & Margin Ledger
                </h3>
                <p className="text-[11px] text-slate-400">Order by order cost and gross profit calculation</p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order number or customer..."
                  value={searchProfit}
                  onChange={(e) => setSearchProfit(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Order Number</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3 text-right">Customer Selling (BDT)</th>
                    <th className="px-5 py-3 text-right">Agent Cost</th>
                    <th className="px-5 py-3 text-right">Shipping & Courier</th>
                    <th className="px-5 py-3 text-right">Gross Profit</th>
                    <th className="px-5 py-3 text-center">Profit Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.filter(o => {
                    const q = searchProfit.toLowerCase().trim();
                    if (!q) return true;
                    return o.orderNumber?.toLowerCase().includes(q) ||
                      o.customer?.name?.toLowerCase().includes(q);
                  }).map((o) => {
                    const sell = o.financials?.estimatedTotal || 0;
                    const cost = o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75);
                    const ship = (o.financials?.shippingCostBDT || 600) + (o.financials?.localCourierCostBDT || 120);
                    const prof = sell - cost - ship;
                    const margin = sell > 0 ? ((prof / sell) * 100).toFixed(1) : 0;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono font-bold text-navy-900">{o.orderNumber}</td>
                        <td className="px-5 py-3 font-medium text-slate-700">{o.customer?.name}</td>
                        <td className="px-5 py-3 text-right font-bold">৳{sell.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-semibold text-cyan-700">৳{cost.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-slate-600">৳{ship.toLocaleString()}</td>
                        <td className={`px-5 py-3 text-right font-extrabold ${prof >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ৳{prof.toLocaleString()}
                        </td>
                        <td className={`px-5 py-3 text-center font-bold ${prof >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ACCOUNTS RECEIVABLE / PAYABLE & PRE-ORDER REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'receivables' && (
        <div className="space-y-5 animate-fade-in">
          {/* Monthly P&L Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-navy-900">Monthly Receivables, Dues & Agent Floats</h3>
              <span className="text-xs font-bold text-slate-400">{periodDateLabel}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 font-bold block text-[10px] uppercase">Advance Collected (Receivables)</span>
                <span className="text-xl font-extrabold text-emerald-800 mt-1 block">
                  ৳{orders.reduce((sum, o) => sum + (o.financials?.advancePaid || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 block">Collected via bKash / Nagad / Cards</span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-amber-800 font-bold block text-[10px] uppercase">Due Balance to Collect at Doorstep</span>
                <span className="text-xl font-extrabold text-amber-800 mt-1 block">
                  ৳{orders.reduce((sum, o) => sum + (o.financials?.dueAmount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-amber-600 mt-1 block">Payable upon delivery in Bangladesh</span>
              </div>

              <div className="p-3.5 bg-cyan-50 rounded-xl border border-cyan-200">
                <span className="text-cyan-800 font-bold block text-[10px] uppercase">Agent Floating Floats (Payables)</span>
                <span className="text-xl font-extrabold text-cyan-800 mt-1 block">
                  ৳{balanceTransfers.filter(t => t.status === 'Pending').reduce((s, t) => s + Number(t.amountBDT || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-cyan-600 mt-1 block">Pending acceptance by overseas agents</span>
              </div>
            </div>
          </div>

          {/* 9-Stage Pre-Order Pipeline Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Pre-Order Lifecycle & Sourcing Volume
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pre-Orders</span>
                <span className="text-lg font-bold text-navy-900">{preOrders.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Purchase Pending</span>
                <span className="text-lg font-bold text-amber-600">{orders.filter(o => o.status === 'Processing').length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Purchased by Agent</span>
                <span className="text-lg font-bold text-cyan-600">{orders.filter(o => o.status === 'Purchased').length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">In Transit (Air Cargo)</span>
                <span className="text-lg font-bold text-blue-600">{orders.filter(o => o.status === 'Shipped').length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Arrived Bangladesh</span>
                <span className="text-lg font-bold text-purple-600">{orders.filter(o => o.status === 'BD Received' || o.status === 'Ready for Delivery').length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivered</span>
                <span className="text-lg font-bold text-emerald-600">{completedOrders.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg. Fulfillment Time</span>
                <span className="text-lg font-bold text-navy-900">5.4 Days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cancelled / Refunded</span>
                <span className="text-lg font-bold text-rose-600">{damagedOrders.length + returnedOrders.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. STOCK & INVENTORY REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'stock' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Stock Units</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">{totalStockQuantity} Items</p>
              <span className="text-[11px] text-slate-400 block mt-1">In Dhaka & Chittagong</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Stock Valuation</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">৳{totalStockValue.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block mt-1">Cost value in warehouse</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{lowStockItems.length} SKUs</p>
              <span className="text-[11px] text-amber-600 font-bold block mt-1">Needs replenishment</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{outOfStockItems.length} SKUs</p>
              <span className="text-[11px] text-rose-600 font-bold block mt-1">Zero units available</span>
            </div>
          </div>

          {/* Stock Inventory Catalog Table with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Warehouse Stock Inventory, Velocity & Aging Analysis
                </h3>
                <span className="text-[11px] text-slate-400">Aging Thresholds: 30 / 60 / 90 / 180+ Days</span>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search SKU, product title..."
                  value={searchStock}
                  onChange={(e) => setSearchStock(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">SKU & Item Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-center">Current Stock</th>
                    <th className="px-5 py-3 text-right">Stock Value (BDT)</th>
                    <th className="px-5 py-3 text-center">Stock Aging</th>
                    <th className="px-5 py-3 text-center">Velocity</th>
                    <th className="px-5 py-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stockItems.filter(i => {
                    const q = searchStock.toLowerCase().trim();
                    if (!q) return true;
                    return i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q);
                  }).map((item) => {
                    const margin = item.sellingPrice > 0 ? (((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(1) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <span className="font-bold text-navy-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.sku} • {item.warehouse}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-600">{item.category}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`font-bold ${item.currentStock === 0 ? 'text-rose-600' : (item.currentStock <= item.reorderLevel ? 'text-amber-600' : 'text-slate-900')}`}>
                            {item.currentStock} Units
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-brand-700">
                          ৳{((item.currentStock || 0) * (item.costPrice || 0)).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.agingDays > 180 ? 'bg-rose-100 text-rose-700' :
                            item.agingDays > 90 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.agingDays} Days
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.velocity === 'Fast-Moving' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.velocity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-emerald-600">{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. AGENT PERFORMANCE REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'agent' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Agent Procurement Volume, Operating Floats & Efficiency Scorecard
                </h3>
                <p className="text-[11px] text-slate-400">Ground procurement velocity and wallet balances</p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search agent name or country..."
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Agent Name & Country</th>
                    <th className="px-5 py-3 text-right">Operating Balance</th>
                    <th className="px-5 py-3 text-right">Total Sourced (BDT)</th>
                    <th className="px-5 py-3 text-center">Orders Handled</th>
                    <th className="px-5 py-3 text-center">Purchase Success</th>
                    <th className="px-5 py-3 text-center">Avg. Buy Time</th>
                    <th className="px-5 py-3 text-center">Cancellation Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {agents.filter(ag => {
                    const q = searchAgent.toLowerCase().trim();
                    if (!q) return true;
                    return ag.name?.toLowerCase().includes(q) || ag.country?.toLowerCase().includes(q);
                  }).map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 flex items-center gap-2.5">
                        <img src={ag.avatar} alt={ag.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="font-bold text-navy-900 block">{ag.name}</span>
                          <span className="text-[10px] text-slate-400">{ag.flag} {ag.country} ({ag.currency})</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600">
                        {ag.symbol}{ag.balance?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">
                        ৳{ag.totalSpent ? (ag.totalSpent * 1.4).toLocaleString() : '0'}
                      </td>
                      <td className="px-5 py-3 text-center font-bold">
                        {(ag.completedOrders || 0) + (ag.activeOrders || 0)} Orders
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-emerald-600">98.2%</td>
                      <td className="px-5 py-3 text-center text-slate-600 font-medium">4.2 Hours</td>
                      <td className="px-5 py-3 text-center font-bold text-slate-600">1.8%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. COUNTRY / HUB PERFORMANCE */}
      {/* ========================================================= */}
      {activeReport === 'country_hub' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <CountryFlag country="India" className="w-8 h-5.5 rounded-sm shadow-xs border border-slate-200" />
              <h4 className="font-bold text-navy-900 mt-2">India Gateway (Delhi Hub)</h4>
              <p className="text-xs text-slate-500 mt-1">Procurement: 3.8 hrs • Transit: 2.5 days</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between font-bold text-xs">
                <span>Fulfillment Rate:</span>
                <span className="text-emerald-600">97.8%</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <CountryFlag country="Dubai" className="w-8 h-5.5 rounded-sm shadow-xs border border-slate-200" />
              <h4 className="font-bold text-navy-900 mt-2">Dubai Gateway (Al Quoz Hub)</h4>
              <p className="text-xs text-slate-500 mt-1">Procurement: 4.1 hrs • Transit: 3.2 days</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between font-bold text-xs">
                <span>Fulfillment Rate:</span>
                <span className="text-emerald-600">99.1%</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <CountryFlag country="Thailand" className="w-8 h-5.5 rounded-sm shadow-xs border border-slate-200" />
              <h4 className="font-bold text-navy-900 mt-2">Bangkok Logistics Hub</h4>
              <p className="text-xs text-slate-500 mt-1">Procurement: 5.2 hrs • Transit: 3.0 days</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between font-bold text-xs">
                <span>Fulfillment Rate:</span>
                <span className="text-emerald-600">96.4%</span>
              </div>
            </div>
          </div>

          {/* Hub Table with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Staging Facilities, Storage Capacity & Active Packages
                </h3>
                <p className="text-[11px] text-slate-400">Regional warehouse facilities across country networks</p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hub facility or manager..."
                  value={searchHubs}
                  onChange={(e) => setSearchHubs(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Hub Facility</th>
                    <th className="px-5 py-3">Region</th>
                    <th className="px-5 py-3">Manager & Phone</th>
                    <th className="px-5 py-3 text-center">Capacity</th>
                    <th className="px-5 py-3 text-center">Active Packages</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {hubs.filter(hub => {
                    const q = searchHubs.toLowerCase().trim();
                    if (!q) return true;
                    return hub.name?.toLowerCase().includes(q) || hub.country?.toLowerCase().includes(q) || hub.manager?.toLowerCase().includes(q);
                  }).map((hub) => (
                    <tr key={hub.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{hub.name}</td>
                      <td className="px-5 py-3 font-semibold text-slate-600">{hub.country}</td>
                      <td className="px-5 py-3 text-slate-600">{hub.manager} ({hub.phone})</td>
                      <td className="px-5 py-3 text-center font-medium">{hub.capacity} cartons</td>
                      <td className="px-5 py-3 text-center font-bold text-brand-700">{hub.activePackages} pkgs</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {hub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CUSTOMER ANALYTICS */}
      {/* ========================================================= */}
      {activeReport === 'customer' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">{customersList.length}</p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">+24 new this week</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Repeat Purchase Rate</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{repeatCustomerRate}%</p>
              <span className="text-[11px] text-slate-400 block mt-1">High customer retention</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Lifetime Value (CLV)</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">
                ৳{customersList.length > 0 ? Math.round(grossRevenue / customersList.length).toLocaleString() : '0'}
              </p>
              <span className="text-[11px] text-brand-600 font-bold block mt-1">Average per customer</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Due Balance</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                ৳{customersList.reduce((s, c) => s + c.dueAmount, 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">To collect upon delivery</span>
            </div>
          </div>

          {/* Top Customers Leaderboard with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  VIP Customer Leaderboard & Purchase Frequency
                </h3>
                <p className="text-[11px] text-slate-400">Buyers ranked by total order volume and spend</p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Customer Name</th>
                    <th className="px-5 py-3">Contact Phone</th>
                    <th className="px-5 py-3">District</th>
                    <th className="px-5 py-3 text-center">Orders Placed</th>
                    <th className="px-5 py-3 text-right">Total Spent (BDT)</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customersList.filter(c => {
                    const q = searchCustomer.toLowerCase().trim();
                    if (!q) return true;
                    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
                  }).map((cust, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{cust.name}</td>
                      <td className="px-5 py-3 font-mono text-slate-600">{cust.phone}</td>
                      <td className="px-5 py-3 font-medium text-slate-600">{cust.district}</td>
                      <td className="px-5 py-3 text-center font-bold">{cust.ordersCount} Orders</td>
                      <td className="px-5 py-3 text-right font-bold text-brand-700">৳{cust.totalSpent.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.ordersCount > 1 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cust.ordersCount > 1 ? 'VIP Regular' : 'Standard'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. DELIVERY & LOGISTICS REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'logistics' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intl. Air Transit Time</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">3.1 Days</p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">Airport to Dhaka DAC</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BD Last-Mile Delivery</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">1.6 Days</p>
              <span className="text-[11px] text-slate-400 block mt-1">Warehouse to doorstep</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Delivery Rate</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">96.8%</p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">Steadfast & Pathao</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Damaged / Lost Shipments</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{damagedOrders.length}</p>
              <span className="text-[11px] text-rose-600 font-bold block mt-1">Claims filed with cargo</span>
            </div>
          </div>

          {/* Courier Performance Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Courier Partner Logistics Scorecard
                </h3>
                <p className="text-[11px] text-slate-400">Performance across domestic last-mile delivery partners</p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter courier partner..."
                  value={searchLogistics}
                  onChange={(e) => setSearchLogistics(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Courier Partner</th>
                    <th className="px-5 py-3">Total Dispatched</th>
                    <th className="px-5 py-3 text-center">On-Time Rate %</th>
                    <th className="px-5 py-3">Avg Delivery Time</th>
                    <th className="px-5 py-3 text-right">Avg Courier Fee</th>
                    <th className="px-5 py-3 text-center">Return / Damage Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { name: 'Steadfast Courier', count: '186 Consignments', onTime: '97.4%', time: '24 Hours (Inside Dhaka)', fee: '৳120', rate: '0.8%' },
                    { name: 'Pathao Courier', count: '112 Consignments', onTime: '96.1%', time: '36 Hours (All BD)', fee: '৳130', rate: '1.2%' },
                    { name: 'RedX Logistics', count: '64 Consignments', onTime: '95.0%', time: '48 Hours', fee: '৳150', rate: '2.1%' },
                    { name: 'Paperfly', count: '45 Consignments', onTime: '94.8%', time: '48 Hours (District Hubs)', fee: '৳140', rate: '1.5%' },
                  ].filter(c => {
                    const q = searchLogistics.toLowerCase().trim();
                    if (!q) return true;
                    return c.name.toLowerCase().includes(q);
                  }).map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{c.name}</td>
                      <td className="px-5 py-3 font-bold">{c.count}</td>
                      <td className="px-5 py-3 text-center font-bold text-emerald-600">{c.onTime}</td>
                      <td className="px-5 py-3 text-slate-600">{c.time}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">{c.fee}</td>
                      <td className="px-5 py-3 text-center font-semibold text-slate-600">{c.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. EXPENSE & PAYMENT REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'expenses' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total OPEX & Expenses</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">৳{totalExpensesAmount.toLocaleString()}</p>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">
                HQ: ৳{totalHqExpensesAmount.toLocaleString()} | Agent: ৳{totalAgentExpensesAmount.toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HQ Bangladesh OPEX</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">
                ৳{totalHqExpensesAmount.toLocaleString()}
              </p>
              <span className="text-[11px] text-brand-600 font-bold block mt-1">
                {hqExpenses.length} Dhaka Vouchers
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">bKash / Nagad Collections</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                ৳{orders.reduce((sum, o) => sum + (o.financials?.advancePaid || 0), 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">100% Reconciled Advance</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Refunds</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">৳{totalRefundsAmount.toLocaleString()}</p>
              <span className="text-[11px] text-rose-600 font-bold block mt-1">Damaged/Returned claims</span>
            </div>
          </div>

          {/* HQ Bangladesh Office OPEX Log Table with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  HQ Bangladesh Office Operating Expenses (OPEX)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Banani Head Office & Tejgaon Fulfillment Warehouse Monthly Outflows</p>
              </div>
              
              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search voucher, payee, title..."
                  value={searchHqExp}
                  onChange={(e) => setSearchHqExp(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Voucher #</th>
                    <th className="px-5 py-3">Expense Title & Category</th>
                    <th className="px-5 py-3">Payee / Department</th>
                    <th className="px-5 py-3">Payment Channel</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {hqExpenses.filter(exp => {
                    const q = searchHqExp.toLowerCase().trim();
                    if (!q) return true;
                    return exp.title?.toLowerCase().includes(q) ||
                      exp.voucherNo?.toLowerCase().includes(q) ||
                      exp.payee?.toLowerCase().includes(q) ||
                      exp.category?.toLowerCase().includes(q);
                  }).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono font-bold text-brand-600">{exp.voucherNo || exp.id}</td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-navy-900">{exp.title}</p>
                        <p className="text-[10px] text-slate-400">{exp.category}</p>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-600">
                        <p>{exp.payee}</p>
                        <p className="text-[10px] text-slate-400">{exp.department}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-medium">
                        {exp.paymentMethod || 'Bank Transfer'}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">৳{Number(exp.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-500">{exp.date}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                          exp.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {hqExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 italic">No HQ expenses recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overseas Agent Expense Claims Table with Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Overseas Agent Expense Claims (Field Purchases & Travel)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Purchasing agents in India, UAE, and Thailand</p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden no-print">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search agent name or category..."
                  value={searchAgentExp}
                  onChange={(e) => setSearchAgentExp(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Agent</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.filter(exp => {
                    const q = searchAgentExp.toLowerCase().trim();
                    if (!q) return true;
                    return exp.agentName?.toLowerCase().includes(q) || exp.category?.toLowerCase().includes(q);
                  }).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{exp.agentName} ({exp.country})</td>
                      <td className="px-5 py-3 font-semibold text-slate-600">{exp.category}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">{exp.symbol}{exp.amount}</td>
                      <td className="px-5 py-3 text-slate-500">{exp.date}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{exp.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. MANAGEMENT / GROWTH REPORTS */}
      {/* ========================================================= */}
      {activeReport === 'management' && (
        <div className="space-y-5 animate-fade-in">
          {/* Executive Growth Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Month-over-Month (MoM)</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">+22.4%</p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">Accelerating pre-orders</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Year-over-Year (YoY)</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">+142.8%</p>
              <span className="text-[11px] text-slate-400 block mt-1">vs May 2025</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost-to-Revenue Ratio</span>
              <p className="text-2xl font-extrabold text-cyan-600 mt-1">76.8%</p>
              <span className="text-[11px] text-cyan-600 font-bold block mt-1">Healthy unit economics</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Agent Efficiency Score</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">94.5 / 100</p>
              <span className="text-[11px] text-purple-600 font-bold block mt-1">High purchase velocity</span>
            </div>
          </div>

          {/* Strategic Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Most Profitable Region</span>
              <h4 className="text-lg font-extrabold text-navy-900 flex items-center gap-2">
                <CountryFlag country="Dubai" className="w-5 h-3.5 rounded-[2px]" />
                <span>Dubai Central (28.4% Margin)</span>
              </h4>
              <p className="text-xs text-slate-500">Driven by high-ticket electronics (AirPods Max, PlayStation 5, Dyson).</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fastest Sourcing Corridor</span>
              <h4 className="text-lg font-extrabold text-navy-900 flex items-center gap-2">
                <CountryFlag country="India" className="w-5 h-3.5 rounded-[2px]" />
                <span>Delhi Gateway (2.5 Days)</span>
              </h4>
              <p className="text-xs text-slate-500">Short flight transit to Dhaka DAC enables 48-hour turnarounds.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Top Margin Category</span>
              <h4 className="text-lg font-extrabold text-navy-900">💄 Beauty, Skincare & Fragrance</h4>
              <p className="text-xs text-slate-500">Compact cargo volume with premium retail markups averaging 34%.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

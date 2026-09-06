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
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ChevronRight, 
  Percent, 
  ShieldCheck, 
  Search, 
  Filter,
  Calendar,
  Layers,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  HelpCircle,
  Activity,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  FileText
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
  
  // 5 Streamlined Primary Modules
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sales_profit' | 'inventory' | 'financials' | 'logistics_agents'
  
  // Period Filter: 'today' | 'week' | 'month' | 'all'
  const [period, setPeriod] = useState('month');

  // Search & Filter States across tabs
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  const [stockSearch, setStockSearch] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('all');
  const [stockVelocityFilter, setStockVelocityFilter] = useState('all');

  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseTab, setExpenseTab] = useState('hq'); // 'hq' | 'agent'

  const [customerSearch, setCustomerSearch] = useState('');

  // Period multiplier to simulate time-range metrics realistically
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case 'today': return 0.08;
      case 'week': return 0.28;
      case 'month': return 1.0;
      case 'all': return 2.6;
      default: return 1.0;
    }
  }, [period]);

  const periodDateLabel = useMemo(() => {
    switch (period) {
      case 'today': return 'Today • 6 Sep 2026';
      case 'week': return 'Current Week • 1 Sep – 7 Sep 2026';
      case 'month': return 'Current Month • September 2026';
      case 'all': return 'All Time Cumulative • 2025–2026';
      default: return 'Current Month • September 2026';
    }
  }, [period]);

  // Base Calculations from Context
  const totalOrdersCount = Math.round(orders.length * (period === 'all' ? 2.4 : (period === 'today' ? 0.2 : (period === 'week' ? 0.45 : 1))));
  const basePreOrders = orders.filter(o => (o.orderType || 'Pre-Order') === 'Pre-Order');
  const baseStockOrders = orders.filter(o => o.orderType === 'Stock Product');
  
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
  const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : 0;
  const netMarginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;
  const averageOrderValue = orders.length > 0 ? Math.round(rawGrossRevenue / orders.length) : 0;

  const totalAdvancePaid = Math.round(orders.reduce((sum, o) => sum + (o.financials?.advancePaid || 0), 0) * periodMultiplier);
  const totalDueAmount = Math.round(orders.reduce((sum, o) => sum + (o.financials?.dueAmount || 0), 0) * periodMultiplier);
  const pendingAgentTransfersBDT = balanceTransfers.filter(t => t.status === 'Pending').reduce((s, t) => s + Number(t.amountBDT || 0), 0);

  // Inventory Calculations
  const stockItems = inventory || [];
  const totalStockQuantity = stockItems.reduce((sum, i) => sum + (i.currentStock || 0), 0);
  const totalStockValue = stockItems.reduce((sum, i) => sum + ((i.currentStock || 0) * (i.costPrice || 0)), 0);
  const lowStockItems = stockItems.filter(i => (i.currentStock || 0) > 0 && (i.currentStock || 0) <= (i.reorderLevel || 5));
  const outOfStockItems = stockItems.filter(i => (i.currentStock || 0) === 0);

  // Stock Aging Breakdown
  const agingFresh = stockItems.filter(i => (i.agingDays || 0) <= 30);
  const agingMid = stockItems.filter(i => (i.agingDays || 0) > 30 && (i.agingDays || 0) <= 90);
  const agingSlow = stockItems.filter(i => (i.agingDays || 0) > 90 && (i.agingDays || 0) <= 180);
  const agingCritical = stockItems.filter(i => (i.agingDays || 0) > 180);

  // Customer Analytics Map
  const customersList = useMemo(() => {
    const customerMap = new Map();
    orders.forEach(o => {
      const custId = o.customer?.phone || o.customer?.name || 'Unknown';
      if (!customerMap.has(custId)) {
        customerMap.set(custId, {
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
      const c = customerMap.get(custId);
      c.ordersCount += 1;
      c.totalSpent += (o.financials?.estimatedTotal || 0);
      c.dueAmount += (o.financials?.dueAmount || 0);
    });
    return Array.from(customerMap.values());
  }, [orders]);

  const repeatCustomers = customersList.filter(c => c.ordersCount > 1 || c.isReturning);
  const repeatCustomerRate = customersList.length > 0 ? Math.round((repeatCustomers.length / customersList.length) * 100) : 0;
  const customerLTV = customersList.length > 0 ? Math.round(rawGrossRevenue / customersList.length) : 0;

  // Monthly Trend Chart Data (Interactive Pure CSS)
  const monthlyData = [
    { month: 'Dec 25', revenue: 620000, profit: 124000, orders: 48 },
    { month: 'Jan 26', revenue: 780000, profit: 168000, orders: 62 },
    { month: 'Feb 26', revenue: 890000, profit: 195000, orders: 74 },
    { month: 'Mar 26', revenue: 1120000, profit: 248000, orders: 95 },
    { month: 'Apr 26', revenue: 1350000, profit: 302000, orders: 114 },
    { month: 'May 26', revenue: grossRevenue || 1480000, profit: netProfit || 335000, orders: orders.length || 128 },
  ];
  const maxMonthlyRev = Math.max(...monthlyData.map(d => d.revenue));

  // Filtered Orders for Sales & Profit Ledger
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = orderSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.country?.toLowerCase().includes(q);

      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const matchesType = orderTypeFilter === 'all' || 
        (orderTypeFilter === 'Pre-Order' && (o.orderType || 'Pre-Order') === 'Pre-Order') ||
        (orderTypeFilter === 'Stock Product' && o.orderType === 'Stock Product');

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, orderSearch, orderStatusFilter, orderTypeFilter]);

  // Filtered Inventory
  const filteredStock = useMemo(() => {
    return stockItems.filter(i => {
      const q = stockSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.warehouse?.toLowerCase().includes(q);

      const matchesCategory = stockCategoryFilter === 'all' || i.category === stockCategoryFilter;
      const matchesVelocity = stockVelocityFilter === 'all' || i.velocity === stockVelocityFilter;

      return matchesSearch && matchesCategory && matchesVelocity;
    });
  }, [stockItems, stockSearch, stockCategoryFilter, stockVelocityFilter]);

  // Unique Categories from Inventory
  const stockCategories = useMemo(() => {
    const cats = new Set(stockItems.map(i => i.category).filter(Boolean));
    return Array.from(cats);
  }, [stockItems]);

  // Filtered HQ Expenses
  const filteredHqExpenses = useMemo(() => {
    const q = expenseSearch.toLowerCase().trim();
    if (!q) return hqExpenses;
    return hqExpenses.filter(e => 
      e.title?.toLowerCase().includes(q) ||
      e.voucherNo?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q) ||
      e.payee?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  }, [hqExpenses, expenseSearch]);

  // Filtered Agent Expenses
  const filteredAgentExpenses = useMemo(() => {
    const q = expenseSearch.toLowerCase().trim();
    if (!q) return expenses;
    return expenses.filter(e => 
      e.agentName?.toLowerCase().includes(q) ||
      e.country?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q) ||
      e.notes?.toLowerCase().includes(q)
    );
  }, [expenses, expenseSearch]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customersList;
    return customersList.filter(c => 
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q)
    );
  }, [customersList, customerSearch]);

  // Print Handler
  const handlePrint = () => {
    window.print();
    if (showToast) {
      showToast('Executive Financial & Analytics Dossier prepared for printing/PDF saving!', 'success');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Report Group', 'Indicator / Metric', 'Value', 'Unit / Benchmark'];
    const rows = [
      ['Executive Summary', 'Selected Audit Period', periodDateLabel, 'Filter scope'],
      ['Executive Summary', 'Gross Sales Revenue', grossRevenue, 'BDT'],
      ['Executive Summary', 'Net Comprehensive Profit', netProfit, 'BDT'],
      ['Executive Summary', 'Gross Profit Margin', `${grossMarginPercent}%`, 'Markup velocity'],
      ['Executive Summary', 'Net Profit Margin', `${netMarginPercent}%`, 'After OPEX & Cargo'],
      ['Executive Summary', 'Total Orders Handled', totalOrdersCount, 'Pre-order + Stock'],
      ['Executive Summary', 'Average Order Value (AOV)', averageOrderValue, 'BDT per order'],
      ['Financial Breakdown', 'Product Sourcing Cost (Agents)', totalAgentPurchaseCost, 'BDT'],
      ['Financial Breakdown', 'International Air Freight', totalShippingCost, 'BDT'],
      ['Financial Breakdown', 'Domestic Courier Logistics', totalLocalCourierCost, 'BDT'],
      ['Financial Breakdown', 'HQ Bangladesh OPEX', totalHqExpensesAmount, 'BDT'],
      ['Financial Breakdown', 'Overseas Agent Claims', totalAgentExpensesAmount, 'BDT'],
      ['Financial Breakdown', 'Advance Collected Online', totalAdvancePaid, 'BDT via MFS/Cards'],
      ['Financial Breakdown', 'Outstanding Doorstep Dues', totalDueAmount, 'BDT to collect'],
      ['Ready Stock Warehouse', 'Warehouse Units on Hand', totalStockQuantity, 'Units in BD'],
      ['Ready Stock Warehouse', 'Warehouse Valuation (Cost)', totalStockValue, 'BDT'],
      ['Ready Stock Warehouse', 'Low Stock Alert SKUs', lowStockItems.length, 'SKUs ≤ Reorder Level'],
      ['Customer Intelligence', 'Total Unique Customers', customersList.length, 'Buyers'],
      ['Customer Intelligence', 'Customer Lifetime Value (CLV)', customerLTV, 'BDT per customer'],
      ['Customer Intelligence', 'Repeat Purchase Rate', `${repeatCustomerRate}%`, 'Retention metric']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WrikMart_Executive_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Complete Analytics CSV Exported Successfully!', 'success');
  };

  // Tab definitions
  const tabs = [
    { 
      id: 'overview', 
      label: 'Executive Pulse & Trends', 
      shortLabel: 'Overview', 
      icon: <BarChart3 className="w-4 h-4" />,
      badge: '6-Mo Trends'
    },
    { 
      id: 'sales_profit', 
      label: 'Sales & Profitability', 
      shortLabel: 'Sales & Profit', 
      icon: <TrendingUp className="w-4 h-4" />,
      badge: `${filteredOrders.length} Orders`
    },
    { 
      id: 'inventory', 
      label: 'Ready Stock & Inventory', 
      shortLabel: 'Inventory Health', 
      icon: <Package className="w-4 h-4" />,
      badge: `${totalStockQuantity} Units`
    },
    { 
      id: 'financials', 
      label: 'P&L, OPEX & Cashflow', 
      shortLabel: 'P&L & OPEX', 
      icon: <Receipt className="w-4 h-4" />,
      badge: 'Audited'
    },
    { 
      id: 'logistics_agents', 
      label: 'Global Sourcing & Logistics', 
      shortLabel: 'Sourcing & Logistics', 
      icon: <Globe2 className="w-4 h-4" />,
      badge: `${agents.length} Agents`
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & AUDIT CONTROLS */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" />
              Executive Intelligence Suite
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {periodDateLabel}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Reports & Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Real-time cross-border procurement margins, Bangladesh ready stock turnover, operating cashflow & fulfillment metrics.
          </p>
        </div>

        {/* Action Controls & Period Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end print:hidden">
          {/* Period Selector Tabs */}
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

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs hover:border-slate-300"
            title="Export analytical dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Export</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 active:scale-98 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-navy-900/10"
            title="Print or Save Report as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PERSISTENT TOP EXECUTIVE KPI RIBBON */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Gross Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-brand-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Gross Sales</span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-navy-900">৳{grossRevenue.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18.4% MoM
            </span>
            <span className="text-slate-400 font-medium">{totalOrdersCount} orders</span>
          </div>
        </div>

        {/* KPI 2: Net Profit & Margins */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Net Profit</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">৳{netProfit.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
              {netMarginPercent}% Net
            </span>
            <span className="text-slate-500 font-semibold">{grossMarginPercent}% Gross</span>
          </div>
        </div>

        {/* KPI 3: Order Sourcing Split */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Fulfillment Split</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-navy-900">
            {basePreOrders.length} <span className="text-xs text-slate-400 font-medium">Pre</span> / {baseStockOrders.length} <span className="text-xs text-slate-400 font-medium">Stock</span>
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-brand-600 font-bold">
              {Math.round((basePreOrders.length / (orders.length || 1)) * 100)}% Cross-Border
            </span>
            <span className="text-purple-600 font-bold">
              {Math.round((baseStockOrders.length / (orders.length || 1)) * 100)}% BD Hub
            </span>
          </div>
        </div>

        {/* KPI 4: Stock Asset Valuation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Ready Stock Value</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-navy-900">৳{totalStockValue.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-600 font-bold">{totalStockQuantity} units on hand</span>
            {lowStockItems.length > 0 ? (
              <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> {lowStockItems.length} Low
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">Optimal</span>
            )}
          </div>
        </div>

        {/* KPI 5: Doorstep Receivables */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Doorstep COD Dues</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-navy-900">৳{totalDueAmount.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-500 font-medium">To collect at delivery</span>
            <span className="text-emerald-600 font-bold">100% Verified</span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. STREAMLINED 5-TAB PRIMARY NAVIGATION */}
      {/* ========================================================= */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-1.5 overflow-x-auto scrollbar-thin print:hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center min-w-[170px] ${
                isActive
                  ? 'bg-navy-900 text-white shadow-md shadow-navy-900/15'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-navy-900'
              }`}
            >
              <span className={`${isActive ? 'text-brand-400' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE PULSE & 6-MONTH TRENDS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Row 1: Interactive Monthly Revenue & Profit Chart + Strategic Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual 6-Month Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-600" />
                    6-Month Growth Trajectory & Net Margin Velocity
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dual revenue vs profit breakdown across rolling billing cycles</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-sm bg-brand-500"></span> Gross Revenue
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Net Profit
                  </span>
                </div>
              </div>

              {/* Pure CSS Bar Chart */}
              <div className="pt-6 pb-2">
                <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2">
                  {monthlyData.map((d, i) => {
                    const revHeight = Math.round((d.revenue / maxMonthlyRev) * 100);
                    const profHeight = Math.round((d.profit / maxMonthlyRev) * 100);
                    const isLatest = i === monthlyData.length - 1;

                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        
                        {/* Hover Tooltip Value */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none mb-1 text-center whitespace-nowrap z-10">
                          <p className="text-brand-300">Rev: ৳{(d.revenue / 1000).toFixed(0)}k</p>
                          <p className="text-emerald-400">Net: ৳{(d.profit / 1000).toFixed(0)}k ({Math.round((d.profit / d.revenue) * 100)}%)</p>
                        </div>

                        {/* Dual Bars */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-full max-h-[160px]">
                          {/* Revenue Bar */}
                          <div 
                            style={{ height: `${revHeight}%` }}
                            className={`w-full max-w-[22px] rounded-t-md transition-all duration-500 ${
                              isLatest 
                                ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-md shadow-brand-500/20' 
                                : 'bg-slate-200 group-hover:bg-brand-400'
                            }`}
                          />
                          {/* Profit Bar */}
                          <div 
                            style={{ height: `${profHeight}%` }}
                            className={`w-full max-w-[22px] rounded-t-md transition-all duration-500 ${
                              isLatest 
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20' 
                                : 'bg-emerald-200 group-hover:bg-emerald-400'
                            }`}
                          />
                        </div>

                        {/* Month Label */}
                        <span className={`text-[11px] font-bold ${isLatest ? 'text-brand-700 font-extrabold' : 'text-slate-500'}`}>
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Footnote Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Monthly Sales</span>
                  <strong className="text-navy-900 font-extrabold">৳1,040,000</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Peak Net Margin</span>
                  <strong className="text-emerald-600 font-extrabold">22.8% (May 26)</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">YoY Growth</span>
                  <strong className="text-brand-600 font-extrabold">+142.8%</strong>
                </div>
              </div>
            </div>

            {/* Strategic Highlights & Key Ratios */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Strategic Intelligence & Core Ratios
                </h3>
                
                <div className="space-y-3.5 mt-4 text-xs">
                  
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-bold text-navy-900 block">Customer Lifetime Value (CLV)</span>
                      <span className="text-[10px] text-slate-400">Average historical billing per client</span>
                    </div>
                    <span className="text-sm font-extrabold text-brand-600">৳{customerLTV.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-bold text-navy-900 block">Repeat Purchase Rate</span>
                      <span className="text-[10px] text-slate-400">{repeatCustomers.length} of {customersList.length} clients</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600">{repeatCustomerRate}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-bold text-navy-900 block">Average Order Value (AOV)</span>
                      <span className="text-[10px] text-slate-400">Blended across stock & pre-orders</span>
                    </div>
                    <span className="text-sm font-extrabold text-cyan-600">৳{averageOrderValue.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-bold text-navy-900 block">End-to-End Fulfillment Time</span>
                      <span className="text-[10px] text-slate-400">From customer deposit to doorstep</span>
                    </div>
                    <span className="text-sm font-extrabold text-purple-600">5.4 Days</span>
                  </div>

                </div>
              </div>

              {/* Quick Strategic Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 text-xs text-brand-900">
                <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-brand-700">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Margin Corridor: Dubai UAE
                </span>
                <p className="text-[11px] text-brand-800/80 mt-1">
                  Dubai electronics and fragrances generate <strong>28.4% gross margin</strong> with high customer repeat frequency.
                </p>
              </div>
            </div>

          </div>

          {/* Row 2: Operational Health Cards (Inventory Alert, Logistics, Receivables) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Health 1: Stock Inventory */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  Dhaka Warehouse Health
                </span>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-0.5"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-navy-900">{totalStockQuantity} Units</p>
                  <p className="text-xs text-slate-400">Valuation: ৳{totalStockValue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    lowStockItems.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {lowStockItems.length > 0 ? `${lowStockItems.length} Low Stock SKUs` : 'Stock Healthy'}
                  </span>
                </div>
              </div>

              {/* Progress bar of aging */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Fresh Stock (≤30d): {agingFresh.length}</span>
                  <span>Aging (&gt;90d): {agingSlow.length + agingCritical.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(agingFresh.length / (stockItems.length || 1)) * 100}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${(agingMid.length / (stockItems.length || 1)) * 100}%` }} className="bg-blue-400" />
                  <div style={{ width: `${(agingSlow.length / (stockItems.length || 1)) * 100}%` }} className="bg-amber-400" />
                  <div style={{ width: `${(agingCritical.length / (stockItems.length || 1)) * 100}%` }} className="bg-rose-500" />
                </div>
              </div>
            </div>

            {/* Health 2: Cash Flow & Receivables */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-500" />
                  Cashflow & Receivables
                </span>
                <button 
                  onClick={() => setActiveTab('financials')}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-0.5"
                >
                  View P&L <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-navy-900">৳{totalAdvancePaid.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-bold">Advance Collected (MFS/Cards)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-600">৳{totalDueAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Pending Doorstep COD</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Agent Floating Balances:</span>
                <strong className="text-navy-900">৳{pendingAgentTransfersBDT.toLocaleString()}</strong>
              </div>
            </div>

            {/* Health 3: Courier Partner Scorecard */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  Courier Logistics Velocity
                </span>
                <button 
                  onClick={() => setActiveTab('logistics_agents')}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-0.5"
                >
                  Logistics Matrix <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-emerald-600">96.8%</p>
                  <p className="text-xs text-slate-400">On-Time Arrival Rate</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
                    1.6 Days Avg
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Top Delivery Partner:</span>
                <strong className="text-navy-900">Steadfast Courier (97.4%)</strong>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SALES, REVENUE & ORDER PROFITABILITY */}
      {/* ========================================================= */}
      {activeTab === 'sales_profit' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Row: Channel Breakdown & Country Sales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Channel Comparison */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                Channel Volume Split
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Pre-Order (Overseas Corridors)</span>
                    <span className="text-brand-600">{basePreOrders.length} Orders ({Math.round((basePreOrders.length / (orders.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(basePreOrders.length / (orders.length || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Ready Stock (Local Dhaka Hub)</span>
                    <span className="text-purple-600">{baseStockOrders.length} Orders ({Math.round((baseStockOrders.length / (orders.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(baseStockOrders.length / (orders.length || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Fulfillment Status Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Fulfillment Status Funnel
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">Delivered</span>
                  <span className="text-lg font-extrabold text-emerald-700">{completedOrders.length}</span>
                </div>
                <div className="p-2.5 bg-cyan-50 rounded-xl border border-cyan-100">
                  <span className="text-[10px] text-cyan-700 font-bold block">In Pipeline</span>
                  <span className="text-lg font-extrabold text-cyan-700">{pendingOrders.length}</span>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-700 font-bold block">Damaged Claims</span>
                  <span className="text-lg font-extrabold text-rose-700">{damagedOrders.length}</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">Returned</span>
                  <span className="text-lg font-extrabold text-amber-700">{returnedOrders.length}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Country Sales Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-600" />
                Country Sourcing Volume
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { country: 'India', flag: 'India', name: 'India (Delhi Gateway)' },
                  { country: 'Dubai', flag: 'Dubai', name: 'Dubai (UAE Al Quoz)' },
                  { country: 'Thailand', flag: 'Thailand', name: 'Thailand (Bangkok)' },
                ].map(c => {
                  const countryRev = orders.filter(o => o.country === c.country).reduce((s, o) => s + (o.financials?.estimatedTotal || 0), 0);
                  const countryOrders = orders.filter(o => o.country === c.country).length;
                  return (
                    <div key={c.country} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <span className="font-bold text-slate-800 inline-flex items-center gap-1.5">
                        <CountryFlag country={c.flag} className="w-4 h-3 rounded-[2px]" />
                        <span>{c.name}</span>
                      </span>
                      <div className="text-right">
                        <span className="font-extrabold text-brand-700 block">৳{countryRev.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{countryOrders} orders</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Searchable Order-wise Profit & Margin Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            
            {/* Table Header & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Order-wise Profitability & Margin Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search order, customer, country..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Channels</option>
                  <option value="Pre-Order">Pre-Orders Only</option>
                  <option value="Stock Product">Stock Products Only</option>
                </select>

                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Processing">Processing</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Shipped">In Transit</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Order Number</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Channel / Country</th>
                    <th className="px-5 py-3.5 text-right">Selling Price</th>
                    <th className="px-5 py-3.5 text-right">Sourcing Cost</th>
                    <th className="px-5 py-3.5 text-right">Logistics / Courier</th>
                    <th className="px-5 py-3.5 text-right">Gross Profit</th>
                    <th className="px-5 py-3.5 text-center">Margin %</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.map((o) => {
                    const sell = o.financials?.estimatedTotal || 0;
                    const cost = o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75);
                    const ship = (o.financials?.shippingCostBDT || 600) + (o.financials?.localCourierCostBDT || 120);
                    const prof = sell - cost - ship;
                    const margin = sell > 0 ? ((prof / sell) * 100).toFixed(1) : 0;
                    const isPreOrder = (o.orderType || 'Pre-Order') === 'Pre-Order';

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-navy-900 block">{o.orderNumber}</span>
                          <span className="text-[10px] text-slate-400">{o.createdAt}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-navy-900 block">{o.customer?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{o.customer?.phone}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <CountryFlag country={o.country || 'Bangladesh'} className="w-3.5 h-2.5 rounded-[2px]" />
                            <span className="font-medium text-slate-700">{o.country || 'BD Hub'}</span>
                          </div>
                          <span className={`inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded ${
                            isPreOrder ? 'bg-brand-50 text-brand-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {isPreOrder ? 'Overseas Pre-Order' : 'Ready Stock'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-900">
                          ৳{sell.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-cyan-700">
                          ৳{cost.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-600">
                          ৳{ship.toLocaleString()}
                        </td>
                        <td className={`px-5 py-3.5 text-right font-black ${
                          prof >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          ৳{prof.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            prof >= 0 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}>
                            {margin}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'Damaged' ? 'bg-rose-100 text-rose-800' :
                            o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        No orders match your filter criteria. Try resetting search or status filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: READY STOCK & WAREHOUSE INVENTORY */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Stock Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Stock Units</span>
              <p className="text-2xl font-black text-navy-900 mt-1">{totalStockQuantity} Items</p>
              <span className="text-[11px] text-slate-400 block mt-1">Across Dhaka & Chittagong Hubs</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Warehouse Cost Valuation</span>
              <p className="text-2xl font-black text-brand-600 mt-1">৳{totalStockValue.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block mt-1">At wholesale cost price</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Low Stock Warnings</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{lowStockItems.length} SKUs</p>
              <span className="text-[11px] text-amber-600 font-bold block mt-1">Stock ≤ Reorder Level</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{outOfStockItems.length} SKUs</p>
              <span className="text-[11px] text-rose-600 font-bold block mt-1">Immediate replenishment required</span>
            </div>
          </div>

          {/* Aging Analysis Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  Warehouse Inventory Aging & Turnover Velocity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Classification by storage days in Bangladesh fulfillment center</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                4-Stage Aging Model
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">Fresh Stock (0–30 Days)</span>
                <p className="text-xl font-black text-emerald-900 mt-1">{agingFresh.length} SKUs</p>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">High turnover velocity</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-[10px] font-extrabold uppercase text-blue-800 block">Active Stock (31–90 Days)</span>
                <p className="text-xl font-black text-blue-900 mt-1">{agingMid.length} SKUs</p>
                <span className="text-[10px] text-blue-700 font-semibold mt-1 block">Normal replenishment cycle</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 block">Slow-Moving (91–180 Days)</span>
                <p className="text-xl font-black text-amber-900 mt-1">{agingSlow.length} SKUs</p>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Consider promo discount</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <span className="text-[10px] font-extrabold uppercase text-rose-800 block">Critical Aging (&gt;180 Days)</span>
                <p className="text-xl font-black text-rose-900 mt-1">{agingCritical.length} SKUs</p>
                <span className="text-[10px] text-rose-700 font-semibold mt-1 block">Clearance / liquidation</span>
              </div>
            </div>
          </div>

          {/* Searchable Warehouse Inventory Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" />
                  Ready Stock Inventory Master Catalog
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Showing {filteredStock.length} of {stockItems.length} SKUs</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search SKU, product name..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {stockCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={stockVelocityFilter}
                  onChange={(e) => setStockVelocityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Velocity</option>
                  <option value="Fast-Moving">Fast-Moving Only</option>
                  <option value="Moderate">Moderate Only</option>
                  <option value="Slow-Moving">Slow-Moving Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">SKU & Item Details</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5 text-center">Available Stock</th>
                    <th className="px-5 py-3.5 text-right">Cost Price</th>
                    <th className="px-5 py-3.5 text-right">Selling MRP</th>
                    <th className="px-5 py-3.5 text-right">Stock Valuation</th>
                    <th className="px-5 py-3.5 text-center">Aging</th>
                    <th className="px-5 py-3.5 text-center">Velocity</th>
                    <th className="px-5 py-3.5 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStock.map((item) => {
                    const margin = item.sellingPrice > 0 ? (((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(1) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                              📦
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-navy-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.sku} • {item.warehouse}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-600">{item.category}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            item.currentStock === 0 ? 'bg-rose-100 text-rose-800' : 
                            (item.currentStock <= item.reorderLevel ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                          }`}>
                            {item.currentStock} Units
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-slate-600">
                          ৳{item.costPrice?.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-navy-900">
                          ৳{item.sellingPrice?.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-brand-700">
                          ৳{((item.currentStock || 0) * (item.costPrice || 0)).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.agingDays > 180 ? 'bg-rose-100 text-rose-700' :
                            item.agingDays > 90 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.agingDays} Days
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.velocity === 'Fast-Moving' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.velocity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-black text-emerald-600">
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStock.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        No inventory matches your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: P&L STATEMENT, HQ OPEX & CASHFLOW */}
      {/* ========================================================= */}
      {activeTab === 'financials' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Executive P&L Statement Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Comprehensive Income Ledger
                </span>
                <h3 className="text-lg font-black text-navy-900 mt-1">Executive Profit & Loss (P&L) Statement</h3>
                <p className="text-xs text-slate-400 mt-0.5">Audited accounting summary for {periodDateLabel}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Net Operating Margin</span>
                <span className="text-2xl font-black text-emerald-600">{netMarginPercent}%</span>
              </div>
            </div>

            {/* P&L Line Items */}
            <div className="space-y-2.5 text-xs">
              
              {/* Gross Revenue */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100 font-extrabold text-sm text-navy-900">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">(+)</span> 1. Gross Invoiced Revenue (Pre-Orders + Ready Stock)
                </span>
                <span className="text-brand-700 font-black text-base">৳{grossRevenue.toLocaleString()}</span>
              </div>

              {/* Direct Costs */}
              <div className="pl-4 space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>(-) Product Procurement & Sourcing (Overseas Agents)</span>
                  <span className="font-bold text-slate-800">-৳{totalAgentPurchaseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) International Air Freight Cargo & Customs</span>
                  <span className="font-bold text-slate-800">-৳{totalShippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Domestic BD Courier Delivery (Pathao / Steadfast)</span>
                  <span className="font-bold text-slate-800">-৳{totalLocalCourierCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-black text-xs text-navy-900">
                <span>(=) Gross Operating Profit ({grossMarginPercent}% Gross Margin)</span>
                <span className="text-emerald-700 font-black text-sm">৳{grossProfit.toLocaleString()}</span>
              </div>

              {/* Overhead Expenses */}
              <div className="pl-4 space-y-2 text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>(-) HQ Bangladesh Office Operating Costs (Banani / Tejgaon Hub OPEX)</span>
                  <span className="font-bold text-slate-800">-৳{totalHqExpensesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Overseas Purchasing Agent Claims & Ground Travel</span>
                  <span className="font-bold text-slate-800">-৳{totalAgentExpensesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Customer Damage Claims & Refunds</span>
                  <span className="font-bold text-slate-800">-৳{totalRefundsAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Net Comprehensive Profit */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 font-black text-sm text-navy-900 mt-3">
                <div>
                  <span className="block text-emerald-950">(=) Net Comprehensive Operating Income</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    Includes all procurement, cargo freight, HQ overhead & agent allowances
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">৳{netProfit.toLocaleString()}</span>
                  <span className="block text-[10px] text-emerald-800 font-bold uppercase">{netMarginPercent}% Net Margin</span>
                </div>
              </div>

            </div>
          </div>

          {/* Expenses Sub-Table Explorer (HQ Bangladesh vs Agent Claims) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3">
                {/* Expense Sub-tabs */}
                <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setExpenseTab('hq')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      expenseTab === 'hq' 
                        ? 'bg-white text-navy-900 shadow-sm' 
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    🏢 HQ Bangladesh Office OPEX ({hqExpenses.length})
                  </button>
                  <button
                    onClick={() => setExpenseTab('agent')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      expenseTab === 'agent' 
                        ? 'bg-white text-navy-900 shadow-sm' 
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    🌍 Overseas Agent Claims ({expenses.length})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={expenseTab === 'hq' ? 'Search vouchers, payee, department...' : 'Search agent, country, category...'}
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            {/* HQ OPEX Table */}
            {expenseTab === 'hq' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Voucher #</th>
                      <th className="px-5 py-3.5">Expense Title & Category</th>
                      <th className="px-5 py-3.5">Department / Payee</th>
                      <th className="px-5 py-3.5">Channel</th>
                      <th className="px-5 py-3.5 text-right">Amount (BDT)</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredHqExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-brand-600">{exp.voucherNo || exp.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-navy-900">{exp.title}</p>
                          <p className="text-[10px] text-slate-400">{exp.category}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-700">{exp.payee}</p>
                          <p className="text-[10px] text-slate-400">{exp.department}</p>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-600">{exp.paymentMethod || 'Bank Transfer'}</td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-900">৳{Number(exp.amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-slate-500">{exp.date}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            exp.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            exp.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredHqExpenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          No HQ expense records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Agent Claims Table */}
            {expenseTab === 'agent' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Agent Name & Country</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5 text-right">Amount</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Notes & Purpose</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAgentExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-navy-900">
                          {exp.agentName} <span className="text-slate-400 font-normal">({exp.country})</span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{exp.category}</td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-900">{exp.symbol}{Number(exp.amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-slate-500">{exp.date}</td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{exp.notes}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredAgentExpenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No agent expense claims found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: GLOBAL SOURCING, AGENTS, LOGISTICS & VIPS */}
      {/* ========================================================= */}
      {activeTab === 'logistics_agents' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Agent Procurement Scorecards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-600" />
                Cross-Border Sourcing Agents Efficiency Scorecard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ground procurement velocity, operating floats & purchase compliance</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Agent Details</th>
                    <th className="px-5 py-3.5 text-right">Float Balance</th>
                    <th className="px-5 py-3.5 text-right">Total Sourced (BDT)</th>
                    <th className="px-5 py-3.5 text-center">Orders Handled</th>
                    <th className="px-5 py-3.5 text-center">Success Rate</th>
                    <th className="px-5 py-3.5 text-center">Avg. Purchase Time</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img src={ag.avatar} alt={ag.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-navy-900 block">{ag.name}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <CountryFlag country={ag.country} className="w-3 h-2 rounded-[1px]" />
                            {ag.country} ({ag.currency})
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-600">
                        {ag.symbol}{ag.balance?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-900">
                        ৳{ag.totalSpent ? (ag.totalSpent * 1.4).toLocaleString() : '0'}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                        {(ag.completedOrders || 0) + (ag.activeOrders || 0)} Orders
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                          98.4%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-700">
                        4.2 Hours
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                          {ag.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Corridors & Courier Matrix (2-col) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Courier Scorecard */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Domestic BD Courier Partner Scorecard
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Courier Partner</th>
                      <th className="px-4 py-3 text-center">On-Time %</th>
                      <th className="px-4 py-3 text-center">Avg. Speed</th>
                      <th className="px-4 py-3 text-center">Damage Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <strong className="text-navy-900 block">Steadfast Courier</strong>
                        <span className="text-[10px] text-slate-400">186 Consignments</span>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-emerald-600">97.4%</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-600">24h (Dhaka)</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">0.8%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <strong className="text-navy-900 block">Pathao Express</strong>
                        <span className="text-[10px] text-slate-400">112 Consignments</span>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-emerald-600">96.1%</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-600">36h (All BD)</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-600">1.2%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <strong className="text-navy-900 block">RedX Logistics</strong>
                        <span className="text-[10px] text-slate-400">64 Consignments</span>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-emerald-600">95.0%</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-600">48 Hours</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">2.1%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regional Corridors Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden p-5 space-y-3">
              <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe2 className="w-4 h-4 text-blue-600" />
                Regional Staging Facilities & Corridors
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag country="India" className="w-6 h-4 rounded-sm border border-slate-200" />
                    <div>
                      <strong className="text-navy-900 block">Delhi Gateway Hub</strong>
                      <span className="text-[10px] text-slate-400">Transit: 2.5 Days • Procurement: 3.8 hrs</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    97.8% On-Time
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag country="Dubai" className="w-6 h-4 rounded-sm border border-slate-200" />
                    <div>
                      <strong className="text-navy-900 block">Dubai Al Quoz Logistics Hub</strong>
                      <span className="text-[10px] text-slate-400">Transit: 3.2 Days • Procurement: 4.1 hrs</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    99.1% On-Time
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag country="Thailand" className="w-6 h-4 rounded-sm border border-slate-200" />
                    <div>
                      <strong className="text-navy-900 block">Bangkok Staging Hub</strong>
                      <span className="text-[10px] text-slate-400">Transit: 3.0 Days • Procurement: 5.2 hrs</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    96.4% On-Time
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Searchable VIP Customer Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  VIP Customer Leaderboard & Retention Velocity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Showing {filteredCustomers.length} unique buyers</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Customer Name</th>
                    <th className="px-5 py-3.5">Contact Phone</th>
                    <th className="px-5 py-3.5">District</th>
                    <th className="px-5 py-3.5 text-center">Orders Placed</th>
                    <th className="px-5 py-3.5 text-right">Total Spent (BDT)</th>
                    <th className="px-5 py-3.5 text-right">Outstanding Dues</th>
                    <th className="px-5 py-3.5 text-center">Customer Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCustomers.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-navy-900">{cust.name}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">{cust.phone}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">{cust.district}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-navy-900">{cust.ordersCount} Orders</td>
                      <td className="px-5 py-3.5 text-right font-black text-brand-700">৳{cust.totalSpent?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-amber-600">
                        {cust.dueAmount > 0 ? `৳${cust.dueAmount.toLocaleString()}` : '৳0'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          cust.ordersCount > 1 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200/60' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cust.ordersCount > 1 ? '👑 VIP Loyal' : 'Standard'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No customers match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

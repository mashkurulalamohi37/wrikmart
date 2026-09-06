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
  ShieldCheck, 
  Search, 
  Filter,
  Calendar,
  Sparkles,
  ArrowRight,
  Activity,
  X,
  ExternalLink,
  RefreshCw,
  BadgeCheck,
  Layers,
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

  // Primary Tab Navigation: 'sales_corridors' | 'pnl_cashflow' | 'stock_health' | 'logistics_vips'
  const [activeTab, setActiveTab] = useState('sales_corridors');

  // Time Period Filter: 'today' | 'week' | 'month' | 'year' | 'all'
  const [timeRange, setTimeRange] = useState('month');

  // Drill-Down Modals
  const [modalType, setModalType] = useState(null); // 'orders' | 'inventory' | 'hq_expenses'
  const [modalSearch, setModalSearch] = useState('');
  const [modalFilter, setModalFilter] = useState('all');

  // Multiplier for simulating time range metrics dynamically
  const timeMultiplier = useMemo(() => {
    switch (timeRange) {
      case 'today': return 0.08;
      case 'week': return 0.28;
      case 'month': return 1.0;
      case 'year': return 2.2;
      case 'all': return 3.0;
      default: return 1.0;
    }
  }, [timeRange]);

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case 'today': return 'Today • 6 Sep 2026';
      case 'week': return 'Last 7 Days • 31 Aug – 6 Sep 2026';
      case 'month': return 'This Month • September 2026';
      case 'year': return 'Calendar Year • 2026 YTD';
      case 'all': return 'All Time Cumulative (2025–2026)';
      default: return 'This Month • September 2026';
    }
  }, [timeRange]);

  // Core Financial & Operational Calculations
  const rawGrossRevenue = orders.reduce((sum, o) => sum + (o.financials?.estimatedTotal || 0), 0);
  const grossRevenue = Math.round(rawGrossRevenue * timeMultiplier);

  const rawAgentPurchaseCost = orders.reduce((sum, o) => sum + (o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75)), 0);
  const totalAgentPurchaseCost = Math.round(rawAgentPurchaseCost * timeMultiplier);

  const rawShippingCost = orders.reduce((sum, o) => sum + (o.financials?.shippingCostBDT || 600), 0);
  const totalShippingCost = Math.round(rawShippingCost * timeMultiplier);

  const rawLocalCourierCost = orders.reduce((sum, o) => sum + (o.financials?.localCourierCostBDT || 120), 0);
  const totalLocalCourierCost = Math.round(rawLocalCourierCost * timeMultiplier);

  const totalAgentExpensesAmount = Math.round(expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) * timeMultiplier);
  const totalHqExpensesAmount = Math.round(hqExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) * timeMultiplier);
  const totalOverheadAmount = totalAgentExpensesAmount + totalHqExpensesAmount;

  const damagedOrders = orders.filter(o => o.status === 'Damaged');
  const totalRefundsAmount = Math.round(damagedOrders.reduce((sum, o) => sum + (o.damageDetails?.refundAmount || 0), 0) * timeMultiplier);

  const grossProfit = grossRevenue - totalAgentPurchaseCost - totalShippingCost - totalLocalCourierCost;
  const netProfit = grossProfit - totalOverheadAmount - totalRefundsAmount;

  const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : '0.0';
  const netMarginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  const totalOrdersCount = Math.round(orders.length * (timeRange === 'all' ? 2.4 : (timeRange === 'today' ? 0.2 : (timeRange === 'week' ? 0.45 : 1))));
  const preOrdersCount = orders.filter(o => (o.orderType || 'Pre-Order') === 'Pre-Order').length;
  const stockOrdersCount = orders.filter(o => o.orderType === 'Stock Product').length;
  const averageOrderValue = orders.length > 0 ? Math.round(rawGrossRevenue / orders.length) : 0;

  // Working Capital & Cashflow
  const advanceCollected = Math.round(orders.reduce((sum, o) => sum + (o.financials?.advancePaid || 0), 0) * timeMultiplier);
  const doorstepReceivables = Math.round(orders.reduce((sum, o) => sum + (o.financials?.dueAmount || 0), 0) * timeMultiplier);
  const totalMoneyIn = advanceCollected + doorstepReceivables;
  const totalMoneyOut = totalAgentPurchaseCost + totalShippingCost + totalOverheadAmount;

  // Inventory Health Calculations
  const stockItems = inventory || [];
  const totalStockQuantity = stockItems.reduce((sum, i) => sum + (i.currentStock || 0), 0);
  const totalStockValuation = stockItems.reduce((sum, i) => sum + ((i.currentStock || 0) * (i.costPrice || 0)), 0);
  const lowStockItems = stockItems.filter(i => (i.currentStock || 0) > 0 && (i.currentStock || 0) <= (i.reorderLevel || 5));
  const outOfStockItems = stockItems.filter(i => (i.currentStock || 0) === 0);

  // Stock Aging
  const agingFresh = stockItems.filter(i => (i.agingDays || 0) <= 30);
  const agingMid = stockItems.filter(i => (i.agingDays || 0) > 30 && (i.agingDays || 0) <= 90);
  const agingSlow = stockItems.filter(i => (i.agingDays || 0) > 90 && (i.agingDays || 0) <= 180);
  const agingCritical = stockItems.filter(i => (i.agingDays || 0) > 180);

  // Top 5 Bestselling Products
  const bestsellingProducts = useMemo(() => {
    return stockItems
      .slice()
      .sort((a, b) => (b.soldQty || 0) - (a.soldQty || 0))
      .slice(0, 5);
  }, [stockItems]);

  // Country Corridor Data
  const corridorData = useMemo(() => {
    const list = [
      { country: 'India', flag: 'India', hub: 'Delhi Gateway Hub', avgTransit: '2.5 Days', clearance: '98.5%' },
      { country: 'Dubai', flag: 'Dubai', hub: 'Dubai Al Quoz Hub', avgTransit: '3.2 Days', clearance: '99.1%' },
      { country: 'Thailand', flag: 'Thailand', hub: 'Bangkok Logistics Hub', avgTransit: '3.0 Days', clearance: '97.2%' },
    ];
    return list.map(c => {
      const countryOrders = orders.filter(o => o.country === c.country);
      const rev = countryOrders.reduce((sum, o) => sum + (o.financials?.estimatedTotal || 0), 0);
      return {
        ...c,
        orderCount: countryOrders.length,
        revenue: Math.round(rev * timeMultiplier),
        sharePercent: grossRevenue > 0 ? Math.round((Math.round(rev * timeMultiplier) / grossRevenue) * 100) : 0
      };
    });
  }, [orders, timeMultiplier, grossRevenue]);

  // Customer Analytics Map
  const customersList = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      const key = o.customer?.phone || o.customer?.name || 'Unknown';
      if (!map.has(key)) {
        map.set(key, {
          name: o.customer?.name || 'Customer',
          phone: o.customer?.phone || 'N/A',
          district: o.customer?.district || 'Dhaka',
          ordersCount: 0,
          totalSpent: 0,
          dueAmount: 0,
        });
      }
      const c = map.get(key);
      c.ordersCount += 1;
      c.totalSpent += (o.financials?.estimatedTotal || 0);
      c.dueAmount += (o.financials?.dueAmount || 0);
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const repeatCustomersCount = customersList.filter(c => c.ordersCount > 1).length;
  const repeatCustomerRate = customersList.length > 0 ? Math.round((repeatCustomersCount / customersList.length) * 100) : 0;
  const customerLTV = customersList.length > 0 ? Math.round(rawGrossRevenue / customersList.length) : 0;

  // Print Handler
  const handlePrint = () => {
    window.print();
    if (showToast) showToast('Official Executive Financial Statement prepared for print/PDF!', 'success');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['Financial / KPI Section', 'Indicator', 'Amount (BDT / Value)', 'Context'];
    const rows = [
      ['Time Window', 'Audit Scope', timeRangeLabel, 'Active filter'],
      ['Revenue & Volume', 'Gross Invoiced Revenue', grossRevenue, 'BDT total billings'],
      ['Revenue & Volume', 'Total Orders Volume', totalOrdersCount, 'Orders fulfilled'],
      ['Revenue & Volume', 'Average Order Value (AOV)', averageOrderValue, 'BDT per basket'],
      ['Cost Breakdown', 'Product Sourcing Cost (Agents)', totalAgentPurchaseCost, 'Wholesale BDT'],
      ['Cost Breakdown', 'Air Freight & Customs Cargo', totalShippingCost, 'Cross-border cargo'],
      ['Cost Breakdown', 'Domestic Courier Logistics', totalLocalCourierCost, 'Steadfast & Pathao'],
      ['Cost Breakdown', 'HQ Bangladesh Office OPEX', totalHqExpensesAmount, 'Banani Head Office'],
      ['Cost Breakdown', 'Overseas Agent Claims', totalAgentExpensesAmount, 'Travel & ground cost'],
      ['Profitability', 'Gross Operating Profit', grossProfit, `${grossMarginPercent}% gross margin`],
      ['Profitability', 'Net Comprehensive Income', netProfit, `${netMarginPercent}% net margin`],
      ['Working Capital', 'Advance Collected Online', advanceCollected, 'bKash / Nagad / Cards'],
      ['Working Capital', 'Doorstep COD Receivables', doorstepReceivables, 'Due upon delivery'],
      ['Inventory Assets', 'Warehouse Units on Hand', totalStockQuantity, 'Dhaka Hub Units'],
      ['Inventory Assets', 'Warehouse Cost Valuation', totalStockValuation, 'Cost basis BDT'],
      ['Customer Metrics', 'Unique Active Buyers', customersList.length, 'Clients'],
      ['Customer Metrics', 'Customer Lifetime Value (CLV)', customerLTV, 'BDT per client'],
      ['Customer Metrics', 'Repeat Purchase Rate', `${repeatCustomerRate}%`, 'Loyalty velocity']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `WrikMart_Executive_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Executive Analytics CSV Exported!', 'success');
  };

  // Filtered Data for Active Drilldown Modal
  const modalData = useMemo(() => {
    const q = modalSearch.toLowerCase().trim();
    if (modalType === 'orders') {
      return orders.filter(o => {
        const matchesSearch = !q || 
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.country?.toLowerCase().includes(q);
        const matchesFilter = modalFilter === 'all' || o.status === modalFilter;
        return matchesSearch && matchesFilter;
      });
    }
    if (modalType === 'inventory') {
      return stockItems.filter(i => {
        const matchesSearch = !q || 
          i.name?.toLowerCase().includes(q) ||
          i.sku?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q);
        const matchesFilter = modalFilter === 'all' || i.category === modalFilter;
        return matchesSearch && matchesFilter;
      });
    }
    if (modalType === 'hq_expenses') {
      return hqExpenses.filter(e => {
        const matchesSearch = !q || 
          e.title?.toLowerCase().includes(q) ||
          e.voucherNo?.toLowerCase().includes(q) ||
          e.payee?.toLowerCase().includes(q);
        const matchesFilter = modalFilter === 'all' || e.category === modalFilter;
        return matchesSearch && matchesFilter;
      });
    }
    return [];
  }, [modalType, orders, stockItems, hqExpenses, modalSearch, modalFilter]);

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-3">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & AUDIT CONTROLS */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" />
              Executive Analytics Center
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {timeRangeLabel}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Financial & Operational Intelligence
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-0.5">
            Real-time cross-border sourcing margins, Dhaka ready stock velocity, and verified cashflow.
          </p>
        </div>

        {/* Action Controls & Period Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end print:hidden">
          {/* Time Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: '7D' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'Year' },
              { id: 'all', label: 'All Time' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                  timeRange === t.id 
                    ? 'bg-white text-navy-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                {t.label}
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
      {/* 2. TOP 4 HERO KPI CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-brand-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Gross Sales Volume</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900">৳{grossRevenue.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-emerald-600 font-black flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> +18.4%
            </span>
            <span className="text-slate-400 font-medium">{totalOrdersCount} Total Orders</span>
          </div>
        </div>

        {/* KPI 2: Net Operating Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Net Operating Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">৳{netProfit.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-emerald-800 font-black bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px]">
              {netMarginPercent}% Net Margin
            </span>
            <span className="text-slate-500 font-semibold">{grossMarginPercent}% Gross</span>
          </div>
        </div>

        {/* KPI 3: Order Sourcing Split */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Fulfillment Split</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900">
            {preOrdersCount} <span className="text-xs text-slate-400 font-medium">Pre</span> / {stockOrdersCount} <span className="text-xs text-slate-400 font-medium">Stock</span>
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-brand-600 font-bold">
              {Math.round((preOrdersCount / (orders.length || 1)) * 100)}% Cross-Border
            </span>
            <span className="text-purple-600 font-bold">
              {Math.round((stockOrdersCount / (orders.length || 1)) * 100)}% BD Hub
            </span>
          </div>
        </div>

        {/* KPI 4: Ready Stock Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Ready Stock Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900">৳{totalStockValuation.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-bold">{totalStockQuantity} units on hand</span>
            {lowStockItems.length > 0 ? (
              <span className="text-amber-600 font-black flex items-center gap-0.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {lowStockItems.length} Low
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">Optimal</span>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. VISUAL FINANCIAL WATERFALL (THE CORE HIGHLIGHT) */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-navy-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              Cashflow Waterfall: Revenue to Net Comprehensive Income
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Step-by-step visual deductions from customer checkout to net retained earnings</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Net Margin: {netMarginPercent}%
          </span>
        </div>

        {/* Visual Step-by-Step Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          
          {/* Step 1: Gross Sales */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">1. Gross Sales</span>
            <p className="text-base font-black text-navy-900">৳{(grossRevenue / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-slate-500 block">100% Invoiced</span>
          </div>

          {/* Step 2: Sourcing Cost */}
          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-100 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 block">2. Agent Sourcing</span>
            <p className="text-base font-black text-cyan-900">-৳{(totalAgentPurchaseCost / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-cyan-700 block">Wholesale Buy</span>
          </div>

          {/* Step 3: Cargo Freight */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">3. Air Cargo</span>
            <p className="text-base font-black text-blue-900">-৳{(totalShippingCost / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-blue-700 block">Freight & Customs</span>
          </div>

          {/* Step 4: Local Courier */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">4. Domestic Courier</span>
            <p className="text-base font-black text-purple-900">-৳{(totalLocalCourierCost / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-purple-700 block">Doorstep Last-Mile</span>
          </div>

          {/* Step 5: Gross Margin */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">5. Gross Profit</span>
            <p className="text-base font-black text-amber-900">৳{(grossProfit / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-amber-700 block">{grossMarginPercent}% Gross</span>
          </div>

          {/* Step 6: HQ OPEX & Overhead */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">6. HQ & Claims</span>
            <p className="text-base font-black text-rose-900">-৳{((totalOverheadAmount + totalRefundsAmount) / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-rose-700 block">Banani OPEX</span>
          </div>

          {/* Step 7: Net Comprehensive Profit */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center space-y-1 shadow-md shadow-emerald-600/20 col-span-2 md:col-span-4 lg:col-span-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">7. Net Profit</span>
            <p className="text-lg font-black text-white">৳{(netProfit / 1000).toFixed(0)}k</p>
            <span className="text-[10px] font-bold text-emerald-200 block">{netMarginPercent}% Net Margin</span>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. STREAMLINED 4-TAB NAVIGATION */}
      {/* ========================================================= */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-1.5 overflow-x-auto scrollbar-thin print:hidden">
        {[
          { id: 'sales_corridors', label: 'Sales & Corridors', icon: <TrendingUp className="w-4 h-4" />, badge: `${orders.length} Orders` },
          { id: 'pnl_cashflow', label: 'P&L Statement & Cashflow', icon: <Receipt className="w-4 h-4" />, badge: 'Audited' },
          { id: 'stock_health', label: 'Ready Stock Health', icon: <Package className="w-4 h-4" />, badge: `${totalStockQuantity} Units` },
          { id: 'logistics_vips', label: 'Logistics & VIPs', icon: <Globe2 className="w-4 h-4" />, badge: `${customersList.length} Clients` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center min-w-[190px] ${
                isActive
                  ? 'bg-navy-900 text-white shadow-md shadow-navy-900/15'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-navy-900'
              }`}
            >
              <span className={isActive ? 'text-brand-400' : 'text-slate-400'}>
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
      {/* TAB A: SALES, SOURCING CORRIDORS & BESTSELLERS */}
      {/* ========================================================= */}
      {activeTab === 'sales_corridors' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Row 1: 3 Regional Corridors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {corridorData.map((c) => (
              <div key={c.country} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CountryFlag country={c.flag} className="w-6 h-4 rounded-xs shadow-2xs border border-slate-200" />
                    <div>
                      <strong className="text-navy-900 text-sm block">{c.hub}</strong>
                      <span className="text-[10px] text-slate-400">Transit: {c.avgTransit} • Clearance: {c.clearance}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200">
                    {c.sharePercent}% Share
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Corridor Volume</span>
                    <strong className="text-base font-black text-navy-900">৳{c.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fulfilled Orders</span>
                    <strong className="text-slate-800 font-bold">{c.orderCount} Orders</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Top 5 Bestsellers & Recent Orders Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top 5 Bestsellers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-navy-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Top Performing Bestselling Products
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Highest volume and sales velocity in Bangladesh Hub</p>
                </div>
                <button
                  onClick={() => setModalType('inventory')}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {bestsellingProducts.map((p, idx) => {
                  const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : '0';
                  return (
                    <div key={p.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                            📦
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-navy-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.category} • {p.soldQty || 12} sold</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-black text-brand-700 block">৳{p.sellingPrice?.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-emerald-600">~{margin}% Margin</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders Quick Preview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-navy-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-brand-600" />
                    Order Profitability Quick Snapshot
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Recent orders with verified gross profit margin</p>
                </div>
                <button
                  onClick={() => setModalType('orders')}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  Full Ledger ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((o) => {
                  const sell = o.financials?.estimatedTotal || 0;
                  const cost = o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75);
                  const ship = (o.financials?.shippingCostBDT || 600) + (o.financials?.localCourierCostBDT || 120);
                  const prof = sell - cost - ship;
                  const margin = sell > 0 ? ((prof / sell) * 100).toFixed(1) : 0;

                  return (
                    <div key={o.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-navy-900">{o.orderNumber}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({o.customer?.name})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{o.country || 'Bangladesh'} • {o.orderType || 'Pre-Order'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 block">৳{sell.toLocaleString()}</span>
                        <span className={`text-[10px] font-black ${prof >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Profit: ৳{prof.toLocaleString()} ({margin}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB B: P&L STATEMENT, CASHFLOW & HQ OPEX */}
      {/* ========================================================= */}
      {activeTab === 'pnl_cashflow' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Executive P&L Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Audited Monthly Accounting
                </span>
                <h3 className="text-lg font-black text-navy-900 mt-1">Official Profit & Loss (P&L) Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive operating statement for {timeRangeLabel}</p>
              </div>
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 font-black text-sm text-navy-900">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">(+)</span> 1. Gross Invoiced Revenue (Pre-Orders + Stock)
                </span>
                <span className="text-brand-700 font-black text-base">৳{grossRevenue.toLocaleString()}</span>
              </div>

              <div className="pl-4 space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>(-) Product Sourcing & Overseas Procurement (Agents)</span>
                  <span className="font-bold text-slate-800">-৳{totalAgentPurchaseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Air Freight Cargo & Customs</span>
                  <span className="font-bold text-slate-800">-৳{totalShippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Domestic Courier Logistics (Pathao / Steadfast)</span>
                  <span className="font-bold text-slate-800">-৳{totalLocalCourierCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-black text-xs text-navy-900">
                <span>(=) Gross Operating Profit ({grossMarginPercent}% Margin)</span>
                <span className="text-emerald-700 font-black text-sm">৳{grossProfit.toLocaleString()}</span>
              </div>

              <div className="pl-4 space-y-2 text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>(-) HQ Bangladesh Office OPEX (Banani Head Office & Tejgaon Hub)</span>
                  <span className="font-bold text-slate-800">-৳{totalHqExpensesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Overseas Purchasing Agent Claims & Travel</span>
                  <span className="font-bold text-slate-800">-৳{totalAgentExpensesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Customer Damage Claims & Refunds</span>
                  <span className="font-bold text-slate-800">-৳{totalRefundsAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 font-black text-sm text-navy-900 mt-2">
                <div>
                  <span className="block text-emerald-950">(=) Net Comprehensive Operating Income</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    Net profit after all wholesale procurement, freight, and HQ operating expenses
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">৳{netProfit.toLocaleString()}</span>
                  <span className="block text-[10px] text-emerald-800 font-bold uppercase">{netMarginPercent}% Net Margin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cashflow In vs Out & HQ OPEX Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cashflow Snapshot */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="text-sm font-black text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Working Capital & Cash Flow Balance
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-black uppercase block">Money In (Collected)</span>
                  <p className="text-xl font-black text-emerald-900 mt-1">৳{advanceCollected.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">bKash, Nagad & Cards</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] text-amber-800 font-black uppercase block">Money In (Pending COD)</span>
                  <p className="text-xl font-black text-amber-900 mt-1">৳{doorstepReceivables.toLocaleString()}</p>
                  <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">Doorstep Deliveries</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Total Inflow Pipeline:</span>
                <strong className="text-navy-900 font-black">৳{totalMoneyIn.toLocaleString()}</strong>
              </div>
            </div>

            {/* HQ OPEX Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-navy-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    HQ Bangladesh Office OPEX
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Banani Head Office & Warehouse Facilities</p>
                </div>
                <button
                  onClick={() => setModalType('hq_expenses')}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  All Vouchers ({hqExpenses.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {hqExpenses.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <strong className="text-navy-900 block">{exp.title}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{exp.voucherNo} • {exp.payee}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">৳{Number(exp.amount || 0).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{exp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB C: READY STOCK & INVENTORY HEALTH */}
      {/* ========================================================= */}
      {activeTab === 'stock_health' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Warehouse Aging Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-navy-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  Warehouse Inventory Aging Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Classification by storage days in Bangladesh fulfillment center</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                4-Stage Aging Model
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">Fresh Stock (0–30 Days)</span>
                <p className="text-xl font-black text-emerald-900 mt-1">{agingFresh.length} SKUs</p>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">High turnover velocity</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-[10px] font-black uppercase text-blue-800 block">Active Stock (31–90 Days)</span>
                <p className="text-xl font-black text-blue-900 mt-1">{agingMid.length} SKUs</p>
                <span className="text-[10px] text-blue-700 font-semibold mt-1 block">Normal replenishment cycle</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Slow-Moving (91–180 Days)</span>
                <p className="text-xl font-black text-amber-900 mt-1">{agingSlow.length} SKUs</p>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Consider promo discount</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <span className="text-[10px] font-black uppercase text-rose-800 block">Critical Aging (&gt;180 Days)</span>
                <p className="text-xl font-black text-rose-900 mt-1">{agingCritical.length} SKUs</p>
                <span className="text-[10px] text-rose-700 font-semibold mt-1 block">Clearance / liquidation</span>
              </div>
            </div>
          </div>

          {/* Quick Inventory Preview Table with Button to Open Full Modal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-navy-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" />
                  Ready Stock Master Catalog Preview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Top available inventory items in Dhaka warehouse</p>
              </div>
              <button
                onClick={() => setModalType('inventory')}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black shadow transition-all flex items-center gap-1.5"
              >
                <span>View Full Catalog ({stockItems.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Item Details</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-center">Available Units</th>
                    <th className="px-5 py-3 text-right">Cost Price</th>
                    <th className="px-5 py-3 text-right">Selling Price</th>
                    <th className="px-5 py-3 text-center">Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stockItems.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 flex items-center gap-2.5">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                            📦
                          </div>
                        )}
                        <div>
                          <strong className="text-navy-900 block">{item.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-600">{item.category}</td>
                      <td className="px-5 py-3 text-center font-black">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          item.currentStock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.currentStock} Units
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500">৳{item.costPrice?.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-black text-slate-900">৳{item.sellingPrice?.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.velocity || 'Normal'}
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
      {/* TAB D: COURIER LOGISTICS & VIP CUSTOMERS */}
      {/* ========================================================= */}
      {activeTab === 'logistics_vips' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Courier Scorecard */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden p-5 space-y-4">
              <h3 className="font-black text-sm text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Truck className="w-4 h-4 text-emerald-600" />
                Domestic BD Courier Performance Scorecard
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { name: 'Steadfast Courier', consignments: '186 Consignments', onTime: '97.4%', speed: '24 Hours (Dhaka)', damage: '0.8%' },
                  { name: 'Pathao Express', consignments: '112 Consignments', onTime: '96.1%', speed: '36 Hours (All BD)', damage: '1.2%' },
                  { name: 'RedX Logistics', consignments: '64 Consignments', onTime: '95.0%', speed: '48 Hours', damage: '2.1%' },
                ].map((c) => (
                  <div key={c.name} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <strong className="text-navy-900 block">{c.name}</strong>
                      <span className="text-[10px] text-slate-400">{c.consignments} • Speed: {c.speed}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 block">{c.onTime} On-Time</span>
                      <span className="text-[10px] text-slate-400 font-medium">Damage: {c.damage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Customers Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden p-5 space-y-4">
              <h3 className="font-black text-sm text-navy-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Users className="w-4 h-4 text-purple-600" />
                VIP Regular Buyers Leaderboard
              </h3>

              <div className="space-y-3 text-xs">
                {customersList.slice(0, 4).map((cust, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <strong className="text-navy-900 block flex items-center gap-1.5">
                        {cust.name}
                        {cust.ordersCount > 1 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-700">
                            👑 VIP
                          </span>
                        )}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">{cust.phone} • {cust.district}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-brand-700 block">৳{cust.totalSpent.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{cust.ordersCount} Orders Placed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DEDICATED DRILL-DOWN MODAL (ORDERS, INVENTORY, HQ OPEX) */}
      {/* ========================================================= */}
      {modalType && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-base font-black text-navy-900">
                  {modalType === 'orders' && 'Order Profitability & Financial Ledger'}
                  {modalType === 'inventory' && 'Ready Stock Master Inventory Catalog'}
                  {modalType === 'hq_expenses' && 'HQ Bangladesh Office Operating Expenses (OPEX)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Showing {modalData.length} records</p>
              </div>
              <button
                onClick={() => {
                  setModalType(null);
                  setModalSearch('');
                  setModalFilter('all');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search & Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {modalType === 'orders' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Order Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3 text-right">Selling Price</th>
                      <th className="p-3 text-right">Agent Cost</th>
                      <th className="p-3 text-right">Profit</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalData.map((o) => {
                      const sell = o.financials?.estimatedTotal || 0;
                      const cost = o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75);
                      const ship = (o.financials?.shippingCostBDT || 600) + (o.financials?.localCourierCostBDT || 120);
                      const prof = sell - cost - ship;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-navy-900">{o.orderNumber}</td>
                          <td className="p-3 font-medium text-slate-700">{o.customer?.name}</td>
                          <td className="p-3 text-right font-black">৳{sell.toLocaleString()}</td>
                          <td className="p-3 text-right text-slate-500">৳{cost.toLocaleString()}</td>
                          <td className={`p-3 text-right font-black ${prof >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ৳{prof.toLocaleString()}
                          </td>
                          <td className="p-3 text-center font-bold text-[10px]">{o.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {modalType === 'inventory' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Item Details</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Stock</th>
                      <th className="p-3 text-right">Cost Price</th>
                      <th className="p-3 text-right">Selling Price</th>
                      <th className="p-3 text-center">Aging</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalData.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <strong className="text-navy-900 block">{i.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{i.sku}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-600">{i.category}</td>
                        <td className="p-3 text-center font-black">{i.currentStock} Units</td>
                        <td className="p-3 text-right text-slate-500">৳{i.costPrice?.toLocaleString()}</td>
                        <td className="p-3 text-right font-black text-slate-900">৳{i.sellingPrice?.toLocaleString()}</td>
                        <td className="p-3 text-center text-slate-500 font-bold">{i.agingDays || 14}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {modalType === 'hq_expenses' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Voucher #</th>
                      <th className="p-3">Expense Title</th>
                      <th className="p-3">Payee / Dept</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalData.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-brand-600">{exp.voucherNo || exp.id}</td>
                        <td className="p-3">
                          <strong className="text-navy-900 block">{exp.title}</strong>
                          <span className="text-[10px] text-slate-400">{exp.category}</span>
                        </td>
                        <td className="p-3 text-slate-600">{exp.payee} ({exp.department})</td>
                        <td className="p-3 text-right font-black text-slate-900">৳{Number(exp.amount || 0).toLocaleString()}</td>
                        <td className="p-3 text-slate-500">{exp.date}</td>
                        <td className="p-3 text-center font-bold text-[10px] text-emerald-600">{exp.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

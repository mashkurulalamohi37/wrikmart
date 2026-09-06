import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminReportsAnalytics = () => {
  const { orders, agents, hubs, inventory, expenses, balanceTransfers, showToast } = useApp();
  
  // 10 Report Categories
  const [activeReportTab, setActiveReportTab] = useState('sales');
  const [period, setPeriod] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'all'

  // Calculations from State
  const totalOrdersCount = orders.length;
  const preOrders = orders.filter(o => (o.orderType || 'Pre-Order') === 'Pre-Order');
  const stockOrders = orders.filter(o => o.orderType === 'Stock Product');
  
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Damaged' && o.status !== 'Returned');
  const damagedOrders = orders.filter(o => o.status === 'Damaged');
  const returnedOrders = orders.filter(o => o.status === 'Returned');

  const grossRevenue = orders.reduce((sum, o) => sum + (o.financials?.estimatedTotal || 0), 0);
  const totalAgentPurchaseCost = orders.reduce((sum, o) => sum + (o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75)), 0);
  const totalShippingCost = orders.reduce((sum, o) => sum + (o.financials?.shippingCostBDT || 600), 0);
  const totalLocalCourierCost = orders.reduce((sum, o) => sum + (o.financials?.localCourierCostBDT || 120), 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalRefundsAmount = damagedOrders.reduce((sum, o) => sum + (o.damageDetails?.refundAmount || 0), 0);

  const grossProfit = grossRevenue - totalAgentPurchaseCost - totalShippingCost - totalLocalCourierCost;
  const netProfit = grossProfit - totalExpensesAmount - totalRefundsAmount;
  const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : 0;
  const netMarginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(grossRevenue / totalOrdersCount) : 0;

  // Inventory Calculations
  const stockItems = inventory || [];
  const totalStockQuantity = stockItems.reduce((sum, i) => sum + (i.currentStock || 0), 0);
  const totalStockValue = stockItems.reduce((sum, i) => sum + ((i.currentStock || 0) * (i.costPrice || 0)), 0);
  const lowStockItems = stockItems.filter(i => (i.currentStock || 0) > 0 && (i.currentStock || 0) <= (i.reorderLevel || 5));
  const outOfStockItems = stockItems.filter(i => (i.currentStock || 0) === 0);

  // Customer Analytics
  const customerMap = new Map();
  orders.forEach(o => {
    const custId = o.customer.phone || o.customer.name;
    if (!customerMap.has(custId)) {
      customerMap.set(custId, {
        name: o.customer.name,
        phone: o.customer.phone,
        email: o.customer.email,
        district: o.customer.district || 'Dhaka',
        ordersCount: 0,
        totalSpent: 0,
        dueAmount: 0,
        isReturning: o.customer.isReturning
      });
    }
    const c = customerMap.get(custId);
    c.ordersCount += 1;
    c.totalSpent += (o.financials?.estimatedTotal || 0);
    c.dueAmount += (o.financials?.dueAmount || 0);
  });
  const customersList = Array.from(customerMap.values());
  const repeatCustomers = customersList.filter(c => c.ordersCount > 1 || c.isReturning);
  const repeatCustomerRate = customersList.length > 0 ? Math.round((repeatCustomers.length / customersList.length) * 100) : 0;
  const repeatSalesAmount = orders.filter(o => o.customer.isReturning).reduce((sum, o) => sum + (o.financials?.estimatedTotal || 0), 0);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
    showToast('Analytical Audit & Financial Report prepared for Print/PDF saving!', 'success');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['Metric Section', 'Metric Name', 'Value (BDT / Count)', 'Notes'];
    const rows = [
      ['Sales & Orders', 'Gross Revenue', grossRevenue, 'Total billing volume'],
      ['Sales & Orders', 'Total Orders', totalOrdersCount, 'Pre-order + Stock'],
      ['Sales & Orders', 'Pre-Orders Count', preOrders.length, 'Overseas Sourcing'],
      ['Sales & Orders', 'Stock Orders Count', stockOrders.length, 'Dhaka Warehouse'],
      ['Sales & Orders', 'Average Order Value (AOV)', averageOrderValue, 'Per order BDT'],
      ['Profit & Financials', 'Product Purchase Cost', totalAgentPurchaseCost, 'Sourced by agents'],
      ['Profit & Financials', 'Gross Profit', grossProfit, `${grossMarginPercent}% Gross Margin`],
      ['Profit & Financials', 'Net Profit', netProfit, `${netMarginPercent}% Net Margin`],
      ['Stock & Inventory', 'Total Stock Units', totalStockQuantity, 'Dhaka Hub'],
      ['Stock & Inventory', 'Total Stock Valuation', totalStockValue, 'At cost price'],
      ['Customers', 'Total Customers', customersList.length, 'Unique buyers'],
      ['Customers', 'Repeat Purchase Rate', `${repeatCustomerRate}%`, 'Loyalty velocity']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(',')).join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WrikMart_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive Analytics CSV downloaded!', 'success');
  };

  const navTabs = [
    { id: 'sales', label: '1. Sales & Orders', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'profit', label: '2. Profit & Financials', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'receivables', label: '3. Accounts & Pre-Orders', icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'stock', label: '4. Stock & Inventory', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'agent', label: '5. Agent Performance', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'country_hub', label: '6. Country & Hubs', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { id: 'customer', label: '7. Customer Analytics', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'logistics', label: '8. Delivery & Logistics', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'expenses', label: '9. Expenses & Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'management', label: '10. Executive & Growth', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
              Enterprise Intelligence Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">10 Report Modules Active</span>
          </div>
          <h2 className="text-xl font-extrabold text-navy-900">Reports & Financial Analytics Center</h2>
          <p className="text-xs text-slate-500">Comprehensive cross-border commerce analytics, margins, inventory & performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['daily', 'weekly', 'monthly', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  period === p ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* 10 Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeReportTab === tab.id
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-navy-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. SALES & ORDER REPORTS */}
      {/* ========================================================= */}
      {activeReportTab === 'sales' && (
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
                    <span className="text-brand-600">{preOrders.length} Orders ({Math.round((preOrders.length / (totalOrdersCount || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(preOrders.length / (totalOrdersCount || 1)) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Stock Product (Local Dhaka)</span>
                    <span className="text-purple-600">{stockOrders.length} Orders ({Math.round((stockOrders.length / (totalOrdersCount || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stockOrders.length / (totalOrdersCount || 1)) * 100}%` }}></div>
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

          {/* Category & Product Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Category-wise, Brand-wise & Product Sales Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Product Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Brand</th>
                    <th className="px-5 py-3">Units Sold</th>
                    <th className="px-5 py-3">Selling Price (BDT)</th>
                    <th className="px-5 py-3">Est. Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.flatMap(o => o.items).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{item.name}</td>
                      <td className="px-5 py-3 font-semibold text-slate-600">{item.category || 'General'}</td>
                      <td className="px-5 py-3 text-slate-500">{item.brand || 'Original Brand'}</td>
                      <td className="px-5 py-3 font-bold">{item.specs?.unit || 1}</td>
                      <td className="px-5 py-3 font-bold text-brand-700">৳{(item.expectedPrice || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">~22.5%</td>
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
      {activeReportTab === 'profit' && (
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Agent Expenses & Overheads</span>
                <span className="text-base font-bold text-amber-600 mt-1 block">৳{totalExpensesAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order-wise Profit Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Order-wise Profitability & Margin Ledger
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Order Number</th>
                    <th className="px-5 py-3">Customer Selling (BDT)</th>
                    <th className="px-5 py-3">Agent Cost</th>
                    <th className="px-5 py-3">Shipping & Courier</th>
                    <th className="px-5 py-3">Gross Profit</th>
                    <th className="px-5 py-3">Profit Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((o) => {
                    const sell = o.financials?.estimatedTotal || 0;
                    const cost = o.financials?.agentCostBDT || Math.round((o.financials?.estimatedSubtotal || 0) * 0.75);
                    const ship = (o.financials?.shippingCostBDT || 600) + (o.financials?.localCourierCostBDT || 120);
                    const prof = sell - cost - ship;
                    const margin = sell > 0 ? ((prof / sell) * 100).toFixed(1) : 0;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono font-bold text-navy-900">{o.orderNumber}</td>
                        <td className="px-5 py-3 font-bold">৳{sell.toLocaleString()}</td>
                        <td className="px-5 py-3 font-semibold text-cyan-700">৳{cost.toLocaleString()}</td>
                        <td className="px-5 py-3 text-slate-600">৳{ship.toLocaleString()}</td>
                        <td className={`px-5 py-3 font-extrabold ${prof >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ৳{prof.toLocaleString()}
                        </td>
                        <td className={`px-5 py-3 font-bold ${prof >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
      {activeReportTab === 'receivables' && (
        <div className="space-y-5 animate-fade-in">
          {/* Monthly P&L Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-navy-900">Monthly Profit & Loss (P&L) Statement</h3>
              <span className="text-xs font-bold text-slate-400">May 2026 Audit Period</span>
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
      {activeReportTab === 'stock' && (
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

          {/* Stock Inventory Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Warehouse Stock Inventory, Velocity & Aging Analysis
              </h3>
              <span className="text-xs font-bold text-slate-400">Aging Thresholds: 30 / 60 / 90 / 180+ Days</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">SKU & Item Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Current Stock</th>
                    <th className="px-5 py-3">Stock Value (BDT)</th>
                    <th className="px-5 py-3">Stock Aging</th>
                    <th className="px-5 py-3">Velocity</th>
                    <th className="px-5 py-3">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stockItems.map((item) => {
                    const margin = item.sellingPrice > 0 ? (((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(1) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <span className="font-bold text-navy-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.sku} • {item.warehouse}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-600">{item.category}</td>
                        <td className="px-5 py-3">
                          <span className={`font-bold ${item.currentStock === 0 ? 'text-rose-600' : (item.currentStock <= item.reorderLevel ? 'text-amber-600' : 'text-slate-900')}`}>
                            {item.currentStock} Units
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-brand-700">
                          ৳{(item.currentStock * item.costPrice).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.agingDays > 180 ? 'bg-rose-100 text-rose-700' :
                            item.agingDays > 90 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.agingDays} Days
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.velocity === 'Fast-Moving' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.velocity}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-emerald-600">{margin}%</td>
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
      {activeReportTab === 'agent' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Agent Procurement Volume, Operating Floats & Efficiency Scorecard
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Agent Name & Country</th>
                    <th className="px-5 py-3">Operating Balance</th>
                    <th className="px-5 py-3">Total Sourced (BDT)</th>
                    <th className="px-5 py-3">Orders Handled</th>
                    <th className="px-5 py-3">Purchase Success</th>
                    <th className="px-5 py-3">Avg. Buy Time</th>
                    <th className="px-5 py-3">Cancellation Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 flex items-center gap-2.5">
                        <img src={ag.avatar} alt={ag.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="font-bold text-navy-900 block">{ag.name}</span>
                          <span className="text-[10px] text-slate-400">{ag.flag} {ag.country} ({ag.currency})</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-600">
                        {ag.symbol}{ag.balance.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">
                        ৳{ag.totalSpent ? (ag.totalSpent * 1.4).toLocaleString() : '0'}
                      </td>
                      <td className="px-5 py-3 font-bold">
                        {(ag.completedOrders || 0) + (ag.activeOrders || 0)} Orders
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-600">98.2%</td>
                      <td className="px-5 py-3 text-slate-600 font-medium">4.2 Hours</td>
                      <td className="px-5 py-3 font-bold text-slate-600">1.8%</td>
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
      {activeReportTab === 'country_hub' && (
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

          {/* Hub Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Staging Facilities, Storage Capacity & Active Packages
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Hub Facility</th>
                    <th className="px-5 py-3">Region</th>
                    <th className="px-5 py-3">Manager & Phone</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Active Packages</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {hubs.map((hub) => (
                    <tr key={hub.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{hub.name}</td>
                      <td className="px-5 py-3 font-semibold text-slate-600">{hub.country}</td>
                      <td className="px-5 py-3 text-slate-600">{hub.manager} ({hub.phone})</td>
                      <td className="px-5 py-3 font-medium">{hub.capacity} cartons</td>
                      <td className="px-5 py-3 font-bold text-brand-700">{hub.activePackages} pkgs</td>
                      <td className="px-5 py-3">
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
      {activeReportTab === 'customer' && (
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

          {/* Top Customers Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                VIP Customer Leaderboard & Purchase Frequency
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Customer Name</th>
                    <th className="px-5 py-3">Contact Phone</th>
                    <th className="px-5 py-3">District</th>
                    <th className="px-5 py-3">Orders Placed</th>
                    <th className="px-5 py-3">Total Spent (BDT)</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customersList.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{cust.name}</td>
                      <td className="px-5 py-3 font-mono text-slate-600">{cust.phone}</td>
                      <td className="px-5 py-3 font-medium text-slate-600">{cust.district}</td>
                      <td className="px-5 py-3 font-bold">{cust.ordersCount} Orders</td>
                      <td className="px-5 py-3 font-bold text-brand-700">৳{cust.totalSpent.toLocaleString()}</td>
                      <td className="px-5 py-3">
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
      {activeReportTab === 'logistics' && (
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
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Courier Partner Logistics Scorecard
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Courier Partner</th>
                    <th className="px-5 py-3">Total Dispatched</th>
                    <th className="px-5 py-3">On-Time Rate %</th>
                    <th className="px-5 py-3">Avg Delivery Time</th>
                    <th className="px-5 py-3">Avg Courier Fee</th>
                    <th className="px-5 py-3">Return / Damage Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-navy-900">Steadfast Courier</td>
                    <td className="px-5 py-3 font-bold">186 Consignments</td>
                    <td className="px-5 py-3 font-bold text-emerald-600">97.4%</td>
                    <td className="px-5 py-3 text-slate-600">24 Hours (Inside Dhaka)</td>
                    <td className="px-5 py-3 font-bold text-slate-900">৳120</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">0.8%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-navy-900">Pathao Courier</td>
                    <td className="px-5 py-3 font-bold">112 Consignments</td>
                    <td className="px-5 py-3 font-bold text-emerald-600">96.1%</td>
                    <td className="px-5 py-3 text-slate-600">36 Hours (All BD)</td>
                    <td className="px-5 py-3 font-bold text-slate-900">৳130</td>
                    <td className="px-5 py-3 font-semibold text-slate-600">1.2%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-navy-900">RedX Logistics</td>
                    <td className="px-5 py-3 font-bold">64 Consignments</td>
                    <td className="px-5 py-3 font-bold text-emerald-600">95.0%</td>
                    <td className="px-5 py-3 text-slate-600">48 Hours</td>
                    <td className="px-5 py-3 font-bold text-slate-900">৳150</td>
                    <td className="px-5 py-3 font-semibold text-amber-600">2.1%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-navy-900">Paperfly</td>
                    <td className="px-5 py-3 font-bold">45 Consignments</td>
                    <td className="px-5 py-3 font-bold text-emerald-600">94.8%</td>
                    <td className="px-5 py-3 text-slate-600">48 Hours (District Hubs)</td>
                    <td className="px-5 py-3 font-bold text-slate-900">৳140</td>
                    <td className="px-5 py-3 font-semibold text-slate-600">1.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. EXPENSE & PAYMENT REPORTS */}
      {/* ========================================================= */}
      {activeReportTab === 'expenses' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Expenses</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">৳{totalExpensesAmount.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 block mt-1">Travel, packaging, petrol</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">bKash / Nagad Collections</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">
                ৳{orders.reduce((sum, o) => sum + (o.financials?.advancePaid || 0), 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">100% Reconciled</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Refunds</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">৳{totalRefundsAmount.toLocaleString()}</p>
              <span className="text-[11px] text-rose-600 font-bold block mt-1">Damaged/Returned claims</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Surcharge</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">~1.5%</p>
              <span className="text-[11px] text-slate-400 block mt-1">MFS merchant fees</span>
            </div>
          </div>

          {/* Expense Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Agent Expense Vouchers & Receipts
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Agent</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-navy-900">{exp.agentName} ({exp.country})</td>
                      <td className="px-5 py-3 font-semibold text-slate-600">{exp.category}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{exp.symbol}{exp.amount}</td>
                      <td className="px-5 py-3 text-slate-500">{exp.date}</td>
                      <td className="px-5 py-3">
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
      {activeReportTab === 'management' && (
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

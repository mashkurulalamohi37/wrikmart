import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Users, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Globe2, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Sparkles,
  Plus,
  PackageX,
  Inbox
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminDashboard = ({ onNavigateToOrder, onNavigateToTab, onCreateOrder }) => {
  const { orders = [], agents = [], registeredUsers = [], customers = [] } = useApp();

  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.financials?.estimatedTotal || o.financials?.finalSellingPrice || 0), 0);
  const totalCustomerCount = (registeredUsers.filter(u => u.role === 'customer').length) + customers.length;
  const totalAgentsCount = agents.length;

  // Dynamic Status Breakdown
  const processingCount = orders.filter(o => ['Submitted', 'Assigned', 'Purchased', 'In Sourcing', 'Processing'].includes(o.status)).length;
  const inTransitCount = orders.filter(o => ['At Hub', 'Air Freight', 'Received in BD', 'Customs Cleared', 'At Delivery House'].includes(o.status)).length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  // Dynamic Country Share
  const indiaOrders = orders.filter(o => (o.country || '').toLowerCase().includes('india') || o.assignedAgentId === 'agent-1').length;
  const dubaiOrders = orders.filter(o => (o.country || '').toLowerCase().includes('dubai') || (o.country || '').toLowerCase().includes('uae') || o.assignedAgentId === 'agent-2').length;
  const thaiOrders = orders.filter(o => (o.country || '').toLowerCase().includes('thailand') || o.assignedAgentId === 'agent-3').length;

  const indiaPct = totalOrdersCount > 0 ? Math.round((indiaOrders / totalOrdersCount) * 100) : 0;
  const dubaiPct = totalOrdersCount > 0 ? Math.round((dubaiOrders / totalOrdersCount) * 100) : 0;
  const thaiPct = totalOrdersCount > 0 ? Math.round((thaiOrders / totalOrdersCount) * 100) : 0;

  // Dynamic 7-Day Trend
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const isoDate = d.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => {
        const orderDate = (o.orderDate || o.createdAt || '').split('T')[0];
        return orderDate === isoDate;
      }).length;

      days.push({
        day: dayLabel,
        val: dayOrders,
        color: dayOrders > 0 ? 'bg-brand-500' : 'bg-slate-200'
      });
    }
    return days;
  }, [orders]);

  const maxVal = Math.max(...last7Days.map(d => d.val), 5);

  const dateRangeLabel = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Manual Order Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-navy-900">Admin Operations Dashboard</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] border border-emerald-200">
              Live Systems
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time international sourcing, Dhaka hub dispatch & warehouse stock</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onCreateOrder || (() => onNavigateToTab('orders'))}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow transition-all whitespace-nowrap w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Order (Manual)</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-navy-900 font-sans">{totalOrdersCount}</span>
            <span className="text-xs font-bold text-slate-500">Live Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-border pre-orders & ready stock</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-navy-900 font-sans">{totalCustomerCount}</span>
            <span className="text-xs font-bold text-slate-500">Registered</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active verified pre-order buyers</p>
        </div>

        {/* Total Agents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Agents</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-navy-900 font-sans">{totalAgentsCount}</span>
            <span className="text-xs font-bold text-slate-500">Stationed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">India, Dubai & Thailand sourcing hubs</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-navy-900 font-sans">৳ {totalRevenue.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">Gross</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross order transaction volume</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Order & Revenue Trend Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy-900 text-base">Order Statistics & Volume Trend</h3>
              <p className="text-xs text-slate-400">Monthly cross-border demand breakdown</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold">
              Date Range: {dateRangeLabel}
            </span>
          </div>

          {/* Graphical Bars representation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 relative">
            {totalOrdersCount === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center bg-white/70 backdrop-blur-[1px] rounded-xl z-10">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600">No Order Volume Trends Yet</p>
                  <p className="text-[11px] text-slate-400">Live order activity will automatically generate daily bars</p>
                </div>
              </div>
            )}
            {last7Days.map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {col.val}
                </div>
                <div 
                  style={{ height: `${col.val > 0 ? (col.val / maxVal) * 100 : 4}%` }}
                  className={`w-full max-w-[36px] ${col.color} rounded-t-lg transition-all group-hover:brightness-110 shadow-sm`}
                />
                <span className="text-[11px] font-semibold text-slate-500">{col.day}</span>
              </div>
            ))}
          </div>

          {/* Country Distribution Bar */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-600 mb-2">Orders by Country Share</h4>
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
              {totalOrdersCount > 0 ? (
                <>
                  <div style={{ width: `${indiaPct}%` }} className="bg-orange-500 transition-all" title={`India (${indiaPct}%)`} />
                  <div style={{ width: `${dubaiPct}%` }} className="bg-cyan-500 transition-all" title={`Dubai (${dubaiPct}%)`} />
                  <div style={{ width: `${thaiPct}%` }} className="bg-emerald-500 transition-all" title={`Thailand (${thaiPct}%)`} />
                </>
              ) : (
                <div style={{ width: '100%' }} className="bg-slate-200" title="0 Orders" />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> India: {indiaPct}% ({indiaOrders} orders)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Dubai: {dubaiPct}% ({dubaiOrders} orders)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Thailand: {thaiPct}% ({thaiOrders} orders)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Orders by Status Donut & Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-6">
          <div>
            <h3 className="font-bold text-navy-900 text-base">Orders by Status</h3>
            <p className="text-xs text-slate-400">Live operational lifecycle</p>
          </div>

          {/* Donut representation */}
          <div className={`relative w-40 h-40 mx-auto rounded-full border-8 ${totalOrdersCount > 0 ? 'border-brand-500' : 'border-slate-200'} flex items-center justify-center shadow-inner transition-colors`}>
            <div className="text-center">
              <span className="text-2xl font-extrabold text-navy-900">{totalOrdersCount}</span>
              <span className="text-[10px] text-slate-400 block">Total Active</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Processing / Purchasing
              </span>
              <strong className="text-navy-900">{processingCount}</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> At Hub / Air Freight
              </span>
              <strong className="text-navy-900">{inTransitCount}</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Delivered to Customers
              </span>
              <strong className="text-navy-900">{deliveredCount}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Pre-Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900 text-sm">Recent Pre-Orders</h3>
            <p className="text-xs text-slate-400">Latest orders submitted by customers</p>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar sm:scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Order ID</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Customer (Admin View)</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Country</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Assigned Agent</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Advance Paid</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Status</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.length > 0 ? (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-mono font-bold text-navy-900">{order.orderNumber}</td>
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                      <span className="font-bold text-slate-900 block">{order.customer?.name}</span>
                      <span className="text-[11px] text-slate-400">{order.customer?.phone}</span>
                    </td>
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <CountryFlag country={order.country || order.countryFlag} className="w-4 h-3 rounded-[2px]" />
                        <span>{order.country}</span>
                      </span>
                    </td>
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-semibold text-brand-700">
                      {order.assignedAgentName || 'Unassigned'}
                    </td>
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-bold text-emerald-600">
                      ৳{(order.financials?.advancePaid || 0).toLocaleString()}
                    </td>
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Purchased' ? 'bg-cyan-100 text-cyan-700' :
                        order.status === 'At Delivery House' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 text-right">
                      <button
                        onClick={() => onNavigateToOrder(order)}
                        className="text-xs font-bold text-brand-600 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        360° View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-bold text-xs text-slate-600">No Orders in System Yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Customer pre-orders and manual admin orders will appear here in real time.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

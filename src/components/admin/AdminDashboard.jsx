import React from 'react';
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
  Plus
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminDashboard = ({ onNavigateToOrder, onNavigateToTab, onCreateOrder }) => {
  const { orders, agents, exchangeRates } = useApp();

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

      {/* 4 Metric Top Stat Cards matching Visual Board 1 */}
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
            <span className="text-3xl font-extrabold text-navy-900 font-sans">2,548</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.5%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-border pre-orders this month</p>
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
            <span className="text-3xl font-extrabold text-navy-900 font-sans">1,685</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.3%
            </span>
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
            <span className="text-3xl font-extrabold text-navy-900 font-sans">58</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +6.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">India (24), Dubai (18), Thailand (16)</p>
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
            <span className="text-3xl font-extrabold text-navy-900 font-sans">৳ 42,95,300</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22.1%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross pre-order transaction volume</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Order & Revenue Trend Charts (Visual Representation) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy-900 text-base">Order Statistics & Volume Trend</h3>
              <p className="text-xs text-slate-400">Monthly cross-border demand breakdown</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold">
              Date Range: 12 May - 12 Jun 2026
            </span>
          </div>

          {/* Graphical Bars representation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {[
              { day: '06 May', val: 65, color: 'bg-brand-400' },
              { day: '07 May', val: 82, color: 'bg-brand-500' },
              { day: '08 May', val: 45, color: 'bg-brand-400' },
              { day: '09 May', val: 95, color: 'bg-brand-600' },
              { day: '10 May', val: 70, color: 'bg-brand-500' },
              { day: '11 May', val: 110, color: 'bg-brand-500' },
              { day: '12 May', val: 130, color: 'bg-brand-600' }
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {col.val}
                </div>
                <div 
                  style={{ height: `${(col.val / 140) * 100}%` }}
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
              <div style={{ width: '42%' }} className="bg-orange-500" title="India (42%)" />
              <div style={{ width: '38%' }} className="bg-cyan-500" title="Dubai (38%)" />
              <div style={{ width: '20%' }} className="bg-emerald-500" title="Thailand (20%)" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> India: 42% (1,070 orders)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Dubai: 38% (968 orders)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Thailand: 20% (510 orders)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Orders by Status Donut & Agent Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-6">
          <div>
            <h3 className="font-bold text-navy-900 text-base">Orders by Status</h3>
            <p className="text-xs text-slate-400">Live operational lifecycle</p>
          </div>

          {/* Donut representation */}
          <div className="relative w-40 h-40 mx-auto rounded-full border-8 border-brand-500 flex items-center justify-center shadow-inner">
            <div className="text-center">
              <span className="text-2xl font-extrabold text-navy-900">2,548</span>
              <span className="text-[10px] text-slate-400 block">Total Active</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Processing / Purchasing
              </span>
              <strong className="text-navy-900">342</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> At Hub / Air Freight
              </span>
              <strong className="text-navy-900">624</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Delivered to Customers
              </span>
              <strong className="text-navy-900">1,582</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Pre-Orders Table matching Visual Board 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900 text-sm">Recent Pre-Orders</h3>
            <p className="text-xs text-slate-400">Latest orders submitted by customers</p>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
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
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-mono font-bold text-navy-900">{order.orderNumber}</td>
                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    <span className="font-bold text-slate-900 block">{order.customer.name}</span>
                    <span className="text-[11px] text-slate-400">{order.customer.phone}</span>
                  </td>
                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <CountryFlag country={order.country || order.countryFlag} className="w-4 h-3 rounded-[2px]" />
                      <span>{order.country}</span>
                    </span>
                  </td>
                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-semibold text-brand-700">
                    {order.assignedAgentName}
                  </td>
                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-bold text-emerald-600">
                    ৳{order.financials.advancePaid.toLocaleString()}
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
                      className="text-xs font-bold text-brand-600 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      360° View
                    </button>
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

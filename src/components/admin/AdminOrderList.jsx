import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  UserPlus, 
  ExternalLink, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck,
  ArrowRight
} from 'lucide-react';

export const AdminOrderList = ({ onSelectOrder }) => {
  const { orders, agents, assignAgentToOrder, updateOrderStatus, showToast } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredOrders = orders.filter(order => {
    if (selectedCountry !== 'All' && order.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
    if (selectedStatus !== 'All' && order.status !== selectedStatus) return false;
    
    if (searchTerm) {
      const matchId = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCustomer = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = order.customer.phone.includes(searchTerm);
      const matchItem = order.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchId && !matchCustomer && !matchPhone && !matchItem) return false;
    }
    return true;
  });

  const exportOrdersToCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('No orders found to export', 'warning');
      return;
    }
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'District', 'Country', 'Assigned Agent', 'Items Count', 'Estimated Total (BDT)', 'Advance Paid (BDT)', 'Status', 'Payment Status'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      `"${o.createdAt}"`,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.district || 'Dhaka'}"`,
      o.country,
      `"${o.assignedAgentName || 'Unassigned'}"`,
      o.items.length,
      o.financials.estimatedTotal,
      o.financials.advancePaid,
      o.status,
      o.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WrikMart_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredOrders.length} orders to CSV!`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Pre-Order Management</h2>
          <p className="text-xs text-slate-500">Monitor all customer requests, agent assignments and purchases</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportOrdersToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-soft transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Customer, Phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Countries (India, Dubai, Thailand)</option>
            <option value="India">🇮🇳 India</option>
            <option value="Dubai">🇦🇪 Dubai</option>
            <option value="Thailand">🇹🇭 Thailand</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing / Sourcing</option>
            <option value="Purchased">Purchased (Price Recorded)</option>
            <option value="At Delivery House">At Delivery House / Hub</option>
            <option value="In Transit">In Transit (Air Cargo)</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer Details</th>
                <th className="px-5 py-3.5">Country & Items</th>
                <th className="px-5 py-3.5">Assigned Agent</th>
                <th className="px-5 py-3.5">Advance & Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-navy-900 block">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">{order.createdAt}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-navy-900 block">{order.customer.name}</span>
                      <span className="text-[11px] text-slate-500">{order.customer.phone}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-xs">{order.customer.address}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900 block">
                        {order.countryFlag} {order.country} ({order.items.length} items)
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[180px]">
                        {order.items.map(i => i.name).join(', ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={order.assignedAgentId}
                        onChange={(e) => assignAgentToOrder(order.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 focus:ring-1 focus:ring-brand-500"
                      >
                        {agents.map(ag => (
                          <option key={ag.id} value={ag.id}>
                            {ag.flag} {ag.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-emerald-600 block">
                        Advance: ৳{order.financials.advancePaid.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Total: ৳{order.financials.estimatedTotal.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'Purchased' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                          order.status === 'At Delivery House' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Purchased">Purchased</option>
                        <option value="At Delivery House">At Delivery House</option>
                        <option value="In Transit">In Transit</option>
                        <option value="BD Received">BD Received</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        360° View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

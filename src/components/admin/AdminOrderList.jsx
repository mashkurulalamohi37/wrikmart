import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminCreateOrderModal } from './AdminCreateOrderModal';
import { AdminDamageReturnModal } from './AdminDamageReturnModal';
import { AdminReceiveBDModal } from './AdminReceiveBDModal';
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
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Package,
  Globe2,
  PackageCheck,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminOrderList = ({ onSelectOrder }) => {
  const { orders, agents, assignAgentToOrder, updateOrderStatus, deleteAdminOrder, showToast } = useApp();
  const [selectedOrderForReceive, setSelectedOrderForReceive] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrderType, setSelectedOrderType] = useState('All'); // 'All' | 'Pre-Order' | 'Stock Product'
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrderForDamage, setSelectedOrderForDamage] = useState(null);

  const filteredOrders = orders.filter(order => {
    if (selectedCountry !== 'All' && order.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
    if (selectedStatus !== 'All' && order.status !== selectedStatus) return false;
    if (selectedOrderType !== 'All' && (order.orderType || 'Pre-Order') !== selectedOrderType) return false;
    
    if (searchTerm) {
      const matchId = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCustomer = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = order.customer.phone.includes(searchTerm);
      const matchItem = order.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchId && !matchCustomer && !matchPhone && !matchItem) return false;
    }
    return true;
  });

  const sanitizeCsvField = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    // Neutralize formula injection triggers: =, +, -, @, tab, cr
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const exportOrdersToCSV = () => {
    const headers = [
      'Order ID', 'Type', 'Country', 'Customer Name', 'Phone', 
      'District', 'Agent', 'Status', 'Payment Status', 
      'Subtotal (BDT)', 'Delivery Charge (BDT)', 'Total (BDT)', 
      'Advance Paid (BDT)', 'Due Amount (BDT)', 'Created Date'
    ];
    
    const rows = filteredOrders.map(o => [
      sanitizeCsvField(o.orderNumber),
      sanitizeCsvField(o.orderType || 'Pre-Order'),
      sanitizeCsvField(o.country),
      sanitizeCsvField(o.customer.name),
      sanitizeCsvField(o.customer.phone),
      sanitizeCsvField(o.customer.district || 'Dhaka'),
      sanitizeCsvField(o.assignedAgentName || 'Unassigned'),
      sanitizeCsvField(o.status),
      sanitizeCsvField(o.paymentStatus || 'Advance Paid'),
      sanitizeCsvField(o.financials.estimatedSubtotal),
      sanitizeCsvField(o.financials.deliveryCharge),
      sanitizeCsvField(o.financials.estimatedTotal),
      sanitizeCsvField(o.financials.advancePaid),
      sanitizeCsvField(o.financials.dueAmount),
      sanitizeCsvField(o.createdAt)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wrikmart_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Pre-Order & Stock Order Management</h2>
          <p className="text-xs text-slate-500">Monitor all customer pre-orders, local warehouse stock, agent sourcing & damage logs</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Order</span>
          </button>

          <button
            onClick={exportOrdersToCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-soft transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Customer, Phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedOrderType}
            onChange={(e) => setSelectedOrderType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Types (Pre-Order & Stock)</option>
            <option value="Pre-Order">Pre-Order Only</option>
            <option value="Stock Product">Stock Product Only</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Sourcing Regions</option>
            <option value="India">🇮🇳 India</option>
            <option value="Dubai">🇦🇪 Dubai</option>
            <option value="Thailand">🇹🇭 Thailand</option>
            <option value="Bangladesh">🇧🇩 Bangladesh (Local Stock)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="Processing">Processing / Sourcing</option>
            <option value="Purchased">Purchased</option>
            <option value="At Delivery House">At Delivery House / Hub</option>
            <option value="Shipped">Shipped to BD</option>
            <option value="BD Received">Bangladesh Received</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Damaged">⚠️ Damaged Consignment</option>
            <option value="Returned">🔄 Returned to Vendor / Hub</option>
          </select>
        </div>
      </div>

      {/* Orders Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto no-scrollbar sm:scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Order Number</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Type & Region</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Customer & Phone</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Assigned Agent</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Financials (BDT)</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5">Status & Incidents</th>
                <th className="px-3.5 sm:px-5 py-3 sm:py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    <span className="font-mono font-bold text-navy-900 block">{order.orderNumber}</span>
                    <span className="text-[10px] text-slate-400">{order.createdAt}</span>
                  </td>

                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <CountryFlag country={order.country || order.countryFlag} className="w-4 h-3 rounded-[2px]" />
                      <span>{order.country}</span>
                    </div>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                      order.orderType === 'Stock Product' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-cyan-100 text-cyan-700'
                    }`}>
                      {order.orderType || 'Pre-Order'}
                    </span>
                  </td>

                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    <span className="font-bold text-slate-900 block">{order.customer.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{order.customer.phone}</span>
                    <span className="text-[10px] text-slate-400 block">{order.customer.district || 'Dhaka'}</span>
                  </td>

                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    {order.orderType === 'Stock Product' ? (
                      <span className="text-slate-500 font-medium italic">Dhaka Central Hub</span>
                    ) : order.assignedAgentName ? (
                      <div>
                        <span className="font-bold text-brand-700 block">{order.assignedAgentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Agent ID: {order.assignedAgentId}</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    <span className="font-bold text-navy-900 block">৳{order.financials.estimatedTotal?.toLocaleString()}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold block">
                      Adv: ৳{order.financials.advancePaid?.toLocaleString()}
                    </span>
                    {order.financials.dueAmount > 0 && (
                      <span className="text-[10px] text-amber-600 block">
                        Due: ৳{order.financials.dueAmount?.toLocaleString()}
                      </span>
                    )}
                  </td>

                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'BD Received' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      order.status === 'Damaged' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      order.status === 'Returned' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      order.status === 'Purchased' ? 'bg-cyan-100 text-cyan-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status === 'Damaged' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {order.status === 'Returned' && <RotateCcw className="w-3 h-3 text-amber-600" />}
                      {order.status === 'BD Received' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      <span>{order.status === 'BD Received' ? 'Received in BD' : order.status}</span>
                    </span>

                    {order.damageDetails && (
                      <span 
                        onClick={() => setSelectedOrderForDamage(order)}
                        className="text-[10px] text-rose-600 font-bold block mt-1 hover:underline cursor-pointer"
                      >
                        {order.damageDetails.incidentType} ({order.damageDetails.resolutionStatus})
                      </span>
                    )}
                  </td>

                  <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-nowrap">
                      {order.country !== 'Bangladesh' && (order.status === 'Purchased' || order.status === 'At Delivery House' || order.status === 'Shipped') && (
                        <button
                          onClick={() => setSelectedOrderForReceive(order)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Receive Consignment at Bangladesh Hub & Calculate Profit/Loss"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit Order Option */}
                      <button
                        onClick={() => setSelectedOrderForEdit(order)}
                        className="p-1.5 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit Order Details & Items"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Order Option */}
                      <button
                        onClick={() => setOrderToDelete(order)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedOrderForDamage(order)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title={order.damageDetails ? "Edit Damage / Return Resolution" : "Report Damage / Return"}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-2.5 sm:px-3 py-1.5 bg-brand-50 hover:bg-brand-100 active:scale-95 text-brand-700 font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                        title="360° Order Details View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">360° View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <AdminCreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Edit Order Modal */}
      {selectedOrderForEdit && (
        <AdminCreateOrderModal 
          editingOrder={selectedOrderForEdit} 
          onClose={() => setSelectedOrderForEdit(null)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-base text-navy-900">Delete Order #{orderToDelete.orderNumber}?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this order for customer <strong className="text-navy-900">{orderToDelete.customer.name}</strong>? 
                This action cannot be undone.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Order Type:</span>
                <span className="font-bold text-navy-900">{orderToDelete.orderType || 'Pre-Order'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-bold text-navy-900">৳{orderToDelete.financials?.estimatedTotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance Paid:</span>
                <span className="font-bold text-emerald-600">৳{orderToDelete.financials?.advancePaid?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAdminOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Damage / Return Modal */}
      {selectedOrderForDamage && (
        <AdminDamageReturnModal 
          order={selectedOrderForDamage} 
          onClose={() => setSelectedOrderForDamage(null)} 
        />
      )}

      {/* Receive in Bangladesh Modal */}
      {selectedOrderForReceive && (
        <AdminReceiveBDModal 
          order={selectedOrderForReceive} 
          onClose={() => setSelectedOrderForReceive(null)} 
        />
      )}
    </div>
  );
};

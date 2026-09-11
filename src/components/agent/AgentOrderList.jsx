import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AgentDamageReportModal } from './AgentDamageReportModal';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Receipt, 
  Building2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Package,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AgentOrderList = ({ onSelectOrderForPurchase, onSelectOrderForHub, onSelectOrderForLink }) => {
  const { activeAgent, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('To Buy'); // 'To Buy' | 'Purchased / Hub' | 'In Transit' | 'BD Received' | 'Damaged' | 'All'
  const [selectedOrderForDamage, setSelectedOrderForDamage] = useState(null);

  // Filter orders for active agent's country
  const allAgentOrders = orders.filter(o => {
    return o.assignedAgentId === activeAgent.id || o.country.toLowerCase() === activeAgent.country.toLowerCase();
  });

  // Calculate live counts for each tab
  const countToBuy = allAgentOrders.filter(o => o.status === 'Processing' && !o.damageDetails && o.status !== 'Damaged').length;
  const countPurchasedHub = allAgentOrders.filter(o => (o.status === 'Purchased' || o.status === 'At Delivery House') && !o.damageDetails && o.status !== 'Damaged').length;
  const countInTransit = allAgentOrders.filter(o => (o.status === 'In Transit' || o.status === 'Shipped') && !o.damageDetails && o.status !== 'Damaged').length;
  const countBDReceived = allAgentOrders.filter(o => o.status === 'BD Received' || o.status === 'Ready for Delivery' || o.status === 'Delivered').length;
  const countDamaged = allAgentOrders.filter(o => o.status === 'Damaged' || o.status === 'Returned' || Boolean(o.damageDetails)).length;

  const TABS = [
    { id: 'To Buy', label: 'To Buy (Sourcing)', count: countToBuy, badgeClass: 'bg-amber-100 text-amber-800' },
    { id: 'Purchased / Hub', label: 'Purchased / At Hub', count: countPurchasedHub, badgeClass: 'bg-cyan-100 text-cyan-800' },
    { id: 'In Transit', label: 'In Transit to BD', count: countInTransit, badgeClass: 'bg-indigo-100 text-indigo-800' },
    { id: 'BD Received', label: 'BD Received / Delivered', count: countBDReceived, badgeClass: 'bg-emerald-100 text-emerald-800' },
    { id: 'Damaged', label: '⚠️ Damage / Returns', count: countDamaged, badgeClass: 'bg-rose-100 text-rose-800' },
    { id: 'All', label: 'All Orders', count: allAgentOrders.length, badgeClass: 'bg-slate-100 text-slate-800' }
  ];

  const agentOrders = allAgentOrders.filter(o => {
    if (searchTerm) {
      const matchNumber = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchItem = o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchNumber && !matchItem) return false;
    }

    if (activeTab === 'To Buy') return o.status === 'Processing' && !o.damageDetails && o.status !== 'Damaged';
    if (activeTab === 'Purchased / Hub') return (o.status === 'Purchased' || o.status === 'At Delivery House') && !o.damageDetails && o.status !== 'Damaged';
    if (activeTab === 'In Transit') return (o.status === 'In Transit' || o.status === 'Shipped') && !o.damageDetails && o.status !== 'Damaged';
    if (activeTab === 'BD Received') return o.status === 'BD Received' || o.status === 'Ready for Delivery' || o.status === 'Delivered';
    if (activeTab === 'Damaged') return o.status === 'Damaged' || o.status === 'Returned' || Boolean(o.damageDetails);
    if (activeTab === 'All') return true;
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Product Name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>
      </div>

      {/* Tabs Filter with Live Badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? (tab.id === 'Damaged' ? 'bg-rose-600 text-white shadow-sm' : 'bg-navy-900 text-white shadow-sm')
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-white/20 text-white' : tab.badgeClass
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Strict Privacy Shield Indicator */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
        <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
        <span>Agent View: Customer Contact & Selling Prices are securely masked.</span>
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {agentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No orders found in this status</p>
            <p className="text-[11px] text-slate-400 mt-0.5">New assigned orders will appear here automatically.</p>
          </div>
        ) : (
          agentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft hover:shadow-card transition-all"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-navy-900">{order.orderNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1.5">
                    <CountryFlag country={order.country || order.countryFlag} className="w-4 h-3 rounded-[2px]" />
                    <span>{order.country}</span>
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'BD Received' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  order.status === 'Damaged' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  order.status === 'Returned' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  order.status === 'Purchased' ? 'bg-cyan-100 text-cyan-700' :
                  order.status === 'At Delivery House' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'In Transit' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.status === 'BD Received' ? 'Received in BD Hub' : order.status}
                </span>
              </div>

              {/* Order Items for Agent */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-navy-900 truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Size: <strong className="text-slate-800">{item.specs.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-slate-800">{item.specs.color}</strong></span>
                        <span>•</span>
                        <span>Qty: <strong className="text-slate-800">{item.specs.unit}</strong></span>
                      </div>

                      {/* Pricing Status for Agent */}
                      <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                        {item.actualPurchasePrice ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Purchased: {item.actualPurchaseCurrency} {item.actualPurchasePrice.toLocaleString()} (MRP: {item.mrp})
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ⚠️ Price Update Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Toolbar for Agent */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectOrderForLink(order)}
                  className="flex-1 min-w-[120px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
                  <span>View Link & Photo</span>
                </button>

                {order.status === 'BD Received' || order.status === 'Delivered' ? (
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 flex-1 justify-center sm:justify-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Safely Received at Bangladesh Hub ✅</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectOrderForPurchase(order)}
                      className={`flex-1 min-w-[140px] text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 ${
                        order.status === 'Processing' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-500 hover:bg-brand-600'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{order.status === 'Processing' ? 'Update Price & MRP' : 'Edit Purchase'}</span>
                    </button>

                    {order.status === 'Purchased' && (
                      <button
                        onClick={() => onSelectOrderForHub(order)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        title="Deliver to Warehouse Hub"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Hub Delivery</span>
                      </button>
                    )}

                    {order.status === 'At Delivery House' && (
                      <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold flex items-center gap-1 border border-purple-200">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Staged at Overseas Hub</span>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setSelectedOrderForDamage(order)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Report Damaged or Return Item"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Defect / Return</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Damage / Return Modal for Agent */}
      {selectedOrderForDamage && (
        <AgentDamageReportModal
          order={selectedOrderForDamage}
          onClose={() => setSelectedOrderForDamage(null)}
        />
      )}
    </div>
  );
};

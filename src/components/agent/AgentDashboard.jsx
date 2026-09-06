import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CountryFlag } from '../common/CountryFlag';
import { 
  Wallet, 
  ArrowDownRight, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Truck, 
  PlusCircle, 
  Receipt, 
  Building2, 
  History, 
  MessageCircle,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AgentDashboard = ({ onNavigate, onOpenPurchase, onOpenHub, onOpenOrderDetails }) => {
  const { 
    activeAgent, 
    orders, 
    balanceTransfers, 
    acceptBalanceTransfer, 
    rejectBalanceTransfer 
  } = useApp();

  const [showAcceptModal, setShowAcceptModal] = useState(false);

  // Filter orders assigned to this agent
  const agentOrders = orders.filter(o => o.assignedAgentId === activeAgent.id || o.country.toLowerCase() === activeAgent.country.toLowerCase());
  
  const processingCount = agentOrders.filter(o => o.status === 'Processing').length;
  const purchasedCount = agentOrders.filter(o => o.status === 'Purchased' || o.status === 'At Delivery House').length;
  const deliveredCount = agentOrders.filter(o => o.status === 'Delivered').length;
  const pendingCount = agentOrders.filter(o => o.status === 'In Transit').length;

  // Pending transfer for this agent
  const pendingTransfer = balanceTransfers.find(t => t.agentId === activeAgent.id && t.status === 'Pending');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-brand-500 flex items-center justify-center shadow-md p-2 flex-shrink-0">
            <CountryFlag country={activeAgent.country || activeAgent.flag} className="w-10 h-7 rounded-[2px] shadow-xs" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-navy-900 flex items-center gap-2">
                <span>{activeAgent.name}</span>
                <CountryFlag country={activeAgent.country || activeAgent.flag} className="w-5 h-3.5 rounded-[2px]" />
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Official {activeAgent.country} Agent Station
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{activeAgent.phone} • {activeAgent.email}</p>
          </div>
        </div>

        {/* Operating Currency & Mode Pill */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600">
            <span>Operating Currency: <strong className="text-navy-900">{activeAgent.currency} ({activeAgent.symbol})</strong></span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (lg:col-span-7): Operating Balance & Pending Transfers & Quick Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Operating Balance Card */}
          <div className="rounded-3xl bg-gradient-to-tr from-[#0D1B3D] via-[#14234B] to-[#0AA79D] text-white p-7 shadow-card relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-200 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Agent Live Operating Balance
                </span>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
                    {activeAgent.symbol}{activeAgent.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-bold text-cyan-200 uppercase">{activeAgent.currency}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  Total Purchases Sourced: <strong className="text-white">{activeAgent.symbol}{activeAgent.totalSpent.toLocaleString()}</strong>
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <span className="text-xs font-mono font-bold text-brand-300">Verified Station</span>
              </div>
            </div>

            {/* Pending Balance Notification Alert */}
            {pendingTransfer && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/25 border border-amber-400/50 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-bold text-amber-200">
                      New Remittance Sent: ৳{pendingTransfer.amountBDT.toLocaleString()} ({pendingTransfer.symbol}{pendingTransfer.amountTarget.toLocaleString()})
                    </p>
                    <p className="text-[11px] text-amber-100/80">Ref: {pendingTransfer.id} • Awaiting your acceptance</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAcceptModal(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-all whitespace-nowrap"
                >
                  View & Accept
                </button>
              </div>
            )}

            {/* Decorative background blob */}
            <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Quick Action Buttons Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Agent Quick Operations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('orders')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 text-left shadow-soft hover:shadow-card transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-navy-900 group-hover:text-brand-600">Assigned Orders</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{agentOrders.length} active orders</p>
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 text-left shadow-soft hover:shadow-card transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Receipt className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-navy-900 group-hover:text-cyan-600">Purchase Update</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Price & MRP entry</p>
              </button>

              <button
                onClick={() => onNavigate('expense')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 text-left shadow-soft hover:shadow-card transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-navy-900 group-hover:text-amber-600">Log Expense</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Travel, fuel & bills</p>
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 text-left shadow-soft hover:shadow-card transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-navy-900 group-hover:text-emerald-600">HQ Support</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct chat</p>
              </button>
            </div>
          </div>

          {/* Strict Privacy Shield Rules Card */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Strict Agent Security & Data Isolation Protocols</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-800/90 pl-1 leading-relaxed">
              <li>You can only see the <strong>Order ID and Product Specifications</strong>.</li>
              <li>Customer Name, Mobile Number, and Customer Selling Price are strictly confidential and hidden from this view.</li>
              <li>Entering <strong>Actual Purchase Price & MRP</strong> with receipt photo is required before delivering packages to the hub.</li>
            </ul>
          </div>

        </div>

        {/* Right Column (lg:col-span-5): 4 Metric Counters & Recent Assigned Orders */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 4 Pipeline Counters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-xs text-slate-500 font-medium">Total Orders</span>
              <p className="text-2xl font-extrabold text-navy-900 mt-1">{agentOrders.length}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-xs text-slate-500 font-medium">To Buy / Sourcing</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{processingCount}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-xs text-slate-500 font-medium">At Hub / Air Freight</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">{purchasedCount + pendingCount}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-xs text-slate-500 font-medium">Completed</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{deliveredCount}</p>
            </div>
          </div>

          {/* Recent Assigned Orders Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-navy-900 text-sm">Assigned Tasks ({agentOrders.length})</h3>
              <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-brand-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {agentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={order.items[0]?.image} alt="Thumb" className="w-12 h-12 object-cover rounded-xl border flex-shrink-0" />
                    <div>
                      <span className="font-mono font-bold text-xs text-navy-900 block">{order.orderNumber}</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{order.items[0]?.name}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    order.status === 'Purchased' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Acceptance Modal for Pending Balance */}
      {showAcceptModal && pendingTransfer && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Wallet className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-navy-900">Accept Operating Remittance</h3>
              <p className="text-xs text-slate-500 mt-1">Admin has remitted operating funds from Bangladesh HQ</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Transfer Reference:</span>
                <span className="font-mono font-bold text-slate-800">{pendingTransfer.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Sent (BDT):</span>
                <span className="font-bold text-slate-800">৳{pendingTransfer.amountBDT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FX Conversion Rate:</span>
                <span className="font-bold text-brand-600">1 BDT = {pendingTransfer.conversionRate} {pendingTransfer.targetCurrency}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-navy-900">
                <span>Credit to Profile:</span>
                <span className="text-emerald-600 text-base">{pendingTransfer.symbol}{pendingTransfer.amountTarget.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  rejectBalanceTransfer(pendingTransfer.id);
                  setShowAcceptModal(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  acceptBalanceTransfer(pendingTransfer.id);
                  setShowAcceptModal(false);
                }}
                className="flex-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition-colors"
              >
                Accept & Credit Balance
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

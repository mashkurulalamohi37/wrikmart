import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Truck,
  Plus
} from 'lucide-react';

export const CustomerOrders = ({ onNewOrder }) => {
  const { orders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pre-Order' | 'Delivered'

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'Pre-Order') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    if (activeTab === 'Delivered') return o.status === 'Delivered';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
        <div>
          <h2 className="text-xl font-extrabold text-navy-900">My Pre-Orders & Live Tracking</h2>
          <p className="text-xs text-slate-500">Real-time status updates from overseas stores to your doorstep</p>
        </div>
        <button
          onClick={onNewOrder}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Pre-Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Pre-Order', 'Delivered'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Grid (Desktop 2/3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Package className="w-14 h-14 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No orders in this category</p>
            <p className="text-xs text-slate-400">Start a pre-order from India, Dubai or Thailand!</p>
            <button
              onClick={onNewOrder}
              className="bg-brand-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow mt-2"
            >
              Start First Pre-Order
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-soft hover:shadow-card hover:border-brand-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-navy-900">{order.orderNumber}</span>
                      <span className="text-xs">{order.countryFlag}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{order.createdAt}</p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'Purchased' ? 'bg-cyan-100 text-cyan-700' :
                      order.status === 'At Delivery House' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'In Transit' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List preview */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.specs.unit} • Size: {item.specs.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <div>
                  <span className="text-[10px] text-slate-400 block">Advance Paid</span>
                  <span className="text-emerald-600">৳{order.financials.advancePaid.toLocaleString()}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Value</span>
                  <span className="text-navy-900">৳{order.financials.estimatedTotal.toLocaleString()}</span>
                </div>

                <span className="inline-flex items-center gap-1 text-brand-600 group-hover:translate-x-1 transition-transform ml-2">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 9-Stage Customer Tracking Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Live Delivery Pipeline</span>
                <h3 className="font-extrabold text-navy-900 text-lg">{selectedOrder.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status Banner */}
              <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-700 uppercase">Current Logistics Status</span>
                  <h4 className="font-extrabold text-navy-900 text-lg">{selectedOrder.status}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Sourcing country: {selectedOrder.country} {selectedOrder.countryFlag}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Assigned Sourcing Agent</span>
                  <span className="text-xs font-bold text-brand-700">{selectedOrder.assignedAgentName}</span>
                </div>
              </div>

              {/* 9-Stage Visual Timeline */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Tracking History & Progress</h4>
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedOrder.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        item.done 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-white border-slate-300 text-transparent'
                      }`}>
                        {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${item.done ? 'text-navy-900' : 'text-slate-400'}`}>
                            {item.step}
                          </h5>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                        {item.note && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in this order */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Order Items ({selectedOrder.items.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-xl border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-900 truncate">{it.name}</p>
                        <p className="text-[11px] text-slate-500">Size: {it.specs.size} • Color: {it.specs.color} • Qty: {it.specs.unit}</p>
                        {it.url && (
                          <a href={it.url} target="_blank" rel="noreferrer" className="text-[10px] text-brand-600 hover:underline flex items-center gap-1 mt-0.5 font-bold">
                            Original Store Link <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Advance Payment (Paid):</span>
                  <span className="text-emerald-400 font-bold">৳{selectedOrder.financials.advancePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cash Due on Doorstep Delivery:</span>
                  <span className="text-amber-300 font-bold">৳{selectedOrder.financials.dueAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 font-bold text-sm text-white">
                  <span>Total Order Value:</span>
                  <span>৳{selectedOrder.financials.estimatedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, MapPin, Calendar, CheckCircle2, Package, ArrowRight, Building } from 'lucide-react';

export const AdminDeliveryManagement = () => {
  const { orders } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('To Hub'); // 'To Hub' | 'To Customer' | 'All Deliveries'

  const deliveries = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.customer.name,
    country: order.country,
    hubName: order.hubName || 'Dhaka Main Hub',
    deliveryDate: order.purchaseDeadline || '15 May 2026',
    status: order.status
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Delivery & Cross-Border Logistics</h2>
          <p className="text-xs text-slate-500">Track shipments from overseas agent drop-off to BD customs and customer doorstep</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['To Hub', 'To Customer', 'All Deliveries'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === tab ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Sourcing Country</th>
                <th className="px-5 py-3.5">Target Delivery Hub</th>
                <th className="px-5 py-3.5">Scheduled Delivery Date</th>
                <th className="px-5 py-3.5">Current Logistics Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deliveries.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-navy-900">{del.orderNumber}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{del.country}</td>
                  <td className="px-5 py-3.5 font-semibold text-brand-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-brand-500" />
                    <span>{del.hubName}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{del.deliveryDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      del.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      del.status === 'Purchased' ? 'bg-cyan-100 text-cyan-700' :
                      del.status === 'At Delivery House' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {del.status}
                    </span>
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

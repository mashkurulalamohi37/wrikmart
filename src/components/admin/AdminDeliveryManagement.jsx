import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDamageReturnModal } from './AdminDamageReturnModal';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Building,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';

export const AdminDeliveryManagement = () => {
  const { orders } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('To Hub'); // 'To Hub' | 'To Customer' | 'All Deliveries' | 'Damaged & Returns'
  const [selectedOrderForDamage, setSelectedOrderForDamage] = useState(null);

  const deliveries = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    orderType: order.orderType || 'Pre-Order',
    customer: order.customer.name,
    country: order.country,
    hubName: order.hubName || 'Dhaka Main Hub',
    deliveryDate: order.purchaseDeadline || '15 May 2026',
    status: order.status,
    courierName: order.courierName || 'Steadfast Courier',
    damageDetails: order.damageDetails,
    rawOrder: order
  }));

  const filteredDeliveries = deliveries.filter(del => {
    if (activeSubTab === 'To Hub') {
      return del.status === 'Purchased' || del.status === 'At Delivery House' || del.status === 'Processing';
    }
    if (activeSubTab === 'To Customer') {
      return del.status === 'Shipped' || del.status === 'BD Received' || del.status === 'Ready for Delivery' || del.status === 'Delivered';
    }
    if (activeSubTab === 'Damaged & Returns') {
      return del.status === 'Damaged' || del.status === 'Returned' || Boolean(del.damageDetails);
    }
    return true;
  });

  const damageCount = deliveries.filter(d => d.status === 'Damaged' || d.status === 'Returned' || d.damageDetails).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Delivery & Cross-Border Logistics</h2>
          <p className="text-xs text-slate-500">Track shipments from overseas agent drop-off to BD customs, courier delivery & damaged claims</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'To Hub', label: 'Overseas & Hub Staging' },
          { id: 'To Customer', label: 'In-Transit & Last-Mile BD' },
          { id: 'Damaged & Returns', label: '⚠️ Damaged & Returns', badge: damageCount },
          { id: 'All Deliveries', label: 'All Shipments' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === tab.id 
                ? (tab.id === 'Damaged & Returns' ? 'bg-rose-600 text-white shadow-sm' : 'bg-navy-900 text-white shadow-sm')
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                activeSubTab === tab.id ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Consignment ID</th>
                <th className="px-5 py-3.5">Type & Region</th>
                <th className="px-5 py-3.5">Staging Hub</th>
                <th className="px-5 py-3.5">Courier Partner</th>
                <th className="px-5 py-3.5">Scheduled Date</th>
                <th className="px-5 py-3.5">Logistics Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDeliveries.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-navy-900">
                    {del.orderNumber}
                    <span className="text-[10px] text-slate-400 block font-normal">{del.customer}</span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 block">{del.country}</span>
                    <span className="text-[9px] font-extrabold uppercase text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                      {del.orderType}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-semibold text-brand-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    <span>{del.hubName}</span>
                  </td>

                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{del.courierName}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">{del.deliveryDate}</td>

                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      del.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      del.status === 'Damaged' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      del.status === 'Returned' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      del.status === 'Purchased' ? 'bg-cyan-100 text-cyan-700' :
                      del.status === 'At Delivery House' ? 'bg-purple-100 text-purple-700' :
                      del.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {del.status === 'Damaged' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {del.status === 'Returned' && <RotateCcw className="w-3 h-3 text-amber-600" />}
                      <span>{del.status}</span>
                    </span>

                    {del.damageDetails && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                        {del.damageDetails.incidentType} ({del.damageDetails.resolutionStatus})
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrderForDamage(del.rawOrder)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        del.damageDetails 
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {del.damageDetails ? 'Manage Claim' : 'Report Incident'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Damage / Return Resolution Modal */}
      {selectedOrderForDamage && (
        <AdminDamageReturnModal
          order={selectedOrderForDamage}
          onClose={() => setSelectedOrderForDamage(null)}
        />
      )}
    </div>
  );
};

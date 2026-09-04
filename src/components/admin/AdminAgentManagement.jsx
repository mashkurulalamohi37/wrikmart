import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Plus, Search, Phone, Mail, MapPin, Wallet, ShoppingBag } from 'lucide-react';

export const AdminAgentManagement = () => {
  const { agents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Agent Management (India, Dubai, Thailand)</h2>
          <p className="text-xs text-slate-500">Manage on-ground purchasing agents, order limits, and contact details</p>
        </div>

        <button
          onClick={() => alert("Add New Agent Modal")}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Agent</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents by name, phone, or country..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Agent Profile</th>
                <th className="px-5 py-3.5">Country & Currency</th>
                <th className="px-5 py-3.5">Phone & Email</th>
                <th className="px-5 py-3.5">Current Balance</th>
                <th className="px-5 py-3.5">Total Orders Sourced</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ag) => (
                <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img src={ag.avatar} alt={ag.name} className="w-10 h-10 object-cover rounded-full border flex-shrink-0" />
                    <div>
                      <span className="font-bold text-navy-900 block">{ag.name}</span>
                      <span className="text-[10px] text-brand-600 font-semibold">{ag.id}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900">{ag.flag} {ag.country}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">({ag.currency})</span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-800 block">{ag.phone}</span>
                    <span className="text-[11px] text-slate-400">{ag.email}</span>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-emerald-600 text-sm">
                    {ag.symbol}{ag.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {ag.completedOrders + ag.activeOrders} Orders
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {ag.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => alert(`Viewing full history of ${ag.name}`)}
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      View Profile
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

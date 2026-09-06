import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, 
  Send, 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  History,
  TrendingUp,
  Building,
  RefreshCw
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminBalanceAndApproval = () => {
  const { 
    agents, 
    balanceTransfers, 
    sendBalanceToAgent, 
    acceptBalanceTransfer, 
    rejectBalanceTransfer,
    exchangeRates 
  } = useApp();

  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id);
  const [amountBDT, setAmountBDT] = useState('20000');
  const [adminNote, setAdminNote] = useState('Operating capital allocation for new pre-order batch');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const currentRate = exchangeRates[selectedAgent.currency]?.rateFromBDT || 0.70;
  const convertedTargetAmount = Math.round((Number(amountBDT || 0) * currentRate) * 100) / 100;

  const pendingTransfers = balanceTransfers.filter(t => t.status === 'Pending');
  const completedTransfers = balanceTransfers.filter(t => t.status !== 'Pending');

  const handleSendBalance = (e) => {
    e.preventDefault();
    if (!amountBDT || Number(amountBDT) <= 0) return;

    sendBalanceToAgent({
      agentId: selectedAgentId,
      amountBDT: Number(amountBDT),
      adminNote
    });

    setShowSendModal(false);
    setAmountBDT('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Send Balance Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Agent Balance & Remittance Approval</h2>
          <p className="text-xs text-slate-500">
            Real-time balance tracking, multi-currency conversion (BDT &rarr; INR/AED/THB), and agent acceptance verification
          </p>
        </div>

        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Send className="w-4 h-4" />
          <span>+ Send Balance to Agent</span>
        </button>
      </div>

      {/* Top Summary Metrics Cards (Matching Visual Board 1 Screen 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Acceptance Requests</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-600">{pendingTransfers.length}</span>
            <span className="text-xs font-bold text-slate-500">
              (৳{pendingTransfers.reduce((s, t) => s + t.amountBDT, 0).toLocaleString()})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting confirmation on agent mobile</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted & Credited Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {completedTransfers.filter(t => t.status === 'Accepted').length}
            </span>
            <span className="text-xs font-bold text-slate-500">
              (৳{completedTransfers.filter(t => t.status === 'Accepted').reduce((s, t) => s + t.amountBDT, 0).toLocaleString()})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active in overseas agent operating funds</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total On-Ground Agents</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-navy-900">{agents.length}</span>
            <span className="text-xs font-bold text-brand-600">Active</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="inline-flex items-center gap-1">
              <CountryFlag country="India" className="w-3.5 h-2.5 rounded-xs" /> India
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CountryFlag country="Dubai" className="w-3.5 h-2.5 rounded-xs" /> Dubai
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CountryFlag country="Thailand" className="w-3.5 h-2.5 rounded-xs" /> Thailand
            </span>
          </div>
        </div>
      </div>

      {/* Live Agent Balances Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900 text-sm">Live Agent Operating Wallets</h3>
            <p className="text-xs text-slate-400">Current available funds for purchasing orders</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Agent Name</th>
                <th className="px-5 py-3.5">Country & Flag</th>
                <th className="px-5 py-3.5">Live Available Balance</th>
                <th className="px-5 py-3.5">Pending Acceptance</th>
                <th className="px-5 py-3.5">Total Spent Sourcing</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {agents.map((ag) => (
                <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-navy-900 block">{ag.name}</span>
                    <span className="text-[11px] text-slate-400">{ag.phone}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <CountryFlag country={ag.country || ag.flag} className="w-4 h-3 rounded-[2px]" />
                      <span>{ag.country} ({ag.currency})</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-base text-navy-900">
                    {ag.symbol}{ag.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5">
                    {ag.pendingBalance > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" /> {ag.symbol}{ag.pendingBalance.toLocaleString()} Pending
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-600">
                    {ag.symbol}{ag.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedAgentId(ag.id);
                        setShowSendModal(true);
                      }}
                      className="text-xs font-bold text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors border border-brand-200"
                    >
                      Top Up Fund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Transfer History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-navy-900 text-sm">Transfer & Acceptance Ledger</h3>
          <span className="text-xs text-slate-400">Full audit log of remittances</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Transfer ID</th>
                <th className="px-5 py-3.5">Agent</th>
                <th className="px-5 py-3.5">Remitted (BDT)</th>
                <th className="px-5 py-3.5">FX Rate</th>
                <th className="px-5 py-3.5">Credited (Local)</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {balanceTransfers.map((trf) => (
                <tr key={trf.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-navy-900">{trf.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{trf.agentName} ({trf.country})</td>
                  <td className="px-5 py-3.5 font-bold text-navy-900">৳{trf.amountBDT.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">1 BDT = {trf.conversionRate} {trf.targetCurrency}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-600">{trf.symbol}{trf.amountTarget.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-slate-400">{trf.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      trf.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                      trf.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {trf.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {trf.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => acceptBalanceTransfer(trf.id)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-bold text-[11px] transition-colors"
                          title="Simulate Agent Acceptance"
                        >
                          Simulate Accept
                        </button>
                        <button
                          onClick={() => rejectBalanceTransfer(trf.id)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-bold text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Balance Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-sm">Send Balance to Agent (Remittance)</h3>
              </div>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBalance} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Select Target Agent *</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.flag} {ag.name} — {ag.country} ({ag.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Amount in Bangladeshi Taka (৳ BDT) *</label>
                <input
                  type="number"
                  step="100"
                  required
                  value={amountBDT}
                  onChange={(e) => setAmountBDT(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-navy-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Dynamic Live Conversion Calculation Box */}
              <div className="bg-brand-50/70 p-4 rounded-xl border border-brand-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Current FX Conversion Rate:</span>
                  <span className="font-bold text-navy-900">1 BDT = {currentRate} {selectedAgent.currency}</span>
                </div>
                <div className="flex justify-between font-bold text-brand-800 text-sm border-t border-brand-200 pt-1.5">
                  <span>Agent Receives:</span>
                  <span className="text-base">{selectedAgent.symbol}{convertedTargetAmount.toLocaleString()} {selectedAgent.currency}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Admin Remittance Note</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Funds for footwear sourcing"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-snug">
                <strong>Rule Note:</strong> This transfer will be placed in <strong>Pending Acceptance</strong> state. The balance will appear on the agent's profile only after they click "Accept".
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send {selectedAgent.symbol}{convertedTargetAmount.toLocaleString()} to {selectedAgent.name}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

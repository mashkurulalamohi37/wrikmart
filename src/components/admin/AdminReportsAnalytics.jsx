import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, DollarSign, Download, ArrowUpRight, Globe2, ShoppingBag } from 'lucide-react';

export const AdminReportsAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Reports & Financial Analytics</h2>
          <p className="text-xs text-slate-500">Gross profit margins, agent efficiency, and cross-border volume</p>
        </div>

        <button
          onClick={() => alert("Downloading Complete Financial Audit Report (PDF)...")}
          className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors shadow"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Financial Report</span>
        </button>
      </div>

      {/* 4 Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Volume</span>
          <p className="text-2xl font-bold text-navy-900 mt-2">৳ 42,95,300</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3" /> +22.1% MoM
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Agent Purchases</span>
          <p className="text-2xl font-bold text-cyan-600 mt-2">৳ 31,40,000</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Local currency conversion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Profit Margin</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">৳ 9,85,300</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">22.9% Net Margin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Overhead & Bills</span>
          <p className="text-2xl font-bold text-amber-600 mt-2">৳ 1,70,000</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Travel, salary & fuel</span>
        </div>
      </div>

      {/* Top Categories & Country Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-bold text-navy-900 text-sm">Top Sourced Product Categories</h3>
          <div className="space-y-3 text-xs">
            {[
              { cat: 'Footwear & Sneakers', share: 38, amount: '৳16.3L' },
              { cat: 'Electronics & Audio (AirPods/PS5)', share: 29, amount: '৳12.4L' },
              { cat: 'Fashion, Apparels & Bags', share: 21, amount: '৳9.0L' },
              { cat: 'Cosmetics & Skincare (Thailand)', share: 12, amount: '৳5.2L' }
            ].map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>{c.cat}</span>
                  <span className="font-bold text-navy-900">{c.amount} ({c.share}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div style={{ width: `${c.share}%` }} className="h-full bg-brand-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-bold text-navy-900 text-sm">Country Sourcing Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <h4 className="font-bold text-navy-900">India Sourcing Hub</h4>
                  <p className="text-[11px] text-slate-400">Delhi, Mumbai & Bangalore Stores</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-navy-900 text-sm block">1,070 Orders</span>
                <span className="text-[10px] text-emerald-600 font-semibold">98.4% Fulfillment</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇦🇪</span>
                <div>
                  <h4 className="font-bold text-navy-900">Dubai Sourcing Hub</h4>
                  <p className="text-[11px] text-slate-400">Dubai Mall, Apple & Electronics</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-navy-900 text-sm block">968 Orders</span>
                <span className="text-[10px] text-emerald-600 font-semibold">99.1% Fulfillment</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇹🇭</span>
                <div>
                  <h4 className="font-bold text-navy-900">Thailand Sourcing Hub</h4>
                  <p className="text-[11px] text-slate-400">Bangkok Siam & Shopee TH</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-navy-900 text-sm block">510 Orders</span>
                <span className="text-[10px] text-emerald-600 font-semibold">97.8% Fulfillment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

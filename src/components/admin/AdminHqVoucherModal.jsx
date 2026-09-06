import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { CountryFlag } from '../common/CountryFlag';

export const AdminHqVoucherModal = ({ voucher, onClose }) => {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper to convert number to approximate words (Lakh / Thousand / Taka)
  const numberToTakaWords = (num) => {
    const val = Math.round(Number(num) || 0);
    if (val === 0) return 'Zero Taka Only';

    const lakh = Math.floor(val / 100000);
    const thousand = Math.floor((val % 100000) / 1000);
    const hundred = Math.floor((val % 1000) / 100);
    const remainder = val % 100;

    let parts = [];
    if (lakh > 0) parts.push(`${lakh} Lakh`);
    if (thousand > 0) parts.push(`${thousand} Thousand`);
    if (hundred > 0) parts.push(`${hundred} Hundred`);
    if (remainder > 0) parts.push(`${remainder}`);

    return `${parts.join(' ')} Taka Only`;
  };

  const netPayable = Math.max(0, voucher.amount - (voucher.vatTaxDeduction || 0));

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:m-0 print:p-0">
        
        {/* Top Screen Action Toolbar (Hidden during Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-xs sm:text-sm">Official HQ Debit Voucher #{voucher.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 text-slate-800 text-xs bg-white font-sans space-y-5 print:p-6 print:text-black">
          
          {/* Company Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-navy-900">
                  Wrik<span className="text-brand-600">Mart</span> Bangladesh
                </span>
                <CountryFlag country="BD" className="w-5 h-3.5 rounded-xs" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Cross-Border Pre-Order Network • Dhaka HQ & Logistics Hub
              </p>
              <p className="text-[10px] text-slate-400">
                Floor 4, House 42, Road 11, Banani, Dhaka-1213 • BIN: 004192819-0101
              </p>
            </div>

            <div className="text-left sm:text-right border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-200">
              <span className="inline-block px-3 py-1 bg-navy-900 text-white font-black text-xs uppercase tracking-wider rounded-lg">
                DEBIT VOUCHER
              </span>
              <div className="text-[11px] font-mono font-bold text-navy-900 mt-1.5">
                {voucher.id}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: <strong>{voucher.date}</strong>
              </div>
            </div>
          </div>

          {/* Payee & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Paid To (Beneficiary):</span>
              <span className="font-extrabold text-sm text-navy-900 block mt-0.5">{voucher.payeeName}</span>
              <span className="text-[11px] text-slate-500 font-medium">Department: {voucher.department}</span>
            </div>

            <div className="space-y-1 text-right sm:text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Mode: </span>
                <span className="font-bold text-slate-800">{voucher.paymentMethod}</span>
              </div>
              {voucher.paymentReference && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ref / Trx No: </span>
                  <span className="font-mono font-bold text-slate-700">{voucher.paymentReference}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Status: </span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  voucher.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {voucher.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Particulars Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Sl.</th>
                  <th className="p-3">Head of Accounts & Particulars</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-400">01</td>
                  <td className="p-3">
                    <span className="font-bold text-navy-900 block text-xs">{voucher.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{voucher.notes || 'Operating expense disbursement'}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px] text-slate-600">
                      {voucher.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-navy-900 text-sm">
                    ৳{voucher.amount.toLocaleString()}
                  </td>
                </tr>

                {voucher.vatTaxDeduction > 0 && (
                  <tr className="bg-slate-50/50 text-[11px]">
                    <td className="p-2.5 font-bold text-slate-400">02</td>
                    <td className="p-2.5 text-slate-500" colSpan={2}>
                      Less: Tax/VAT Withholding (TDS Deducted at Source)
                    </td>
                    <td className="p-2.5 text-right font-bold text-rose-600">
                      - ৳{Number(voucher.vatTaxDeduction).toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                <tr>
                  <td colSpan={3} className="p-3 text-right uppercase text-[11px] text-slate-600">
                    Net Paid Amount:
                  </td>
                  <td className="p-3 text-right text-base font-black text-brand-700">
                    ৳{netPayable.toLocaleString()} BDT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount in Words:</span>
            <span className="font-extrabold text-xs text-navy-900 italic block mt-0.5">
              "{numberToTakaWords(netPayable)}"
            </span>
          </div>

          {/* Three-Tier Approval Signatures */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center border-t border-slate-200">
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 text-[11px] font-bold text-slate-700">
                Prepared By
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Accounts Officer</span>
            </div>

            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 text-[11px] font-bold text-slate-700">
                Checked & Verified
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Finance Manager</span>
            </div>

            <div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1 text-[11px] font-bold text-brand-700">
                {voucher.approvedBy || 'Managing Director'}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                Authorized Signatory
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[10px] text-slate-400 text-center pt-3 border-t border-dashed border-slate-200">
            This is an electronically generated and certified payment voucher of WrikMart Bangladesh Limited.
          </div>

        </div>

      </div>
    </div>
  );
};

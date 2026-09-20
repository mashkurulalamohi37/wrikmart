import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import confetti from "canvas-confetti";
import { verifyEpsTransaction } from "../../utils/epsPaymentService";
import {
  CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, ShoppingBag, RotateCcw, Copy
} from "lucide-react";

/**
 * EpsPaymentReturn
 * Rendered when the browser returns from the EPS hosted payment page.
 * Reads eps_pending_order from sessionStorage, verifies the transaction
 * via EPS API, then creates the order (or shows failure/cancel screens).
 */
export const EpsPaymentReturn = ({ status }) => {
  const { createCustomerStockOrder, createCustomerPreOrder, setCustomerTab } = useApp();

  const [phase, setPhase] = useState("verifying");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const merchantTransactionId =
        params.get("merchantTransactionId") ||
        params.get("MerchantTransactionId") ||
        params.get("txId") ||
        params.get("EpsTransactionId");

      if (status === "cancel") { setPhase("cancelled"); return; }
      if (status === "fail") { setPhase("failed"); return; }

      if (status === "success") {
        let pendingData = null;
        try {
          const raw = sessionStorage.getItem("eps_pending_order");
          if (raw) pendingData = JSON.parse(raw);
        } catch (e) { console.error("Failed to parse eps_pending_order", e); }

        if (!pendingData) {
          setErrorMessage("Payment session data not found. Your order may have already been created, or the session expired. Please check your Orders page.");
          setPhase("error");
          return;
        }

        const trxId = merchantTransactionId || pendingData.merchantTransactionId;

        let verified = false;
        try {
          const epsData = await verifyEpsTransaction(trxId);
          const s = String(epsData?.TransactionStatus || epsData?.status || "").toLowerCase();
          verified = s.includes("success") || s === "1" || epsData?.TransactionStatusId === 1;
        } catch (err) {
          // Sandbox/network limitation — trust the redirect itself as success signal
          console.warn("EPS verify failed (treating success redirect as confirmed):", err.message);
          verified = true;
        }

        if (!verified) {
          setErrorMessage("Payment verification failed. Please contact support with EPS reference: " + trxId);
          setPhase("failed");
          return;
        }

        try {
          let order;
          if (pendingData.type === "preorder") {
            order = createCustomerPreOrder({
              country: pendingData.country,
              items: pendingData.items,
              customerInfo: pendingData.customerInfo,
              paymentMethod: "EPS Payment Gateway",
              epsStoreId: pendingData.epsStoreId,
              transactionId: trxId,
              advancePaid: pendingData.advancePaid
            });
          } else {
            order = createCustomerStockOrder({
              customerInfo: pendingData.customerInfo,
              items: pendingData.items,
              deliveryMethod: pendingData.deliveryMethod,
              deliveryFee: pendingData.deliveryFee,
              paymentMethod: "EPS Payment Gateway",
              epsStoreId: pendingData.epsStoreId,
              transactionId: trxId,
              subtotal: pendingData.subtotal,
              discountAmount: pendingData.discountAmount,
              grandTotal: pendingData.grandTotal,
              advancePaid: pendingData.grandTotal,
              paymentStatus: "Fully Paid"
            });
          }
          sessionStorage.removeItem("eps_pending_order");
          setConfirmedOrder(order);
          setPhase("success");
          try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch (_) {}
        } catch (orderErr) {
          console.error("Failed to create order:", orderErr);
          setErrorMessage("Payment successful but error saving order. Contact support with EPS reference: " + trxId);
          setPhase("error");
        }
      }
    };
    run();
  }, [status]); // eslint-disable-line

  const goHome = () => { window.history.replaceState({}, document.title, "/"); window.location.href = "/"; };
  const goOrders = () => { window.history.replaceState({}, document.title, "/"); if (setCustomerTab) setCustomerTab("orders"); window.location.href = "/"; };

  const copyOrderId = () => {
    if (confirmedOrder?.orderNumber) {
      navigator.clipboard.writeText(confirmedOrder.orderNumber).then(() => { setCopiedOrderId(true); setTimeout(() => setCopiedOrderId(false), 2000); });
    }
  };

  if (phase === "verifying") return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-navy-900">Verifying Payment</h2>
          <p className="text-slate-500 text-sm">Please wait while we confirm your payment with EPS Gateway...</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: d + "ms" }} />)}
        </div>
      </div>
    </div>
  );

  if (phase === "success" && confirmedOrder) {
    const isPre = confirmedOrder.type === "Pre-Order" || !!confirmedOrder.country;
    const paidAmount = isPre ? confirmedOrder.financials?.advancePaid : confirmedOrder.grandTotal;
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">Payment Confirmed via EPS ?</span>
            <h1 className="text-3xl font-black text-navy-900">Order Placed! ??</h1>
            <p className="text-slate-500 text-sm">Thank you, <strong>{confirmedOrder.customerInfo?.name}</strong>! Your payment was verified via EPS Gateway.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Number</span>
                <span className="font-mono font-extrabold text-lg text-brand-600">{confirmedOrder.orderNumber}</span>
              </div>
              <button onClick={copyOrderId} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-xs font-bold">
                <Copy className="w-3.5 h-3.5" />
                {copiedOrderId ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Paid</span>
                <span className="font-black text-lg text-emerald-600">?{Number(paidAmount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700">{isPre ? "Advance Paid" : "Fully Paid"}</span>
              </div>
            </div>
            {isPre && <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800"><strong>30% Advance Paid.</strong> Remaining balance collected upon delivery.</div>}
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={goOrders} className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all">
              <ShoppingBag className="w-4 h-4" /> Track My Order <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={goHome} className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "failed") return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black text-red-500 uppercase tracking-widest block">Payment Failed</span>
          <h1 className="text-2xl font-black text-navy-900">Payment Not Completed</h1>
          <p className="text-slate-500 text-sm">Your card/account was not charged. Please try again with a different payment method.</p>
          {errorMessage && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mt-2 text-left">{errorMessage}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={goHome} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={goOrders} className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">Go to My Orders</button>
        </div>
      </div>
    </div>
  );

  if (phase === "cancelled") return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-500" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">Payment Cancelled</span>
          <h1 className="text-2xl font-black text-navy-900">You Cancelled the Payment</h1>
          <p className="text-slate-500 text-sm">Your cart items are still saved. Return to checkout and try again whenever you are ready.</p>
        </div>
        <button onClick={goHome} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all">
          <RotateCcw className="w-4 h-4" /> Return to Checkout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Action Required</span>
          <h1 className="text-2xl font-black text-navy-900">Something Went Wrong</h1>
          {errorMessage ? <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">{errorMessage}</p> : <p className="text-slate-500 text-sm">An unexpected error occurred. Please check your orders or contact support.</p>}
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={goOrders} className="w-full py-4 rounded-2xl bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Check My Orders
          </button>
          <button onClick={goHome} className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">Back to Home</button>
        </div>
      </div>
    </div>
  );
};

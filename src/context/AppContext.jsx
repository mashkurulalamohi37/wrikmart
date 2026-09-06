import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_AGENTS,
  INITIAL_ORDERS,
  INITIAL_HUBS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_EXPENSES,
  INITIAL_BALANCE_TRANSFERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_STOCK_INVENTORY
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'agent' | 'customer'
  const [activeAgentId, setActiveAgentId] = useState('agent-1'); // Currently simulated agent
  const [customerTab, setCustomerTab] = useState('home'); // 'home' | 'preorder' | 'orders' | 'chat' | 'profile'

  // Data States with automatic migration for fresh schema
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('wrikmart_orders_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ORDERS;
  });

  const [agents, setAgents] = useState(() => {
    const saved = localStorage.getItem('wrikmart_agents_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_AGENTS;
  });

  const [hubs, setHubs] = useState(() => {
    const saved = localStorage.getItem('wrikmart_hubs');
    return saved ? JSON.parse(saved) : INITIAL_HUBS;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('wrikmart_inventory');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_INVENTORY;
  });

  const [exchangeRates, setExchangeRates] = useState(() => {
    const saved = localStorage.getItem('wrikmart_fx_rates');
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_RATES;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('wrikmart_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [balanceTransfers, setBalanceTransfers] = useState(() => {
    const saved = localStorage.getItem('wrikmart_transfers');
    return saved ? JSON.parse(saved) : INITIAL_BALANCE_TRANSFERS;
  });

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('wrikmart_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  // Notifications Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('wrikmart_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('wrikmart_agents_v2', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('wrikmart_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('wrikmart_transfers', JSON.stringify(balanceTransfers));
  }, [balanceTransfers]);

  useEffect(() => {
    localStorage.setItem('wrikmart_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('wrikmart_fx_rates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem('wrikmart_hubs', JSON.stringify(hubs));
  }, [hubs]);

  useEffect(() => {
    localStorage.setItem('wrikmart_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Current active agent profile
  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  // ==========================================
  // ACTIONS: BALANCE & FX WORKFLOW
  // ==========================================

  // Admin sends balance to agent (Status starts as 'Pending')
  const sendBalanceToAgent = ({ agentId, amountBDT, adminNote }) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return false;

    const rate = exchangeRates[targetAgent.currency]?.rateFromBDT || 0.70;
    const amountTarget = Math.round((amountBDT * rate) * 100) / 100;
    const transferId = `TRF-2026-${String(Math.floor(100 + Math.random() * 900))}`;

    const newTransfer = {
      id: transferId,
      agentId,
      agentName: targetAgent.name,
      country: targetAgent.country,
      amountBDT: Number(amountBDT),
      conversionRate: rate,
      amountTarget,
      targetCurrency: targetAgent.currency,
      symbol: targetAgent.symbol,
      date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      adminNote: adminNote || 'Fund allocation for pending pre-orders'
    };

    setBalanceTransfers(prev => [newTransfer, ...prev]);

    // Update Agent's pending balance
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          pendingBalance: a.pendingBalance + amountTarget,
          pendingBalanceBDT: (a.pendingBalanceBDT || 0) + Number(amountBDT),
          pendingTransferId: transferId
        };
      }
      return a;
    }));

    showToast(`Transferred ৳${Number(amountBDT).toLocaleString()} (${targetAgent.symbol}${amountTarget.toLocaleString()}) to ${targetAgent.name}. Status: Pending Agent Acceptance`, 'info');
    return true;
  };

  // Agent Accepts Balance Transfer
  const acceptBalanceTransfer = (transferId) => {
    const transfer = balanceTransfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'Pending') return false;

    // Mark transfer accepted
    setBalanceTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Accepted' } : t));

    // Credit Agent Live Balance & Clear Pending
    setAgents(prev => prev.map(a => {
      if (a.id === transfer.agentId) {
        const remainingPending = Math.max(0, a.pendingBalance - transfer.amountTarget);
        return {
          ...a,
          balance: a.balance + transfer.amountTarget,
          pendingBalance: remainingPending,
          pendingTransferId: remainingPending > 0 ? a.pendingTransferId : null
        };
      }
      return a;
    }));

    showToast(`Success! ${transfer.symbol}${transfer.amountTarget.toLocaleString()} added to your live balance.`, 'success');
    return true;
  };

  // Agent Rejects Balance Transfer
  const rejectBalanceTransfer = (transferId) => {
    const transfer = balanceTransfers.find(t => t.id === transferId);
    if (!transfer) return;

    setBalanceTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Rejected' } : t));

    setAgents(prev => prev.map(a => {
      if (a.id === transfer.agentId) {
        return {
          ...a,
          pendingBalance: Math.max(0, a.pendingBalance - transfer.amountTarget),
          pendingTransferId: null
        };
      }
      return a;
    }));

    showToast(`Transfer ${transferId} rejected.`, 'warning');
  };

  // ==========================================
  // ACTIONS: CUSTOMER PRE-ORDER WORKFLOW
  // ==========================================

  const createCustomerPreOrder = ({ country, items, customerInfo, paymentMethod, transactionId, advancePaid }) => {
    const orderNumber = `PO-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    
    const estimatedSubtotal = items.reduce((sum, item) => sum + (Number(item.expectedPrice || 0) * (item.specs?.unit || 1)), 0);
    const deliveryCharge = 200;
    const estimatedTotal = estimatedSubtotal + deliveryCharge;
    const advanceRequired = advancePaid || Math.round(estimatedTotal * 0.25);

    const matchedAgent = agents.find(a => a.country.toLowerCase() === country.toLowerCase()) || agents[0];

    const newOrder = {
      id: orderNumber,
      orderNumber,
      orderType: 'Pre-Order',
      country,
      countryFlag: country === 'India' ? '🇮🇳' : country === 'Dubai' ? '🇦🇪' : '🇹🇭',
      status: 'Processing',
      paymentStatus: 'Advance Paid',
      createdAt: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      purchaseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedAgentId: matchedAgent.id,
      assignedAgentName: matchedAgent.name,
      hubId: 'hub-1',
      hubName: 'Dhaka Main Hub',
      courierName: 'Steadfast Courier',
      customer: {
        id: `cust-${Date.now()}`,
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || '',
        address: customerInfo.address,
        district: customerInfo.district || 'Dhaka',
        note: customerInfo.note || '',
        isReturning: false
      },
      financials: {
        currency: 'BDT',
        symbol: '৳',
        estimatedSubtotal,
        deliveryCharge,
        estimatedTotal,
        advanceRequired,
        advancePaid,
        finalSellingPrice: estimatedTotal,
        dueAmount: estimatedTotal - advancePaid,
        agentCostBDT: Math.round(estimatedSubtotal * 0.75),
        shippingCostBDT: 600,
        localCourierCostBDT: 120,
        grossProfitBDT: Math.round(estimatedTotal - (estimatedSubtotal * 0.75) - 720)
      },
      items: items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || 'General',
        brand: item.brand || 'Retail Store',
        url: item.url || '',
        image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
        specs: item.specs || { size: 'Standard', color: 'Default', unit: 1 },
        expectedPrice: Number(item.expectedPrice || 0),
        actualPurchasePrice: null,
        actualPurchaseCurrency: matchedAgent.currency,
        mrp: null,
        purchasedFrom: '',
        purchaseDate: null,
        receiptImage: null,
        notes: item.notes || ''
      })),
      timeline: [
        { step: 'Order Placed', time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor: 'Customer', note: `Pre-order submitted with ${items.length} item(s)`, done: true },
        { step: 'Payment Confirmed', time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor: `${paymentMethod} Gateway`, note: `Advance payment ৳${advancePaid.toLocaleString()} verified (TrxID: ${transactionId})`, done: true },
        { step: 'Agent Assigned', time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor: 'Auto Dispatch', note: `Assigned to ${matchedAgent.name} (${matchedAgent.country})`, done: true },
        { step: 'Purchase Updated', time: 'Pending', actor: `${matchedAgent.name}`, note: '', done: false },
        { step: 'Arrived at Hub', time: 'Pending', actor: 'Local Hub', note: '', done: false },
        { step: 'Shipped to Bangladesh', time: 'Pending', actor: 'Air Cargo Logistics', note: '', done: false },
        { step: 'Bangladesh Received', time: 'Pending', actor: 'Dhaka Main Hub', note: '', done: false },
        { step: 'Ready for Delivery', time: 'Pending', actor: 'Courier Rider', note: '', done: false },
        { step: 'Delivered', time: 'Pending', actor: 'Customer', note: '', done: false }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast(`Order #${orderNumber} Confirmed with Advance ৳${advancePaid.toLocaleString()}!`, 'success');
    return newOrder;
  };

  // ==========================================
  // ACTIONS: ADMIN MANUAL ORDER CREATION
  // ==========================================

  const createAdminOrder = ({
    orderType = 'Pre-Order',
    country = 'India',
    customerInfo,
    items,
    financials,
    paymentMethod = 'bKash',
    paymentStatus = 'Advance Paid',
    assignedAgentId = null,
    purchaseDeadline,
    note
  }) => {
    const orderPrefix = orderType === 'Stock Product' ? 'ORD-STK' : 'PO';
    const orderNumber = `${orderPrefix}-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    
    const matchedAgent = assignedAgentId 
      ? agents.find(a => a.id === assignedAgentId)
      : agents.find(a => a.country.toLowerCase() === country.toLowerCase()) || agents[0];

    const estimatedSubtotal = items.reduce((sum, item) => sum + (Number(item.expectedPrice || 0) * (item.specs?.unit || 1)), 0);
    const deliveryCharge = Number(financials?.deliveryCharge ?? 200);
    const estimatedTotal = estimatedSubtotal + deliveryCharge;
    const advancePaid = Number(financials?.advancePaid ?? (paymentStatus === 'Fully Paid' ? estimatedTotal : Math.round(estimatedTotal * 0.25)));
    const dueAmount = Math.max(0, estimatedTotal - advancePaid);

    const initialStatus = orderType === 'Stock Product'
      ? (paymentStatus === 'Fully Paid' ? 'Ready for Delivery' : 'Processing')
      : 'Processing';

    const newOrder = {
      id: orderNumber,
      orderNumber,
      orderType,
      country: orderType === 'Stock Product' ? 'Bangladesh' : country,
      countryFlag: orderType === 'Stock Product' ? '🇧🇩' : (country === 'India' ? '🇮🇳' : country === 'Dubai' ? '🇦🇪' : '🇹🇭'),
      status: initialStatus,
      paymentStatus,
      createdAt: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      purchaseDeadline: purchaseDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedAgentId: orderType === 'Stock Product' ? null : matchedAgent?.id,
      assignedAgentName: orderType === 'Stock Product' ? 'Dhaka Hub Fulfillment' : matchedAgent?.name,
      hubId: 'hub-1',
      hubName: 'Dhaka Main Hub',
      courierName: 'Steadfast Courier',
      customer: {
        id: `cust-${Date.now()}`,
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || '',
        address: customerInfo.address,
        district: customerInfo.district || 'Dhaka',
        note: note || customerInfo.note || '',
        isReturning: false
      },
      financials: {
        currency: 'BDT',
        symbol: '৳',
        estimatedSubtotal,
        deliveryCharge,
        estimatedTotal,
        advanceRequired: advancePaid,
        advancePaid,
        finalSellingPrice: estimatedTotal,
        dueAmount,
        agentCostBDT: Math.round(estimatedSubtotal * 0.75),
        shippingCostBDT: orderType === 'Stock Product' ? 0 : 500,
        localCourierCostBDT: 120,
        grossProfitBDT: Math.round(estimatedTotal - (estimatedSubtotal * 0.75) - 120)
      },
      items: items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || 'General',
        brand: item.brand || 'Original Brand',
        url: item.url || '',
        image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
        specs: item.specs || { size: 'Standard', color: 'Default', unit: 1 },
        expectedPrice: Number(item.expectedPrice || 0),
        actualPurchasePrice: orderType === 'Stock Product' ? Number(item.costPrice || item.expectedPrice * 0.75) : null,
        actualPurchaseCurrency: orderType === 'Stock Product' ? 'BDT' : matchedAgent?.currency || 'INR',
        mrp: Number(item.mrp || item.expectedPrice * 1.1),
        purchasedFrom: orderType === 'Stock Product' ? 'Dhaka Warehouse Local Stock' : '',
        purchaseDate: orderType === 'Stock Product' ? new Date().toLocaleString() : null,
        receiptImage: null,
        notes: item.notes || ''
      })),
      timeline: [
        { step: 'Order Placed', time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor: 'Admin HQ', note: `Manual ${orderType} created by Admin`, done: true },
        { step: 'Payment Confirmed', time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor: `${paymentMethod} Gateway`, note: `Payment: ${paymentStatus} (৳${advancePaid.toLocaleString()})`, done: paymentStatus !== 'Unpaid' },
        { step: 'Agent Assigned', time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor: 'Admin Dispatch', note: orderType === 'Stock Product' ? 'Assigned to Dhaka Warehouse' : `Assigned to ${matchedAgent?.name}`, done: true },
        { step: 'Purchase Updated', time: 'Pending', actor: matchedAgent?.name || 'Agent', note: '', done: orderType === 'Stock Product' },
        { step: 'Arrived at Hub', time: 'Pending', actor: 'Hub Logistics', note: '', done: false },
        { step: 'Shipped to Bangladesh', time: 'Pending', actor: 'Air Cargo', note: '', done: false },
        { step: 'Bangladesh Received', time: 'Pending', actor: 'Dhaka Hub', note: '', done: orderType === 'Stock Product' },
        { step: 'Ready for Delivery', time: 'Pending', actor: 'Courier Rider', note: '', done: false },
        { step: 'Delivered', time: 'Pending', actor: 'Customer', note: '', done: false }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast(`Created ${orderType} #${orderNumber} successfully!`, 'success');
    return newOrder;
  };

  // ==========================================
  // ACTIONS: DAMAGE OR RETURN HANDLING
  // ==========================================

  const reportDamageOrReturn = (orderId, damageData) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newStatus = damageData.status || 'Damaged';
        const newTimeline = [
          ...order.timeline,
          {
            step: newStatus === 'Damaged' ? 'Damage Reported' : 'Return Initiated',
            time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            actor: damageData.reportedBy || 'Logistics Inspector',
            note: `${damageData.incidentType}: ${damageData.description}`,
            done: true
          }
        ];

        return {
          ...order,
          status: newStatus,
          damageDetails: {
            incidentType: damageData.incidentType || 'Damaged in Transit',
            description: damageData.description || '',
            proofUrl: damageData.proofUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80',
            reportedDate: new Date().toISOString().split('T')[0],
            reportedBy: damageData.reportedBy || 'Admin',
            disposition: damageData.disposition || 'Customer Refund Required',
            refundAmount: Number(damageData.refundAmount || order.financials.advancePaid || 0),
            resolutionStatus: damageData.resolutionStatus || 'Pending Investigation',
            resolutionNote: damageData.resolutionNote || ''
          },
          timeline: newTimeline
        };
      }
      return order;
    }));

    showToast(`Order #${orderId} marked as ${damageData.status || 'Damaged'}!`, 'warning');
  };

  const resolveDamageOrReturn = (orderId, { resolutionStatus, resolutionNote, refundAmount }) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId && order.damageDetails) {
        return {
          ...order,
          damageDetails: {
            ...order.damageDetails,
            resolutionStatus,
            resolutionNote: resolutionNote || order.damageDetails.resolutionNote,
            refundAmount: refundAmount !== undefined ? Number(refundAmount) : order.damageDetails.refundAmount
          }
        };
      }
      return order;
    }));

    showToast(`Resolution for #${orderId} updated to "${resolutionStatus}"`, 'info');
  };

  // ==========================================
  // ACTIONS: AGENT ACTIONS
  // ==========================================

  // Agent updates Purchase Price & MRP (Mandatory)
  const updateOrderPurchase = (orderId, updatedItems) => {
    let totalPurchasedCost = 0;
    let agentCurrency = 'INR';

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newItems = order.items.map((it, idx) => {
          const match = updatedItems[idx] || {};
          const purchaseCost = Number(match.actualPurchasePrice || it.actualPurchasePrice || 0);
          totalPurchasedCost += purchaseCost;
          agentCurrency = match.actualPurchaseCurrency || it.actualPurchaseCurrency || 'INR';

          return {
            ...it,
            actualPurchasePrice: purchaseCost,
            actualPurchaseCurrency: agentCurrency,
            mrp: Number(match.mrp || it.mrp || 0),
            purchasedFrom: match.purchasedFrom || it.purchasedFrom || 'Official Store',
            purchaseDate: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            receiptImage: match.receiptImage || it.receiptImage || 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
            notes: match.notes || it.notes
          };
        });

        const newTimeline = order.timeline.map(t => {
          if (t.step === 'Purchase Updated') {
            return {
              ...t,
              time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              note: `Purchase price & MRP successfully recorded`,
              done: true
            };
          }
          return t;
        });

        return {
          ...order,
          status: 'Purchased',
          items: newItems,
          timeline: newTimeline
        };
      }
      return order;
    }));

    // Debit the Agent's Operating Balance
    if (totalPurchasedCost > 0) {
      setAgents(prev => prev.map(a => {
        if (a.id === activeAgentId) {
          return {
            ...a,
            balance: Math.max(0, a.balance - totalPurchasedCost),
            totalSpent: a.totalSpent + totalPurchasedCost
          };
        }
        return a;
      }));
    }

    showToast(`Purchase details & MRP recorded! Order status updated to 'Purchased'.`, 'success');
  };

  // Agent Marks Product Delivered to Hub
  const markOrderAtHub = (orderId, hubId, expectedDeliveryDate) => {
    const selectedHub = hubs.find(h => h.id === hubId) || hubs[0];

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newTimeline = order.timeline.map(t => {
          if (t.step === 'Arrived at Hub') {
            return {
              ...t,
              time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              actor: selectedHub.name,
              note: `Received at ${selectedHub.name} (Expected Delivery: ${expectedDeliveryDate || 'Soon'})`,
              done: true
            };
          }
          return t;
        });

        return {
          ...order,
          status: 'At Delivery House',
          hubId: selectedHub.id,
          hubName: selectedHub.name,
          timeline: newTimeline
        };
      }
      return order;
    }));

    showToast(`Order marked as Arrived at ${selectedHub.name}!`, 'success');
  };

  // Admin updates order status down the pipeline
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newTimeline = order.timeline.map(t => {
          if (
            (newStatus === 'Shipped' && t.step === 'Shipped to Bangladesh') ||
            (newStatus === 'BD Received' && t.step === 'Bangladesh Received') ||
            (newStatus === 'Ready for Delivery' && t.step === 'Ready for Delivery') ||
            (newStatus === 'Delivered' && t.step === 'Delivered')
          ) {
            return {
              ...t,
              time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              done: true
            };
          }
          return t;
        });

        return {
          ...order,
          status: newStatus,
          paymentStatus: newStatus === 'Delivered' ? 'Fully Paid' : order.paymentStatus,
          financials: {
            ...order.financials,
            dueAmount: newStatus === 'Delivered' ? 0 : order.financials.dueAmount
          },
          timeline: newTimeline
        };
      }
      return order;
    }));

    showToast(`Order #${orderId} status changed to ${newStatus}`, 'info');
  };

  // Admin Assigns Agent
  const assignAgentToOrder = (orderId, agentId) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          assignedAgentId: agent.id,
          assignedAgentName: agent.name,
          country: agent.country,
          countryFlag: agent.flag
        };
      }
      return order;
    }));

    showToast(`Assigned order #${orderId} to Agent ${agent.name}`, 'info');
  };

  // Add Agent Expense
  const addAgentExpense = ({ category, amount, notes, receiptImage, date }) => {
    const currentAgent = activeAgent;
    const newExpense = {
      id: `exp-${Date.now()}`,
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      country: currentAgent.country,
      currency: currentAgent.currency,
      symbol: currentAgent.symbol,
      category,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod: 'Agent Cash/Card',
      status: 'Pending',
      receiptImage: receiptImage || 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
      notes
    };

    setExpenses(prev => [newExpense, ...prev]);
    showToast(`Expense of ${currentAgent.symbol}${amount} submitted for approval!`, 'success');
  };

  // Approve / Reject Expense
  const reviewExpense = (expenseId, status) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status } : e));
    showToast(`Expense ${expenseId} set to ${status}.`, 'info');
  };

  // Update Exchange Rate
  const updateExchangeRate = (currencyCode, newRateFromBDT) => {
    setExchangeRates(prev => {
      const existing = prev[currencyCode];
      if (!existing) return prev;
      return {
        ...prev,
        [currencyCode]: {
          ...existing,
          rateFromBDT: Number(newRateFromBDT),
          rateToBDT: Number((1 / newRateFromBDT).toFixed(2))
        }
      };
    });
    showToast(`Updated BDT to ${currencyCode} conversion rate to ${newRateFromBDT}`, 'success');
  };

  // Add Agent with Full 8 KYC Fields
  const addAgent = (newAgentData) => {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentData.name,
      country: newAgentData.country,
      flag: newAgentData.country === 'India' ? '🇮🇳' : newAgentData.country === 'Dubai' ? '🇦🇪' : '🇹🇭',
      currency: newAgentData.currency || (newAgentData.country === 'India' ? 'INR' : newAgentData.country === 'Dubai' ? 'AED' : 'THB'),
      symbol: newAgentData.country === 'India' ? '₹' : newAgentData.country === 'Dubai' ? 'د.إ' : '฿',
      phone: newAgentData.phone,
      whatsapp: newAgentData.whatsapp || newAgentData.phone,
      email: newAgentData.email || '',
      address: newAgentData.address || '',
      referencePerson: {
        name: newAgentData.refName || newAgentData.referencePerson?.name || 'Verified Contact',
        phone: newAgentData.refPhone || newAgentData.referencePerson?.phone || '',
        address: newAgentData.refAddress || newAgentData.referencePerson?.address || ''
      },
      govtDocument: {
        type: newAgentData.docType || newAgentData.govtDocument?.type || (newAgentData.country === 'India' ? 'Aadhaar Card' : newAgentData.country === 'Dubai' ? 'Emirates ID' : 'Thai National ID'),
        number: newAgentData.docNumber || newAgentData.govtDocument?.number || 'ID-VERIFIED-2026',
        documentUrl: newAgentData.docUrl || newAgentData.govtDocument?.documentUrl || 'https://images.unsplash.com/photo-1633409381659-3b954d7e974e?w=500&auto=format&fit=crop&q=80',
        verified: true
      },
      balance: Number(newAgentData.initialBalance || 0),
      pendingBalance: 0,
      totalSpent: 0,
      activeOrders: 0,
      completedOrders: 0,
      status: 'Active',
      avatar: newAgentData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setAgents(prev => [...prev, newAgent]);
    showToast(`Agent ${newAgent.name} successfully registered with KYC documents!`, 'success');
  };

  // Add Delivery Hub
  const addHub = (newHub) => {
    const hub = {
      id: `hub-${Date.now()}`,
      status: 'Active',
      activePackages: 0,
      capacity: 2000,
      ...newHub
    };
    setHubs(prev => [...prev, hub]);
    showToast(`New Hub "${newHub.name}" registered!`, 'success');
  };

  // Send Chat Message
  const sendChatMessage = (text, isAgent = false) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: isAgent ? 'agent' : currentRole,
      senderName: isAgent ? activeAgent.name : currentRole === 'admin' ? 'WrikMart Support' : 'Customer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  return (
    <AppContext.Provider value={{
      currentRole,
      setCurrentRole,
      customerTab,
      setCustomerTab,
      activeAgentId,
      setActiveAgentId,
      activeAgent,
      orders,
      agents,
      hubs,
      inventory,
      exchangeRates,
      expenses,
      balanceTransfers,
      chatMessages,
      toast,
      showToast,
      sendBalanceToAgent,
      acceptBalanceTransfer,
      rejectBalanceTransfer,
      createCustomerPreOrder,
      createAdminOrder,
      reportDamageOrReturn,
      resolveDamageOrReturn,
      updateOrderPurchase,
      markOrderAtHub,
      updateOrderStatus,
      assignAgentToOrder,
      addAgentExpense,
      reviewExpense,
      updateExchangeRate,
      addAgent,
      addHub,
      sendChatMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

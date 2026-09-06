import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_AGENTS,
  INITIAL_ORDERS,
  INITIAL_HUBS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_EXPENSES,
  INITIAL_HQ_EXPENSES,
  DEFAULT_RECURRING_HQ_TEMPLATES,
  INITIAL_BALANCE_TRANSFERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_STOCK_INVENTORY,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  DEFAULT_BIRTHDAY_SETTINGS
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'agent' | 'customer'
  const [activeAgentId, setActiveAgentId] = useState('agent-1'); // Currently simulated agent
  const [customerTab, setCustomerTab] = useState('home'); // 'home' | 'stock' | 'preorder' | 'orders' | 'chat' | 'profile'

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with INITIAL_STOCK_INVENTORY so newly added items and fields are present
        const existingIds = new Set(parsed.map(p => p.id));
        const enriched = parsed.map(item => {
          const initial = INITIAL_STOCK_INVENTORY.find(i => i.id === item.id);
          return initial ? { ...initial, ...item, image: item.image || initial.image, description: item.description || initial.description, originalMrp: item.originalMrp || initial.originalMrp } : item;
        });
        INITIAL_STOCK_INVENTORY.forEach(initialItem => {
          if (!existingIds.has(initialItem.id)) {
            enriched.push(initialItem);
          }
        });
        return enriched;
      } catch (e) {}
    }
    return INITIAL_STOCK_INVENTORY;
  });

  // Ready Stock Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('wrikmart_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Ready Stock Search & Pre-Order Prefill States
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [prefilledPreOrder, setPrefilledPreOrder] = useState(null); // { url?: string, name?: string, country?: string }

  // Discount & Coupon State
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('wrikmart_coupons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_COUPONS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('wrikmart_applied_coupon');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [exchangeRates, setExchangeRates] = useState(() => {
    const saved = localStorage.getItem('wrikmart_fx_rates');
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_RATES;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('wrikmart_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [hqExpenses, setHqExpenses] = useState(() => {
    const saved = localStorage.getItem('wrikmart_hq_expenses');
    return saved ? JSON.parse(saved) : INITIAL_HQ_EXPENSES;
  });

  const [balanceTransfers, setBalanceTransfers] = useState(() => {
    const saved = localStorage.getItem('wrikmart_transfers');
    return saved ? JSON.parse(saved) : INITIAL_BALANCE_TRANSFERS;
  });

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('wrikmart_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  // Customer CRM & Birthday States
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('wrikmart_customers_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CUSTOMERS;
  });

  const [customerProfile, setCustomerProfile] = useState(() => {
    const saved = localStorage.getItem('wrikmart_customer_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CUSTOMERS[0] || {
      id: 'cust-101',
      name: 'Rahim Chowdhury',
      phone: '+880 1712-345678',
      email: 'rahim.c@example.com',
      address: 'House 12, Road 5, Dhanmondi, Dhaka-1205',
      district: 'Dhaka',
      dateOfBirth: '1995-09-06'
    };
  });

  const [birthdaySettings, setBirthdaySettings] = useState(() => {
    const saved = localStorage.getItem('wrikmart_birthday_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_BIRTHDAY_SETTINGS;
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
    localStorage.setItem('wrikmart_hq_expenses', JSON.stringify(hqExpenses));
  }, [hqExpenses]);

  useEffect(() => {
    localStorage.setItem('wrikmart_fx_rates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem('wrikmart_hubs', JSON.stringify(hubs));
  }, [hubs]);

  useEffect(() => {
    localStorage.setItem('wrikmart_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('wrikmart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wrikmart_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('wrikmart_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('wrikmart_applied_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('wrikmart_customers_v1', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('wrikmart_customer_profile', JSON.stringify(customerProfile));
  }, [customerProfile]);

  useEffect(() => {
    localStorage.setItem('wrikmart_birthday_settings', JSON.stringify(birthdaySettings));
  }, [birthdaySettings]);

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
        dateOfBirth: customerInfo.dateOfBirth || null,
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
    recordCustomerOrder(customerInfo, estimatedTotal);
    showToast(`Order #${orderNumber} Confirmed with Advance ৳${advancePaid.toLocaleString()}!`, 'success');
    return newOrder;
  };

  // ==========================================
  // ACTIONS: READY STOCK CART & COUPON WORKFLOW
  // ==========================================

  const addToCart = (product, quantity = 1) => {
    if (!product || product.currentStock <= 0) {
      showToast(`${product?.name || 'Product'} is currently Out of Stock!`, 'error');
      return false;
    }

    let addedSuccessfully = true;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        if (newQty > product.currentStock) {
          showToast(`Cannot add more. Only ${product.currentStock} units available in stock!`, 'warning');
          addedSuccessfully = false;
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        showToast(`Updated ${product.name} quantity to ${newQty}!`, 'success');
        return updated;
      } else {
        const addQty = Math.min(quantity, product.currentStock);
        showToast(`Added ${product.name} to Cart!`, 'success');
        return [...prev, { ...product, quantity: addQty }];
      }
    });

    return addedSuccessfully;
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = inventory.find(i => i.id === productId);
    const maxStock = prod ? prod.currentStock : 99;

    let finalQty = newQuantity;
    if (newQuantity > maxStock) {
      showToast(`Only ${maxStock} unit(s) available in stock!`, 'warning');
      finalQty = maxStock;
    }

    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: finalQty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const remaining = prev.filter(item => item.id !== productId);
      // If applied coupon no longer qualifies, revoke it
      if (appliedCoupon) {
        const newSubtotal = remaining.reduce((sum, it) => sum + ((it.sellingPrice || 0) * (it.quantity || 1)), 0);
        if (newSubtotal < (appliedCoupon.minOrderBDT || 0)) {
          setAppliedCoupon(null);
          showToast(`Coupon "${appliedCoupon.code}" removed (minimum order amount no longer met).`, 'warning');
        }
      }
      return remaining;
    });
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (rawCode, currentSubtotal, deliveryFee = 0, items = []) => {
    if (!rawCode || !rawCode.trim()) {
      showToast('Please enter a coupon code.', 'warning');
      return { success: false, message: 'Code is empty' };
    }

    const cleanCode = rawCode.trim().toUpperCase();
    const foundCoupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.status === 'Active');

    if (!foundCoupon) {
      showToast(`Coupon "${cleanCode}" is invalid or inactive.`, 'error');
      return { success: false, message: 'Invalid coupon' };
    }

    if (currentSubtotal < (foundCoupon.minOrderBDT || 0)) {
      showToast(`Minimum order of ৳${foundCoupon.minOrderBDT.toLocaleString()} required for this coupon.`, 'warning');
      return { success: false, message: `Min order ৳${foundCoupon.minOrderBDT}` };
    }

    // Category restriction check
    if (foundCoupon.applicableCategory && foundCoupon.applicableCategory !== 'All') {
      const hasApplicableItem = items.some(it => it.category?.toLowerCase() === foundCoupon.applicableCategory.toLowerCase());
      if (!hasApplicableItem) {
        showToast(`This coupon is only valid for ${foundCoupon.applicableCategory} products.`, 'warning');
        return { success: false, message: `Valid for ${foundCoupon.applicableCategory} only` };
      }
    }

    // Calculate exact discount
    let discountAmount = 0;
    if (foundCoupon.discountType === 'percentage') {
      const calculated = Math.round(currentSubtotal * (foundCoupon.discountValue / 100));
      discountAmount = foundCoupon.maxDiscountBDT ? Math.min(calculated, foundCoupon.maxDiscountBDT) : calculated;
    } else if (foundCoupon.discountType === 'fixed') {
      discountAmount = Math.min(foundCoupon.discountValue, currentSubtotal);
    } else if (foundCoupon.discountType === 'free_shipping') {
      discountAmount = deliveryFee;
    }

    const couponPayload = {
      ...foundCoupon,
      discountAmount
    };

    setAppliedCoupon(couponPayload);
    showToast(`Coupon "${foundCoupon.code}" applied! You saved ৳${discountAmount.toLocaleString()}!`, 'success');
    return { success: true, coupon: couponPayload, discountAmount };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  // CHECKOUT STOCK ORDER
  const createCustomerStockOrder = ({
    customerInfo,
    items,
    deliveryMethod = 'Standard Courier',
    deliveryFee = 80,
    paymentMethod = 'COD',
    transactionId = null,
    subtotal,
    discountAmount = 0,
    grandTotal,
    advancePaid = 0,
    paymentStatus = 'Unpaid'
  }) => {
    const orderNumber = `ORD-STK-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    
    // 1. Auto-decrement stock in inventory
    setInventory(prev => prev.map(invItem => {
      const ordered = items.find(it => it.id === invItem.id);
      if (ordered) {
        const remainingStock = Math.max(0, (invItem.currentStock || 0) - (ordered.quantity || 1));
        const newSoldQty = (invItem.soldQty || 0) + (ordered.quantity || 1);
        const newStatus = remainingStock === 0 ? 'Out of Stock' : (remainingStock <= (invItem.reorderLevel || 5) ? 'Low Stock' : 'In Stock');
        return {
          ...invItem,
          currentStock: remainingStock,
          soldQty: newSoldQty,
          status: newStatus
        };
      }
      return invItem;
    }));

    // 2. Increment coupon usage
    if (appliedCoupon?.id) {
      setCoupons(prev => prev.map(c => c.id === appliedCoupon.id ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c));
    }

    const isCod = paymentMethod === 'COD';
    const effectivePaymentStatus = isCod ? 'Unpaid (COD)' : 'Fully Paid';
    const effectiveStatus = isCod ? 'Processing' : 'Ready for Delivery';

    const newOrder = {
      id: orderNumber,
      orderNumber,
      orderType: 'Stock Product',
      country: 'Bangladesh',
      countryFlag: '🇧🇩',
      status: effectiveStatus,
      paymentStatus: effectivePaymentStatus,
      createdAt: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      purchaseDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedAgentId: null,
      assignedAgentName: 'Dhaka Warehouse Hub',
      hubId: 'hub-1',
      hubName: 'Dhaka Main Hub',
      courierName: deliveryMethod.includes('Express') ? 'Pathao Express' : 'Steadfast Courier',
      deliveryMethod,
      customer: {
        id: `cust-${Date.now()}`,
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || '',
        address: customerInfo.address,
        district: customerInfo.district || 'Dhaka',
        note: customerInfo.note || '',
        dateOfBirth: customerInfo.dateOfBirth || null,
        isReturning: true
      },
      financials: {
        currency: 'BDT',
        symbol: '৳',
        estimatedSubtotal: subtotal,
        deliveryCharge: deliveryFee,
        discountAmount,
        couponCode: appliedCoupon?.code || null,
        estimatedTotal: grandTotal,
        advanceRequired: advancePaid,
        advancePaid,
        finalSellingPrice: grandTotal,
        dueAmount: Math.max(0, grandTotal - advancePaid),
        agentCostBDT: items.reduce((sum, it) => sum + ((it.costPrice || it.sellingPrice * 0.75) * (it.quantity || 1)), 0),
        shippingCostBDT: 0,
        localCourierCostBDT: deliveryFee,
        grossProfitBDT: Math.round(grandTotal - items.reduce((sum, it) => sum + ((it.costPrice || it.sellingPrice * 0.75) * (it.quantity || 1)), 0) - deliveryFee)
      },
      items: items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: it.name,
        category: it.category || 'General',
        brand: it.brand || 'Authentic Brand',
        url: it.image,
        image: it.image,
        specs: it.specs || { unit: it.quantity || 1 },
        expectedPrice: it.sellingPrice,
        actualPurchasePrice: it.costPrice || Math.round(it.sellingPrice * 0.75),
        actualPurchaseCurrency: 'BDT',
        mrp: it.originalMrp || it.sellingPrice,
        purchasedFrom: `Dhaka Warehouse Local Stock (${it.warehouse || 'Dhaka Main Hub'})`,
        purchaseDate: new Date().toLocaleString(),
        receiptImage: it.image,
        notes: `Immediate dispatch stock order. Qty: ${it.quantity || 1}`
      })),
      timeline: [
        { 
          step: 'Order Placed', 
          time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 
          actor: 'Customer', 
          note: `Ready Stock order placed with ${items.length} item(s)`, 
          done: true 
        },
        { 
          step: 'Payment Confirmed', 
          time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 
          actor: `${paymentMethod} Gateway`, 
          note: isCod ? `Cash on Delivery (৳${grandTotal.toLocaleString()} due at delivery)` : `Paid online via ${paymentMethod} (TrxID: ${transactionId || 'ONLINE-SUCCESS'})`, 
          done: !isCod 
        },
        { 
          step: 'Bangladesh Received', 
          time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 
          actor: 'Tejgaon Fulfillment Center', 
          note: 'Items picked from warehouse shelf and packaged with tamper-evident seal', 
          done: true 
        },
        { 
          step: 'Ready for Delivery', 
          time: 'Pending', 
          actor: `${deliveryMethod.includes('Express') ? 'Pathao Rider' : 'Steadfast Courier'}`, 
          note: 'Assigned for doorstep dispatch', 
          done: false 
        },
        { 
          step: 'Delivered', 
          time: 'Pending', 
          actor: 'Customer', 
          note: '', 
          done: false 
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    recordCustomerOrder(customerInfo, grandTotal);
    clearCart();
    showToast(`Stock Order #${orderNumber} placed successfully!`, 'success');
    return newOrder;
  };

  // ==========================================
  // ACTIONS: CUSTOMER CRM & BIRTHDAY CLUB
  // ==========================================

  // Helper: Keep customer CRM updated on order creation
  const recordCustomerOrder = (customerInfo, orderTotal) => {
    if (!customerInfo || !customerInfo.phone) return;
    setCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.phone === customerInfo.phone || (customerInfo.email && c.email === customerInfo.email));
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updated = {
          ...existing,
          name: customerInfo.name || existing.name,
          address: customerInfo.address || existing.address,
          district: customerInfo.district || existing.district,
          dateOfBirth: customerInfo.dateOfBirth || existing.dateOfBirth,
          totalOrders: (existing.totalOrders || 0) + 1,
          totalSpent: (existing.totalSpent || 0) + (orderTotal || 0)
        };
        const newList = [...prev];
        newList[existingIndex] = updated;
        return newList;
      } else {
        const newCust = {
          id: `cust-${Date.now()}`,
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || '',
          address: customerInfo.address || '',
          district: customerInfo.district || 'Dhaka',
          dateOfBirth: customerInfo.dateOfBirth || '',
          totalOrders: 1,
          totalSpent: orderTotal || 0,
          preferredCategory: 'General Commerce',
          notes: 'Customer created via checkout order',
          birthdayWishes: []
        };
        return [newCust, ...prev];
      }
    });

    // If current profile phone matches, update profile too
    if (customerProfile?.phone === customerInfo.phone && customerInfo.dateOfBirth) {
      setCustomerProfile(prev => ({
        ...prev,
        dateOfBirth: customerInfo.dateOfBirth,
        name: customerInfo.name || prev.name,
        address: customerInfo.address || prev.address
      }));
    }
  };

  // Helper: Birthday status calculator for any DOB string (YYYY-MM-DD)
  const getBirthdayStatus = (dob) => {
    if (!dob || typeof dob !== 'string' || !dob.includes('-')) {
      return {
        hasDOB: false,
        isToday: false,
        isUpcoming: false,
        daysLeft: null,
        turningAge: null,
        formattedDOB: 'Not Set',
        nextOccurrenceLabel: 'DOB Missing'
      };
    }

    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-11
      const currentDate = today.getDate(); // 1-31

      const [birthYear, birthMonthStr, birthDateStr] = dob.split('-').map(Number);
      const birthMonth = birthMonthStr - 1; // 0-11
      const birthDate = birthDateStr;

      const isToday = currentMonth === birthMonth && currentDate === birthDate;
      const turningAge = currentYear - birthYear;

      // Next birthday occurrence
      let nextBday = new Date(currentYear, birthMonth, birthDate);
      const todayZero = new Date(currentYear, currentMonth, currentDate);
      if (nextBday < todayZero && !isToday) {
        nextBday = new Date(currentYear + 1, birthMonth, birthDate);
      }

      const diffTime = nextBday.getTime() - todayZero.getTime();
      const daysLeft = isToday ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isUpcoming = daysLeft > 0 && daysLeft <= 30;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDOB = `${birthDate} ${monthNames[birthMonth]} ${birthYear}`;

      let nextOccurrenceLabel = `${birthDate} ${monthNames[birthMonth]}`;
      if (isToday) nextOccurrenceLabel = '🎉 Birthday Today!';
      else if (daysLeft === 1) nextOccurrenceLabel = '🎂 Tomorrow!';
      else if (daysLeft <= 7) nextOccurrenceLabel = `🎂 In ${daysLeft} days`;

      return {
        hasDOB: true,
        isToday,
        isUpcoming,
        daysLeft,
        turningAge,
        formattedDOB,
        nextOccurrenceLabel,
        birthMonth,
        birthDate
      };
    } catch (e) {
      return {
        hasDOB: false,
        isToday: false,
        isUpcoming: false,
        daysLeft: null,
        turningAge: null,
        formattedDOB: dob,
        nextOccurrenceLabel: dob
      };
    }
  };

  // Generate an active personalized birthday coupon
  const generateBirthdayCoupon = (customer, customDiscount = null) => {
    if (!customer) return null;
    const cleanFirstName = (customer.name || 'VIP').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const discountVal = customDiscount?.discountValue ?? birthdaySettings.discountValue ?? 20;
    const discountType = customDiscount?.discountType ?? birthdaySettings.discountType ?? 'percentage';
    const currentYear = new Date().getFullYear();
    const code = `BDAY-${cleanFirstName}-${currentYear}`;

    // Check if code already exists in coupons
    const existing = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (existing) return existing;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (birthdaySettings.validityDays || 7));
    const expiresAt = expiryDate.toISOString().split('T')[0];

    const newCoupon = {
      id: `coup-bday-${customer.id || Date.now()}-${Date.now()}`,
      code,
      title: `🎂 Birthday Gift for ${customer.name}`,
      description: discountType === 'percentage'
        ? `Special ${discountVal}% OFF Birthday voucher for ${customer.name} (Max ৳${birthdaySettings.maxDiscountBDT || 1500})`
        : `Special Flat ৳${discountVal} OFF Birthday voucher for ${customer.name}`,
      discountType,
      discountValue: Number(discountVal),
      maxDiscountBDT: birthdaySettings.maxDiscountBDT || 1500,
      minOrderBDT: birthdaySettings.minOrderBDT || 500,
      applicableCategory: 'All',
      status: 'Active',
      expiresAt,
      isBirthdaySpecial: true,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      usedCount: 0
    };

    setCoupons(prev => [newCoupon, ...prev]);
    return newCoupon;
  };

  // Send/Log Birthday Wish & Promo dispatch
  const sendBirthdayWish = (customerId, { discountValue, discountType, customNote } = {}) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;

    const coupon = generateBirthdayCoupon(customer, { discountValue, discountType });
    const currentYear = new Date().getFullYear();
    const discountText = (discountType || birthdaySettings.discountType) === 'percentage'
      ? `${discountValue || birthdaySettings.discountValue}%`
      : `৳${discountValue || birthdaySettings.discountValue}`;

    const wishRecord = {
      id: `wish-${Date.now()}`,
      year: currentYear,
      sentAt: new Date().toISOString(),
      couponCode: coupon?.code || `BDAY-${currentYear}`,
      discount: discountText,
      note: customNote || 'Birthday wish & coupon issued via WrikMart CRM'
    };

    // Update customer wishes in state
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const wishes = c.birthdayWishes || [];
        return {
          ...c,
          birthdayWishes: [wishRecord, ...wishes.filter(w => w.year !== currentYear)]
        };
      }
      return c;
    }));

    // If active profile matches customer, update it too
    if (customerProfile?.id === customerId || customerProfile?.phone === customer?.phone) {
      setCustomerProfile(prev => ({
        ...prev,
        birthdayWishes: [wishRecord, ...(prev.birthdayWishes || []).filter(w => w.year !== currentYear)]
      }));
    }

    const template = birthdaySettings.wishTemplate || "Happy Birthday {name}! 🎂 Team WrikMart wishes you a joyful day! We've gifted you an exclusive {discount} birthday discount voucher: {code}. Shop authentic global products: https://wrikmart.com";
    const message = template
      .replace('{name}', customer.name)
      .replace('{discount}', discountText)
      .replace('{code}', coupon?.code || `BDAY-${currentYear}`);

    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    showToast(`Birthday wish logged & coupon ${coupon?.code} generated for ${customer.name}!`, 'success');

    return {
      coupon,
      message,
      whatsappUrl,
      wishRecord
    };
  };

  // Update customer profile (by customer)
  const updateCustomerProfile = (updatedData) => {
    setCustomerProfile(prev => {
      const next = { ...prev, ...updatedData };
      setCustomers(cList => cList.map(c => (c.id === next.id || c.phone === next.phone ? { ...c, ...next } : c)));
      return next;
    });
    showToast('Customer profile updated successfully!', 'success');
  };

  // Admin updates customer DOB
  const updateCustomerDOB = (customerId, dob) => {
    setCustomers(prev => prev.map(c => (c.id === customerId ? { ...c, dateOfBirth: dob } : c)));
    if (customerProfile?.id === customerId) {
      setCustomerProfile(prev => ({ ...prev, dateOfBirth: dob }));
    }
    showToast('Customer date of birth updated!', 'success');
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

  // ==========================================
  // ACTIONS: HQ BANGLADESH OFFICE EXPENSE MANAGEMENT
  // ==========================================

  // Add Single HQ Operating Expense
  const addHqExpense = (expenseData) => {
    const year = new Date().getFullYear();
    const newHqExpense = {
      id: `HQ-VOUCH-${year}-${String(Date.now()).slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Paid',
      billingFrequency: 'One-off Expense',
      vatTaxDeduction: 0,
      approvedBy: 'Super Administrator',
      voucherScanUrl: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
      ...expenseData,
      amount: Number(expenseData.amount || 0)
    };

    setHqExpenses(prev => [newHqExpense, ...prev]);
    showToast(`HQ Expense "${newHqExpense.title}" (৳${newHqExpense.amount.toLocaleString()}) recorded successfully!`, 'success');
    return newHqExpense;
  };

  // 1-Click Monthly Batch Generator for HQ Recurring Bills
  const generateMonthlyHqBatch = (monthYear, selectedItems) => {
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    const newBatch = selectedItems.map((item, idx) => ({
      id: `HQ-VOUCH-${year}-${String(timestamp + idx).slice(-4)}`,
      title: `${item.title} (${monthYear})`,
      category: item.category,
      department: item.department || 'Central Operations',
      payeeName: item.payeeName,
      amount: Number(item.amount),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: item.paymentMethod || 'Bank Transfer (BRAC Bank)',
      paymentReference: `BATCH-${monthYear.replace(/\s+/g, '-').toUpperCase()}-${idx + 1}`,
      status: item.status || 'Paid',
      billingFrequency: 'Monthly Recurring',
      vatTaxDeduction: Math.round(Number(item.amount) * 0.05),
      voucherScanUrl: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
      approvedBy: 'Super Administrator',
      notes: `Auto-generated standard recurring overhead for ${monthYear}`
    }));

    setHqExpenses(prev => [...newBatch, ...prev]);
    showToast(`Generated ${newBatch.length} recurring HQ operating expenses for ${monthYear}!`, 'success');
    return newBatch;
  };

  // Update HQ Expense Status (e.g. mark Paid/Pending)
  const updateHqExpenseStatus = (id, newStatus, paymentRef) => {
    setHqExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: newStatus,
          paymentReference: paymentRef || e.paymentReference
        };
      }
      return e;
    }));
    showToast(`HQ Expense #${id} updated to ${newStatus}`, 'info');
  };

  // Delete / Void HQ Expense
  const deleteHqExpense = (id) => {
    setHqExpenses(prev => prev.filter(e => e.id !== id));
    showToast(`HQ Expense #${id} removed`, 'info');
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
      hqExpenses,
      DEFAULT_RECURRING_HQ_TEMPLATES,
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
      addHqExpense,
      generateMonthlyHqBatch,
      updateHqExpenseStatus,
      deleteHqExpense,
      updateExchangeRate,
      addAgent,
      sendChatMessage,
      // Ready Stock Cart & Coupons
      cart,
      setCart,
      isCartOpen,
      setIsCartOpen,
      coupons,
      setCoupons,
      appliedCoupon,
      setAppliedCoupon,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      createCustomerStockOrder,
      // Customer CRM & Birthday Suite
      customers,
      setCustomers,
      customerProfile,
      setCustomerProfile,
      updateCustomerProfile,
      birthdaySettings,
      setBirthdaySettings,
      updateCustomerDOB,
      getBirthdayStatus,
      generateBirthdayCoupon,
      sendBirthdayWish,
      // Global Header Search & Pre-Order Prefill
      stockSearchQuery,
      setStockSearchQuery,
      prefilledPreOrder,
      setPrefilledPreOrder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

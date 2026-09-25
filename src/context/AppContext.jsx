import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  DEFAULT_BIRTHDAY_SETTINGS,
  DEFAULT_SOURCING_STORES
} from '../data/mockData';
import { DEFAULT_EPS_CONFIG } from '../utils/epsPaymentService';

const AppContext = createContext();

export const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.warn(`[WrikMart Storage Warning] Could not write ${key} to storage:`, e);
  }
};

export const safeLocalStorageRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[WrikMart Storage Warning] Could not remove ${key} from storage:`, e);
  }
};

const VALID_ROLES = ['admin', 'agent', 'customer'];
const VALID_CUSTOMER_TABS = ['home', 'stock', 'clearance', 'preorder', 'orders', 'chat', 'profile'];
const VALID_ADMIN_NAVS = [
  'dashboard', 'orders', 'stock_inventory', 'clearance_management', 'clearance',
  'customers', 'preorder_settings', 'agents', 'balance', 'expenses', 'hubs', 
  'delivery', 'history', 'reports', 'settings', 'footer_cms'
];
const VALID_AGENT_TABS = [
  'dashboard', 'orders', 'purchase', 'expense', 'hub', 'history', 'chat'
];

export const DEFAULT_CLEARANCE_SETTINGS = {
  enabled: true,
  badgeText: '70% OFF',
  bannerTitle: 'Defect & Clearance Deals (Open-Box / B-Stock)',
  bannerSubtitle: '100% authentic genuine items with slight packaging damage or cosmetic box creases incurred during international air cargo transit. Every piece is strictly inspected, tested, and backed by our full warranty at exceptional discount prices!',
  guaranteeBadge: '🛡️ 100% Authentic Guarantee',
  allowCustomerOffers: false
};

export const DEFAULT_FOOTER_SETTINGS = {
  companyName: 'WrikMart',
  tagline: 'Global Logistics & Sourcing',
  aboutText: "Bangladesh's leading cross-border pre-order platform. We connect Bangladeshi consumers with on-ground purchasing agents in India, Dubai, and Thailand for authentic international products.",
  address: 'House-08, Road-12, Sector-11, Mirpur, Dhaka-1216',
  phone: '+880 1700-000000',
  email: 'support@wrikmart.com',
  whatsapp: '+880 1700-000000',
  popularStores: [
    'Nike India Official',
    'Apple Store Dubai Mall',
    'Zara & H&M Global',
    'Amazon & Flipkart India',
    'CentralWorld Bangkok',
    'Noon UAE & Sephora'
  ],
  helpLinks: [
    'How Pre-Order Works',
    'Advance Payment (30%) Rules',
    'Refund & Cancellation Terms',
    'Customs & Air Freight Timelines',
    'Track Order Status'
  ],
  sourcingHubs: [
    { country: 'India', label: 'India (Delhi / Mumbai)' },
    { country: 'Dubai', label: 'Dubai (Al Quoz)' },
    { country: 'Thailand', label: 'Thailand (Bangkok)' }
  ],
  trustBadges: [
    { title: '100% Genuine Receipts', desc: 'Purchased from official overseas brand stores with tax invoices.' },
    { title: '30% Advance Protection', desc: 'Held in escrow until order purchased. 100% refund guarantee.' },
    { title: 'Express Air Freight', desc: 'Regular flights from Delhi, Dubai, and Bangkok to Dhaka DAC.' },
    { title: '24/7 Agent Support', desc: 'WhatsApp hotline and live portal chat for order updates.' }
  ],
  poweredByText: 'Inovasi Tech Pvt. Ltd.',
  poweredByLink: 'https://inovasitech.net'
};

export const parseInitialRoute = () => {
  // 1. Try URL hash first
  try {
    const rawHash = typeof window !== 'undefined' ? window.location.hash : '';
    const hash = rawHash.replace(/^#\/?/, '').trim();
    
    // If no hash is present in the URL, this is the root storefront homepage
    if (!hash) {
      return {
        role: 'customer',
        customerTab: 'home',
        adminNav: 'dashboard',
        agentTab: 'dashboard',
        agentId: 'agent-1'
      };
    }

    const parts = hash.split('/').map(p => decodeURIComponent(p).trim()).filter(Boolean);
    if (parts.length > 0) {
      const first = parts[0].toLowerCase();
      
      // Backward compatibility for #/customer/home or #/customer/stock
      if (first === 'customer') {
        const tab = parts[1]?.toLowerCase();
        return {
          role: 'customer',
          customerTab: VALID_CUSTOMER_TABS.includes(tab) ? tab : 'home'
        };
      }
      
      if (first === 'admin') {
        const nav = parts[1]?.toLowerCase();
        return {
          role: 'admin',
          adminNav: VALID_ADMIN_NAVS.includes(nav) ? nav : 'dashboard'
        };
      }
      
      if (first === 'agent') {
        let agentId = null;
        let agentTab = 'dashboard';
        if (parts[1]?.toLowerCase().startsWith('agent-')) {
          agentId = parts[1];
          if (parts[2]) agentTab = parts[2].toLowerCase();
        } else if (parts[1]) {
          agentTab = parts[1].toLowerCase();
        }
        return {
          role: 'agent',
          agentId: agentId || localStorage.getItem('wrikmart_active_agent_id') || 'agent-1',
          agentTab: VALID_AGENT_TABS.includes(agentTab) ? agentTab : 'dashboard'
        };
      }

      // Direct shortcuts in hash (e.g. #/stock, #/orders, #/customers, #/reports)
      if (VALID_CUSTOMER_TABS.includes(first)) {
        return { role: 'customer', customerTab: first };
      }
      if (VALID_ADMIN_NAVS.includes(first)) {
        return { role: 'admin', adminNav: first };
      }
      if (VALID_AGENT_TABS.includes(first)) {
        return { role: 'agent', agentTab: first };
      }
    }
  } catch (e) {}

  // 2. Default fallback if fresh user
  return {
    role: 'customer',
    customerTab: 'home',
    adminNav: 'dashboard',
    agentTab: 'dashboard',
    agentId: 'agent-1'
  };
};

export const AppProvider = ({ children }) => {
  const initialRoute = parseInitialRoute();

  // Navigation & Role State with persistence
  const [currentRole, setCurrentRole] = useState(() => initialRoute.role || 'customer');
  const [activeAgentId, setActiveAgentId] = useState(() => initialRoute.agentId || 'agent-1');
  const [customerTab, setCustomerTab] = useState(() => initialRoute.customerTab || 'home');
  const [adminNav, setAdminNav] = useState(() => initialRoute.adminNav || 'dashboard');
  const [agentTab, setAgentTab] = useState(() => initialRoute.agentTab || 'dashboard');

  // Synchronize routing state to localStorage and URL hash
  useEffect(() => {
    try {
      localStorage.setItem('wrikmart_current_role', currentRole);
      localStorage.setItem('wrikmart_customer_tab', customerTab);
      localStorage.setItem('wrikmart_admin_nav', adminNav);
      localStorage.setItem('wrikmart_agent_tab', agentTab);
      localStorage.setItem('wrikmart_active_agent_id', activeAgentId);

      let targetHash = '';
      if (currentRole === 'customer') {
        // Customer homepage has a clean root URL without any hash (e.g. wrikmart.com/)
        targetHash = customerTab === 'home' ? '' : `#/${customerTab}`;
      } else if (currentRole === 'admin') {
        targetHash = adminNav === 'dashboard' ? '#/admin' : `#/admin/${adminNav}`;
      } else if (currentRole === 'agent') {
        targetHash = `#/agent/${activeAgentId}/${agentTab}`;
      }

      const currentFullHash = window.location.hash;
      const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const normalizedPath = (rawPath || '/').replace(/\/+/g, '/');
      const hasDoubleSlash = rawPath.includes('//');

      if (targetHash === '') {
        // Cleanly strip any trailing hash from root homepage URL and fix double slashes
        if ((currentFullHash && currentFullHash !== '') || hasDoubleSlash) {
          window.history.replaceState(null, '', normalizedPath + (window.location.search || ''));
        }
      } else if (currentFullHash !== targetHash || hasDoubleSlash) {
        const cleanBase = normalizedPath === '/' ? '' : normalizedPath.replace(/\/$/, '');
        const fullUrl = `${cleanBase}/${targetHash}`.replace(/\/+/g, '/');
        window.history.replaceState(null, '', fullUrl);
      }
    } catch (e) {}
  }, [currentRole, customerTab, adminNav, agentTab, activeAgentId]);

  // Handle browser back / forward navigation via hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseInitialRoute();
      if (route.role && route.role !== currentRole) {
        setCurrentRole(route.role);
      }
      if (route.customerTab && route.customerTab !== customerTab) {
        setCustomerTab(route.customerTab);
      }
      if (route.adminNav && route.adminNav !== adminNav) {
        setAdminNav(route.adminNav);
      }
      if (route.agentTab && route.agentTab !== agentTab) {
        setAgentTab(route.agentTab);
      }
      if (route.agentId && route.agentId !== activeAgentId) {
        setActiveAgentId(route.agentId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRole, customerTab, adminNav, agentTab, activeAgentId]);

  // One-time complete clean data wipe migration for Admin & Agent panels
  try {
    if (!localStorage.getItem('wrikmart_admin_clean_v1')) {
      localStorage.removeItem('wrikmart_agents_v2');
      localStorage.removeItem('wrikmart_hubs');
      localStorage.removeItem('wrikmart_expenses');
      localStorage.removeItem('wrikmart_hq_expenses');
      localStorage.removeItem('wrikmart_transfers');
      localStorage.removeItem('wrikmart_customers_v1');
      localStorage.removeItem('wrikmart_customer_profile');
      localStorage.setItem('wrikmart_admin_clean_v1', '1');
    }
  } catch (e) {}

  // Data States with automatic migration for fresh schema
  const [orders, setOrders] = useState(() => {
    try {
      if (!localStorage.getItem('wrikmart_orders_wiped_v2')) {
        localStorage.removeItem('wrikmart_orders');
        localStorage.removeItem('wrikmart_orders_v2');
        localStorage.setItem('wrikmart_orders_wiped_v2', '1');
        return [];
      }
    } catch (e) {}
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
    try {
      const saved = localStorage.getItem('wrikmart_inventory_v3');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with INITIAL_STOCK_INVENTORY so any updated fields (like videoUrl, defectNote) are automatically populated
          const merged = parsed.map(item => {
            const initialMatch = INITIAL_STOCK_INVENTORY.find(i => i.id === item.id);
            if (initialMatch) {
              return {
                ...initialMatch,
                ...item,
                videoUrl: item.videoUrl || initialMatch.videoUrl || '',
                isDefect: item.isDefect !== undefined ? item.isDefect : initialMatch.isDefect,
                defectNote: item.defectNote || initialMatch.defectNote || '',
              };
            }
            return item;
          });
          return merged;
        }
      }
    } catch (e) {}
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
    try {
      if (!localStorage.getItem('wrikmart_chat_wiped_v2')) {
        localStorage.removeItem('wrikmart_chat');
        localStorage.setItem('wrikmart_chat_wiped_v2', '1');
        return INITIAL_CHAT_MESSAGES;
      }
    } catch (e) {}
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
    const savedUser = localStorage.getItem('wrikmart_current_user');
    if (savedUser) {
      const saved = localStorage.getItem('wrikmart_customer_profile');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      id: `cust-${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      address: '',
      district: 'Dhaka',
      dateOfBirth: ''
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

  // Shared customer district selection between Cart Drawer and Checkout Modal
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    try {
      return localStorage.getItem('wrikmart_selected_district') || 'Dhaka';
    } catch (e) {
      return 'Dhaka';
    }
  });

  // Pre-Order form settings configurable from Admin
  const [preOrderFormSettings, setPreOrderFormSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('wrikmart_preorder_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          courierDeliveryCharge: 200,
          freeShippingThreshold: 0,
          ...parsed
        };
      }
    } catch (e) {}
    return {
      courierDeliveryCharge: 200,
      freeShippingThreshold: 0,
      countries: { india: true, dubai: true, thailand: true },
      requiredFields: {
        name: true,
        whatsapp: true,
        address: true,
        productLinkOrImage: true,
        size: false,
        color: false,
        quantity: true,
        advancePayment: true
      }
    };
  });

  // Footer & HQ Contact Settings configurable from Admin Panel
  const [footerSettings, setFooterSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('wrikmart_footer_settings');
      if (saved) return { ...DEFAULT_FOOTER_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_FOOTER_SETTINGS;
  });

  const updateFooterSettings = (newSettings) => {
    setFooterSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      safeLocalStorageSet('wrikmart_footer_settings', updated);
      return updated;
    });
    showToast('Footer & HQ Contact settings updated successfully!', 'success');
  };

  const resetFooterSettings = () => {
    setFooterSettings(DEFAULT_FOOTER_SETTINGS);
    safeLocalStorageSet('wrikmart_footer_settings', DEFAULT_FOOTER_SETTINGS);
    showToast('Footer settings reset to default', 'info');
  };

  // Defect / Clearance Sales Storefront & Campaign Settings
  const [clearanceSettings, setClearanceSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('wrikmart_clearance_settings');
      if (saved) return { ...DEFAULT_CLEARANCE_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_CLEARANCE_SETTINGS;
  });

  const updateClearanceSettings = (newSettings) => {
    setClearanceSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      safeLocalStorageSet('wrikmart_clearance_settings', updated);
      return updated;
    });
    showToast('Defect & Clearance storefront settings saved!', 'success');
  };

  const resetClearanceSettings = () => {
    setClearanceSettings(DEFAULT_CLEARANCE_SETTINGS);
    safeLocalStorageSet('wrikmart_clearance_settings', DEFAULT_CLEARANCE_SETTINGS);
    showToast('Clearance settings reset to default.', 'info');
  };

  // Official EPS Payment Gateway Production Settings (WrikMart Live)
  const [epsSettings, setEpsSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('wrikmart_eps_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_EPS_CONFIG, ...parsed };
      }
    } catch (e) {}
    return DEFAULT_EPS_CONFIG;
  });

  const updateEpsSettings = (newSettings) => {
    setEpsSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      safeLocalStorageSet('wrikmart_eps_settings', updated);
      return updated;
    });
    showToast('EPS Payment Gateway settings saved successfully!', 'success');
  };

  // Supported Global Sourcing Stores (Home Page & Pre-Order)
  const [sourcingStores, setSourcingStores] = useState(() => {
    try {
      const saved = localStorage.getItem('wrikmart_sourcing_stores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse wrikmart_sourcing_stores:', e);
    }
    return DEFAULT_SOURCING_STORES;
  });

  // Sync to local storage safely protected against quota / private mode exceptions
  useEffect(() => {
    safeLocalStorageSet('wrikmart_orders_v2', orders);
  }, [orders]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_agents_v2', agents);
  }, [agents]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_inventory_v3', inventory);
  }, [inventory]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_transfers', balanceTransfers);
  }, [balanceTransfers]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_hq_expenses', hqExpenses);
  }, [hqExpenses]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_fx_rates', exchangeRates);
  }, [exchangeRates]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_hubs', hubs);
  }, [hubs]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_chat', chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_cart', cart);
  }, [cart]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_coupons', coupons);
  }, [coupons]);

  useEffect(() => {
    if (appliedCoupon) {
      safeLocalStorageSet('wrikmart_applied_coupon', appliedCoupon);
    } else {
      safeLocalStorageRemove('wrikmart_applied_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_customers_v1', customers);
  }, [customers]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_customer_profile', customerProfile);
  }, [customerProfile]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_birthday_settings', birthdaySettings);
  }, [birthdaySettings]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_selected_district', selectedDistrict);
  }, [selectedDistrict]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_preorder_settings', preOrderFormSettings);
  }, [preOrderFormSettings]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_sourcing_stores', sourcingStores);
  }, [sourcingStores]);

  useEffect(() => {
    safeLocalStorageSet('wrikmart_eps_settings', epsSettings);
  }, [epsSettings]);

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
    const standardDelivery = Number(preOrderFormSettings?.courierDeliveryCharge ?? 200);
    const freeThreshold = Number(preOrderFormSettings?.freeShippingThreshold || 0);
    const deliveryCharge = (freeThreshold > 0 && estimatedSubtotal >= freeThreshold) ? 0 : standardDelivery;
    const estimatedTotal = estimatedSubtotal + deliveryCharge;
    const advanceRequired = advancePaid || Math.round(estimatedTotal * 0.30);

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

    let cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '88' + cleanPhone;
    }
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : null;

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
  // READY STOCK INVENTORY MANAGEMENT (ADMIN)
  // ==========================================
  const addInventoryProduct = (productData) => {
    const newProduct = {
      id: `prod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: productData.name || 'Untitled Stock Item',
      brand: productData.brand || 'Original Brand',
      category: productData.category || 'General',
      sku: productData.sku || `WM-${Date.now().toString().slice(-6)}`,
      warehouse: productData.warehouse || 'Dhaka Main Hub (Tejgaon)',
      costPrice: Number(productData.costPrice || (Number(productData.sellingPrice || 0) * 0.75)),
      sellingPrice: Number(productData.sellingPrice || productData.price || 0),
      price: Number(productData.sellingPrice || productData.price || 0),
      originalMrp: productData.originalMrp ? Number(productData.originalMrp) : null,
      currentStock: Number(productData.currentStock ?? productData.stock ?? 0),
      stock: Number(productData.currentStock ?? productData.stock ?? 0),
      reorderLevel: Number(productData.reorderLevel || 5),
      image: productData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      description: productData.description || 'Authentic imported stock with official warranty.',
      badge: productData.badge || (productData.isDefect ? 'Clearance Deal' : 'New Arrival'),
      specs: productData.specs || { Color: 'Standard', Warranty: 'Official 1 Year' },
      isDefect: Boolean(productData.isDefect),
      defectNote: productData.defectNote || '',
      clearancePrice: productData.clearancePrice ? Number(productData.clearancePrice) : null,
      videoUrl: productData.videoUrl ? productData.videoUrl.trim() : '',
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString()
    };

    setInventory(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to ${newProduct.isDefect ? 'clearance' : 'stock'} inventory!`, 'success');
    return newProduct;
  };

  const updateInventoryProduct = (id, updatedFields) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const next = { ...item, ...updatedFields };
        if (updatedFields.sellingPrice !== undefined) {
          next.price = Number(updatedFields.sellingPrice);
          next.sellingPrice = Number(updatedFields.sellingPrice);
        }
        if (updatedFields.clearancePrice !== undefined) {
          next.clearancePrice = updatedFields.clearancePrice ? Number(updatedFields.clearancePrice) : null;
        }
        if (updatedFields.currentStock !== undefined) {
          next.stock = Number(updatedFields.currentStock);
          next.currentStock = Number(updatedFields.currentStock);
        }
        return next;
      }
      return item;
    }));
    showToast('Product inventory updated successfully!', 'success');
  };

  const deleteInventoryProduct = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Product removed from inventory.', 'info');
  };

  const clearAllInventory = () => {
    setInventory([]);
    safeLocalStorageSet('wrikmart_inventory_v3', []);
    showToast('All stock inventory products deleted permanently.', 'warning');
  };

  const restoreDemoInventory = () => {
    setInventory([]);
    safeLocalStorageSet('wrikmart_inventory_v3', []);
    showToast('Stock inventory reset to clean state.', 'info');
  };

  // Dedicated Defect & Clearance Operations
  const convertProductToClearance = (id, { defectNote, clearancePrice, defectType, defectImage }) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const regularPrice = item.sellingPrice || item.price || 0;
        const parsedClearancePrice = Number(clearancePrice) > 0 ? Number(clearancePrice) : Math.round(regularPrice * 0.7);
        return {
          ...item,
          isDefect: true,
          defectNote: defectNote || 'Cosmetic box packaging damage incurred during air transit. Product is 100% brand new, authentic, and tested.',
          defectType: defectType || 'Box Crease',
          defectImage: defectImage || null,
          clearancePrice: parsedClearancePrice,
          originalMrp: item.originalMrp || regularPrice,
          sellingPrice: parsedClearancePrice,
          price: parsedClearancePrice,
          badge: 'Clearance Deal'
        };
      }
      return item;
    }));
    showToast('Product converted to Defect / Clearance sale!', 'success');
  };

  const revertProductFromClearance = (id) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const restoredPrice = item.originalMrp || item.sellingPrice || item.price;
        return {
          ...item,
          isDefect: false,
          defectNote: '',
          defectType: null,
          defectImage: null,
          clearancePrice: null,
          sellingPrice: restoredPrice,
          price: restoredPrice,
          badge: 'In Stock'
        };
      }
      return item;
    }));
    showToast('Product reverted back to standard inventory stock.', 'info');
  };

  const updateClearancePrice = (id, newClearancePrice) => {
    const priceNum = Number(newClearancePrice);
    if (!priceNum || priceNum <= 0) return;
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          clearancePrice: priceNum,
          sellingPrice: priceNum,
          price: priceNum
        };
      }
      return item;
    }));
    showToast('Clearance price updated!', 'success');
  };

  // ==========================================
  // AUTHENTICATION & USER MANAGEMENT
  // ==========================================
  const DEFAULT_USERS = [
    {
      id: 'usr-admin-1',
      name: 'Super Admin',
      email: 'admin@wrikmart.com',
      password: 'password123',
      role: 'admin',
      phone: '+880 1800-000000',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-customer-1',
      name: 'Rafiqul Islam',
      email: 'customer@wrikmart.com',
      password: 'password123',
      role: 'customer',
      phone: '+880 1712-345678',
      district: 'Dhaka',
      address: 'House 42, Road 11, Banani, Dhaka',
      dateOfBirth: '1995-09-06',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-agent-in',
      name: 'Arafat Khan',
      email: 'arafat.india@wrikmart.com',
      password: 'password123',
      role: 'agent',
      agentId: 'agent-1',
      country: 'India',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-agent-ae',
      name: 'Sabbir Hossain',
      email: 'sabbir.dubai@wrikmart.com',
      password: 'password123',
      role: 'agent',
      agentId: 'agent-2',
      country: 'Dubai',
      phone: '+971 50 123 4567',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-agent-th',
      name: 'Mehedi Hasan',
      email: 'mehedi.thai@wrikmart.com',
      password: 'password123',
      role: 'agent',
      agentId: 'agent-3',
      country: 'Thailand',
      phone: '+66 81 234 5678',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('wrikmart_registered_users');
    let list = DEFAULT_USERS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map(u => u.id));
          const missing = DEFAULT_USERS.filter(u => !existingIds.has(u.id));
          list = [...parsed, ...missing];
        }
      } catch (e) {}
    }
    return list;
  });

  useEffect(() => {
    safeLocalStorageSet('wrikmart_registered_users', registeredUsers);
  }, [registeredUsers]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('wrikmart_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSet('wrikmart_current_user', currentUser);
    } else {
      safeLocalStorageRemove('wrikmart_current_user');
    }
  }, [currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const login = ({ email, password, role }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Find matching user or fallback to demo role user
    let user = registeredUsers.find(u => 
      (u.email?.toLowerCase() === cleanEmail || u.phone === email?.trim())
    );

    if (!user) {
      // Check if matches any agent by email, country or alias
      const matchingAgent = agents.find(a => 
        a.email?.toLowerCase() === cleanEmail ||
        a.phone === email?.trim() ||
        a.id === cleanEmail ||
        (cleanEmail.includes('india') && a.country === 'India') ||
        (cleanEmail.includes('dubai') && a.country === 'Dubai') ||
        (cleanEmail.includes('thai') && a.country === 'Thailand')
      );

      if (matchingAgent) {
        user = {
          id: `usr-${matchingAgent.id}`,
          name: matchingAgent.name,
          email: matchingAgent.email,
          password: 'password123',
          role: 'agent',
          agentId: matchingAgent.id,
          country: matchingAgent.country,
          avatar: matchingAgent.avatar
        };
      } else if (cleanEmail.includes('admin')) {
        user = DEFAULT_USERS.find(u => u.role === 'admin');
      } else if (cleanEmail.includes('agent')) {
        user = DEFAULT_USERS.find(u => u.role === 'agent');
      } else {
        user = {
          id: `usr-${Date.now()}`,
          name: cleanEmail.split('@')[0] || 'Customer Member',
          email: cleanEmail,
          password: password || 'password123',
          role: role || 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
        };
      }
    }

    if (user?.password && password && user.password !== password) {
      showToast('Incorrect password. Please verify your credentials or reset your password.', 'error');
      return { success: false, message: 'Invalid password' };
    }

    setCurrentUser(user);
    if (user.role === 'customer' || !customerProfile?.name) {
      setCustomerProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        district: user.district || prev.district || 'Dhaka',
        dateOfBirth: user.dateOfBirth || prev.dateOfBirth || ''
      }));
    }
    if (user.role) {
      setCurrentRole(user.role);
      if (user.role === 'agent' && user.agentId) {
        setActiveAgentId(user.agentId);
      }
    }
    setIsAuthModalOpen(false);
    const destinationName = user.role === 'admin' ? 'Super Admin Dashboard' : user.role === 'agent' ? 'Agent Workstation' : 'Customer Hub';
    showToast(`Welcome back, ${user.name}! Connected to ${destinationName}.`, 'success');
    return { success: true, user };
  };

  const changeUserPassword = ({ identifier, currentPassword, newPassword, confirmPassword }) => {
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return { success: false, message: 'Password too short' };
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match', 'warning');
      return { success: false, message: 'Passwords do not match' };
    }

    const cleanId = (identifier || currentUser?.email || currentUser?.phone || '').trim().toLowerCase();
    if (!cleanId) {
      showToast('Please specify your registered email or phone', 'error');
      return { success: false, message: 'User identifier required' };
    }

    let found = false;
    setRegisteredUsers(prev => {
      const updated = prev.map(u => {
        const matchEmail = u.email?.toLowerCase() === cleanId;
        const matchPhone = u.phone?.trim() === cleanId;
        const matchAdmin = cleanId.includes('admin') && u.role === 'admin';
        const matchAgent = cleanId.includes('agent') && u.role === 'agent';
        
        if (matchEmail || matchPhone || matchAdmin || matchAgent) {
          found = true;
          return { ...u, password: newPassword };
        }
        return u;
      });

      if (!found) {
        updated.push({
          id: `usr-${Date.now()}`,
          name: cleanId.split('@')[0] || 'User',
          email: cleanId,
          password: newPassword,
          role: currentUser?.role || 'customer'
        });
      }
      return updated;
    });

    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : prev);
    }

    showToast('Password updated successfully! Your new password is now active.', 'success');
    return { success: true };
  };

  const registerUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name?.trim() || 'New User',
      email: userData.email?.trim() || `${Date.now()}@customer.wrikmart.com`,
      phone: userData.phone?.trim() || '',
      password: userData.password || 'password123',
      district: userData.district || 'Dhaka',
      address: userData.address || '',
      dateOfBirth: userData.dateOfBirth || '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    setRegisteredUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCurrentRole('customer');
    setCustomerTab('home');

    // Also sync to customerProfile and customers CRM
    setCustomerProfile(newUser);
    setCustomers(prev => [newUser, ...prev.filter(c => c.phone !== newUser.phone)]);

    setIsAuthModalOpen(false);
    showToast(`Account created successfully! Welcome, ${newUser.name}.`, 'success');
    return { success: true, user: newUser };
  };

  const logout = () => {
    const prevName = currentUser?.name;
    setCurrentUser(null);
    setCurrentRole('customer');
    setCustomerTab('home');
    setCustomerProfile({
      id: `cust-${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      address: '',
      district: 'Dhaka',
      dateOfBirth: ''
    });
    safeLocalStorageRemove('wrikmart_customer_profile');
    safeLocalStorageRemove('wrikmart_current_user');
    showToast(prevName ? `Goodbye, ${prevName}! You have been signed out.` : 'Logged out successfully.', 'info');
  };

  const updateCurrentUserAvatar = (newAvatarUrl) => {
    if (!newAvatarUrl) return;
    if (currentUser) {
      const updated = { ...currentUser, avatar: newAvatarUrl };
      setCurrentUser(updated);
      setRegisteredUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar: newAvatarUrl } : u));
      if (currentUser.role === 'agent' && currentUser.agentId) {
        setAgents(prev => prev.map(a => a.id === currentUser.agentId ? { ...a, avatar: newAvatarUrl } : a));
      }
      showToast('Profile photo updated successfully!', 'success');
    }
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
    const advancePaid = Number(financials?.advancePaid ?? (paymentStatus === 'Fully Paid' ? estimatedTotal : Math.round(estimatedSubtotal * 0.30)));
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

  const updateAdminOrder = (orderId, updatedData) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const items = updatedData.items || order.items;
      const orderType = updatedData.orderType || order.orderType;
      const country = orderType === 'Stock Product' ? 'Bangladesh' : (updatedData.country || order.country);
      
      const estimatedSubtotal = items.reduce((sum, item) => sum + (Number(item.expectedPrice || 0) * (item.specs?.unit || 1)), 0);
      const deliveryCharge = Number(updatedData.financials?.deliveryCharge ?? order.financials.deliveryCharge ?? 200);
      const estimatedTotal = estimatedSubtotal + deliveryCharge;
      
      const paymentStatus = updatedData.paymentStatus || order.paymentStatus;
      const advancePaid = Number(updatedData.financials?.advancePaid ?? (paymentStatus === 'Fully Paid' ? estimatedTotal : (paymentStatus === 'Unpaid' ? 0 : Math.round(estimatedSubtotal * 0.30))));
      const dueAmount = Math.max(0, estimatedTotal - advancePaid);

      const matchedAgent = updatedData.assignedAgentId 
        ? agents.find(a => a.id === updatedData.assignedAgentId)
        : (orderType === 'Stock Product' ? null : agents.find(a => a.country.toLowerCase() === country.toLowerCase()) || agents[0]);

      return {
        ...order,
        orderType,
        country,
        countryFlag: orderType === 'Stock Product' ? '🇧🇩' : (country === 'India' ? '🇮🇳' : country === 'Dubai' ? '🇦🇪' : '🇹🇭'),
        status: updatedData.status || order.status,
        paymentStatus,
        purchaseDeadline: updatedData.purchaseDeadline || order.purchaseDeadline,
        assignedAgentId: orderType === 'Stock Product' ? null : matchedAgent?.id,
        assignedAgentName: orderType === 'Stock Product' ? 'Dhaka Hub Fulfillment' : matchedAgent?.name,
        customer: {
          ...order.customer,
          ...(updatedData.customer || updatedData.customerInfo || {}),
          note: updatedData.note || updatedData.customer?.note || updatedData.customerInfo?.note || order.customer.note
        },
        financials: {
          ...order.financials,
          estimatedSubtotal,
          deliveryCharge,
          estimatedTotal,
          advanceRequired: advancePaid,
          advancePaid,
          finalSellingPrice: estimatedTotal,
          dueAmount,
          grossProfitBDT: Math.round(estimatedTotal - (estimatedSubtotal * 0.75) - 120)
        },
        items: items.map((item, idx) => ({
          id: item.id || `item-${Date.now()}-${idx}`,
          name: item.name,
          category: item.category || 'General',
          brand: item.brand || 'Original Brand',
          url: item.url || '',
          image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
          specs: item.specs || { size: 'Standard', color: 'Default', unit: 1 },
          expectedPrice: Number(item.expectedPrice || 0),
          actualPurchasePrice: item.actualPurchasePrice ?? (orderType === 'Stock Product' ? Number(item.costPrice || item.expectedPrice * 0.75) : null),
          actualPurchaseCurrency: item.actualPurchaseCurrency ?? (orderType === 'Stock Product' ? 'BDT' : matchedAgent?.currency || 'INR'),
          mrp: Number(item.mrp || item.expectedPrice * 1.1),
          purchasedFrom: item.purchasedFrom || (orderType === 'Stock Product' ? 'Dhaka Warehouse Local Stock' : ''),
          purchaseDate: item.purchaseDate || (orderType === 'Stock Product' ? new Date().toLocaleString() : null),
          receiptImage: item.receiptImage || null,
          notes: item.notes || ''
        }))
      };
    }));

    showToast(`Order #${orderId} updated successfully!`, 'success');
  };

  const deleteAdminOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast(`Order #${orderId} deleted successfully!`, 'success');
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
    let previousPurchasedCost = 0;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        previousPurchasedCost = order.items.reduce((sum, it) => sum + Number(it.actualPurchasePrice || 0), 0);
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
            purchaseDate: it.purchaseDate || new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            receiptImage: match.receiptImage || it.receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
            notes: match.notes || it.notes
          };
        });

        const newTimeline = order.timeline.map(t => {
          if (t.step === 'Purchase Updated') {
            return {
              ...t,
              time: t.done ? t.time : new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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

    // Debit the Agent's Operating Balance for the incremental delta
    const costDelta = totalPurchasedCost - previousPurchasedCost;
    if (costDelta !== 0) {
      setAgents(prev => prev.map(a => {
        if (a.id === activeAgentId) {
          return {
            ...a,
            balance: Math.max(0, a.balance - costDelta),
            totalSpent: Math.max(0, a.totalSpent + costDelta)
          };
        }
        return a;
      }));
    }

    showToast(`Purchase details & MRP recorded! Order status updated to 'Purchased'.`, 'success');
  };

  // Agent Marks Product Delivered to Hub / In Transit
  const markOrderAtHub = (orderId, hubId, expectedDeliveryDate, targetStatus = 'In Transit') => {
    const selectedHub = hubs.find(h => h.id === hubId) || hubs[0];
    const isTransit = targetStatus === 'In Transit' || targetStatus === 'Shipped';
    const finalStatus = isTransit ? 'In Transit' : 'At Delivery House';

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const timeNow = new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const newTimeline = order.timeline.map(t => {
          if (t.step === 'Arrived at Hub') {
            return {
              ...t,
              time: timeNow,
              actor: selectedHub.name,
              note: `Received at ${selectedHub.name} (Expected Delivery: ${expectedDeliveryDate || 'Soon'})`,
              done: true
            };
          }
          if (isTransit && t.step === 'Shipped to Bangladesh') {
            return {
              ...t,
              time: timeNow,
              actor: `${selectedHub.name} Air Freight`,
              note: `Consignment handed over for international air transit to Bangladesh`,
              done: true
            };
          }
          return t;
        });

        return {
          ...order,
          status: finalStatus,
          hubId: selectedHub.id,
          hubName: selectedHub.name,
          timeline: newTimeline
        };
      }
      return order;
    }));

    showToast(isTransit ? `Order #${orderId} marked In Transit to Bangladesh!` : `Order marked as Staged at ${selectedHub.name}!`, 'success');
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

  // Admin receives consignment in Bangladesh Central Hub & recalculates exact landed costs & profit
  const receiveOrderInBangladesh = ({
    orderId,
    exchangeRate,
    internationalShippingCostBDT = 500,
    localDeliveryCostBDT = 120,
    courierPartner = 'Steadfast Courier',
    condition = 'Intact & Sealed',
    notes = '',
    itemPurchasePrices = null
  }) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        // Calculate items and total foreign purchase cost
        let totalForeignCost = 0;
        const updatedItems = order.items.map(it => {
          const customPrice = itemPurchasePrices && itemPurchasePrices[it.id] !== undefined
            ? Number(itemPurchasePrices[it.id])
            : Number(it.actualPurchasePrice || (it.expectedPrice ? it.expectedPrice * 0.75 : 0));
          const unit = it.specs?.unit || 1;
          totalForeignCost += customPrice * unit;
          return {
            ...it,
            actualPurchasePrice: customPrice
          };
        });

        const rate = Number(exchangeRate) || 1.43;
        const agentCostBDT = Math.round(totalForeignCost * rate);
        const shippingCostBDT = Number(internationalShippingCostBDT || 0);
        const localCourierCostBDT = Number(localDeliveryCostBDT || 0);
        const totalSourcingCostBDT = agentCostBDT + shippingCostBDT + localCourierCostBDT;
        const sellingPriceBDT = Number(order.financials?.estimatedTotal || order.financials?.finalSellingPrice || 0);
        const grossProfitBDT = sellingPriceBDT - totalSourcingCostBDT;

        const receiveTime = new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const newTimeline = order.timeline.map(t => {
          if (t.step === 'Bangladesh Received') {
            return {
              ...t,
              time: receiveTime,
              actor: 'Dhaka Central Hub',
              note: `Consignment safely received in Bangladesh (${condition}). Landed cost calculated.`,
              done: true
            };
          }
          if (t.step === 'Ready for Delivery') {
            return {
              ...t,
              time: receiveTime,
              actor: courierPartner || 'Steadfast Courier',
              note: `Ready for doorstep delivery via ${courierPartner || 'Steadfast Courier'}`,
              done: true
            };
          }
          if (t.step === 'Shipped to Bangladesh' && !t.done) {
            return {
              ...t,
              time: receiveTime,
              actor: 'Air Cargo Logistics',
              note: 'Cleared Bangladesh customs & arrived at hub',
              done: true
            };
          }
          return t;
        });

        return {
          ...order,
          status: 'BD Received',
          courierName: courierPartner || 'Steadfast Courier',
          bdReceivedAt: receiveTime,
          bdReceivedDetails: {
            receivedAt: receiveTime,
            exchangeRate: rate,
            internationalShippingCostBDT: shippingCostBDT,
            localDeliveryCostBDT: localCourierCostBDT,
            courierPartner: courierPartner || 'Steadfast Courier',
            condition,
            notes,
            totalForeignCost,
            totalSourcingCostBDT,
            grossProfitBDT
          },
          items: updatedItems,
          financials: {
            ...order.financials,
            agentCostBDT,
            shippingCostBDT,
            localCourierCostBDT,
            grossProfitBDT,
            isProcured: true,
            exchangeRateUsed: rate
          },
          timeline: newTimeline
        };
      }
      return order;
    }));

    showToast(`Order #${orderId} received at Bangladesh Central Hub! Landed cost & profit updated.`, 'success');
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
      receiptImage: receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
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
      voucherScanUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
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
      voucherScanUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
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
    const rateNum = Number(newRateFromBDT);
    if (!rateNum || rateNum <= 0 || isNaN(rateNum)) {
      showToast('Exchange rate must be a valid positive number greater than 0', 'error');
      return;
    }
    setExchangeRates(prev => {
      const existing = prev[currencyCode];
      if (!existing) return prev;
      return {
        ...prev,
        [currencyCode]: {
          ...existing,
          rateFromBDT: rateNum,
          rateToBDT: Number((1 / rateNum).toFixed(4))
        }
      };
    });
    showToast(`Updated BDT to ${currencyCode} conversion rate to ${rateNum}`, 'success');
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
        documentUrl: newAgentData.docUrl || newAgentData.govtDocument?.documentUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
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

  // Update Agent Details & KYC
  const updateAgent = (agentId, updatedData) => {
    setAgents(prev => {
      const next = prev.map(a => {
        if (a.id !== agentId) return a;
        const country = updatedData.country || a.country;
        return {
          ...a,
          ...updatedData,
          country,
          flag: country === 'India' ? '🇮🇳' : country === 'Dubai' ? '🇦🇪' : '🇹🇭',
          currency: updatedData.currency || (country === 'India' ? 'INR' : country === 'Dubai' ? 'AED' : 'THB'),
          symbol: country === 'India' ? '₹' : country === 'Dubai' ? 'د.إ' : '฿',
          referencePerson: {
            ...(a.referencePerson || {}),
            ...(updatedData.referencePerson || {})
          },
          govtDocument: {
            ...(a.govtDocument || {}),
            ...(updatedData.govtDocument || {})
          },
          balance: updatedData.balance !== undefined ? Number(updatedData.balance) : a.balance
        };
      });
      return next;
    });
    showToast('Agent profile updated successfully!', 'success');
  };

  // Delete Agent
  const deleteAgent = (agentId) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    showToast('Agent removed from network', 'info');
  };

  // Add Delivery Hub
  const addHub = (newHub) => {
    const hub = {
      id: `hub-${Date.now()}`,
      status: 'Active',
      activePackages: 0,
      capacity: Number(newHub.capacity || 2000),
      ...newHub
    };
    setHubs(prev => [...prev, hub]);
    showToast(`New Hub "${newHub.name}" registered!`, 'success');
  };

  // Update Delivery Hub
  const updateHub = (hubId, updatedData) => {
    setHubs(prev => {
      const next = prev.map(h => {
        if (h.id !== hubId) return h;
        return {
          ...h,
          ...updatedData,
          capacity: updatedData.capacity !== undefined ? Number(updatedData.capacity) : h.capacity
        };
      });
      return next;
    });
    showToast(`Hub "${updatedData.name || 'details'}" updated successfully!`, 'success');
  };

  // Delete Delivery Hub
  const deleteHub = (hubId) => {
    setHubs(prev => prev.filter(h => h.id !== hubId));
    showToast('Hub deleted successfully', 'info');
  };

  // Send Chat Message
  const sendChatMessage = (text, isAgent = false) => {
    const senderName = isAgent 
      ? activeAgent.name 
      : (currentUser ? currentUser.name : (currentRole === 'admin' ? 'WrikMart Support' : 'Customer'));

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole: isAgent ? 'agent' : currentRole,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent
    };
    setChatMessages(prev => [...prev, newMsg]);

    // If sent by customer, simulate live support acknowledgment
    if (!isAgent && (currentRole === 'customer' || !currentUser)) {
      setTimeout(() => {
        const supportReply = {
          id: `msg-${Date.now() + 1}`,
          senderRole: 'admin',
          senderName: 'WrikMart Support',
          text: `Thank you for reaching out! Our logistics & overseas sourcing team has received your inquiry: "${text.length > 45 ? text.slice(0, 42) + '...' : text}". A support representative is actively looking into this for you.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAgent: false
        };
        setChatMessages(prev => [...prev, supportReply]);
      }, 900);
    }
  };

  // Supported Global Sourcing Stores Management (Admin)
  const addSourcingStore = (newStore) => {
    const storeObj = {
      id: `store-${Date.now()}`,
      name: newStore.name?.trim() || 'Global Store',
      country: newStore.country || 'Global',
      cat: newStore.cat?.trim() || 'Imported Goods',
      url: newStore.url?.trim() || '',
      brand: (newStore.brand || (newStore.name ? newStore.name.toLowerCase().split(' ')[0] : 'custom')).toLowerCase(),
      logoUrl: newStore.logoUrl?.trim() || '',
      isActive: newStore.isActive !== false
    };
    setSourcingStores(prev => [storeObj, ...prev]);
    showToast(`Added store "${storeObj.name}" successfully!`, 'success');
    return storeObj;
  };

  const updateSourcingStore = (storeId, updatedData) => {
    setSourcingStores(prev => prev.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          ...updatedData,
          brand: updatedData.brand !== undefined ? updatedData.brand.toLowerCase() : s.brand
        };
      }
      return s;
    }));
    showToast('Store details updated successfully!', 'success');
  };

  const deleteSourcingStore = (storeId) => {
    setSourcingStores(prev => prev.filter(s => s.id !== storeId));
    showToast('Store removed successfully!', 'success');
  };

  const toggleSourcingStoreStatus = (storeId) => {
    setSourcingStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const next = !s.isActive;
        showToast(`Store "${s.name}" is now ${next ? 'visible on' : 'hidden from'} homepage!`, 'info');
        return { ...s, isActive: next };
      }
      return s;
    }));
  };

  const resetSourcingStores = () => {
    setSourcingStores(DEFAULT_SOURCING_STORES);
    safeLocalStorageSet('wrikmart_sourcing_stores', DEFAULT_SOURCING_STORES);
    showToast('Reset stores to default 12 official stores!', 'success');
  };

  const contextValue = useMemo(() => ({
    currentRole,
    setCurrentRole,
    customerTab,
    setCustomerTab,
    adminNav,
    setAdminNav,
    agentTab,
    setAgentTab,
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
    reportDamageOrReturn,
    resolveDamageOrReturn,
    updateOrderPurchase,
    markOrderAtHub,
    updateOrderStatus,
    receiveOrderInBangladesh,
    assignAgentToOrder,
    addAgentExpense,
    reviewExpense,
    addHqExpense,
    generateMonthlyHqBatch,
    updateHqExpenseStatus,
    deleteHqExpense,
    updateExchangeRate,
    addAgent,
    updateAgent,
    deleteAgent,
    addHub,
    updateHub,
    deleteHub,
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
    setPrefilledPreOrder,
    // District Sync & Pre-Order Form Settings
    selectedDistrict,
    setSelectedDistrict,
    preOrderFormSettings,
    setPreOrderFormSettings,
    // Global Sourcing Stores (Home Page & Pre-Order)
    sourcingStores,
    setSourcingStores,
    addSourcingStore,
    updateSourcingStore,
    deleteSourcingStore,
    toggleSourcingStoreStatus,
    resetSourcingStores,
    // Ready Stock Inventory Management (Admin)
    addInventoryProduct,
    updateInventoryProduct,
    deleteInventoryProduct,
    clearAllInventory,
    restoreDemoInventory,
    // Defect & Clearance Sales Suite
    clearanceSettings,
    setClearanceSettings,
    updateClearanceSettings,
    resetClearanceSettings,
    convertProductToClearance,
    revertProductFromClearance,
    updateClearancePrice,
    // Pre-Order & Order Management
    createAdminOrder,
    updateAdminOrder,
    deleteAdminOrder,
    // Footer CMS
    footerSettings,
    setFooterSettings,
    updateFooterSettings,
    resetFooterSettings,
    // Official EPS Gateway Settings
    epsSettings,
    setEpsSettings,
    updateEpsSettings,
    currentUser,
    setCurrentUser,
    registeredUsers,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    logout,
    registerUser,
    changeUserPassword,
    updateCurrentUserAvatar
  }), [
    currentRole, customerTab, adminNav, agentTab, activeAgentId, activeAgent,
    orders, agents, hubs, inventory, exchangeRates, expenses, hqExpenses,
    balanceTransfers, chatMessages, toast, cart, isCartOpen, coupons, appliedCoupon,
    customers, customerProfile, birthdaySettings, stockSearchQuery, prefilledPreOrder,
    selectedDistrict, preOrderFormSettings, sourcingStores, footerSettings, epsSettings, currentUser, isAuthModalOpen, authModalMode,
    registeredUsers, clearanceSettings
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

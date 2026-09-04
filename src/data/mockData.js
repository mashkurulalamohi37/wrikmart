export const INITIAL_EXCHANGE_RATES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', flag: '🇮🇳', rateToBDT: 1.43, rateFromBDT: 0.70 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'Dubai', flag: '🇦🇪', rateToBDT: 32.50, rateFromBDT: 0.0308 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭', rateToBDT: 3.55, rateFromBDT: 0.282 },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh', flag: '🇧🇩', rateToBDT: 1, rateFromBDT: 1 }
};

export const INITIAL_AGENTS = [
  {
    id: 'agent-1',
    name: 'Arafat Khan',
    country: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    phone: '+91 98765 43210',
    email: 'arafat.india@wrikmart.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    balance: 24350.00,
    totalSpent: 185400.00,
    activeOrders: 6,
    completedOrders: 845,
    status: 'Active',
    pendingBalance: 10000.00, // Pending balance request waiting for acceptance
    pendingBalanceBDT: 14285.71,
    pendingTransferId: 'TRF-2026-089'
  },
  {
    id: 'agent-2',
    name: 'Sabbir Hossain',
    country: 'Dubai',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'د.إ',
    phone: '+971 50 123 4567',
    email: 'sabbir.dubai@wrikmart.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    balance: 8420.00,
    totalSpent: 420500.00,
    activeOrders: 4,
    completedOrders: 612,
    status: 'Active',
    pendingBalance: 0,
    pendingBalanceBDT: 0,
    pendingTransferId: null
  },
  {
    id: 'agent-3',
    name: 'Mehedi Hasan',
    country: 'Thailand',
    flag: '🇹🇭',
    currency: 'THB',
    symbol: '฿',
    phone: '+66 81 234 5678',
    email: 'mehedi.thai@wrikmart.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    balance: 35800.00,
    totalSpent: 310200.00,
    activeOrders: 3,
    completedOrders: 523,
    status: 'Active',
    pendingBalance: 15200.00,
    pendingBalanceBDT: 53900.00,
    pendingTransferId: 'TRF-2026-092'
  }
];

export const INITIAL_HUBS = [
  {
    id: 'hub-1',
    name: 'Dhaka Main Hub',
    country: 'Bangladesh',
    location: 'House-08, Road-12, Sector-11, Mirpur, Dhaka-1216',
    manager: 'Rashidul Islam',
    phone: '+880 1812345678',
    status: 'Active',
    capacity: 2500,
    activePackages: 142
  },
  {
    id: 'hub-2',
    name: 'Chittagong Hub',
    country: 'Bangladesh',
    location: 'Agrabad C/A, Chittagong',
    manager: 'Tanjin Ahmed',
    phone: '+880 1712345679',
    status: 'Active',
    capacity: 1500,
    activePackages: 68
  },
  {
    id: 'hub-3',
    name: 'Dubai Central Hub',
    country: 'Dubai',
    location: 'Al Quoz Industrial Area 3, Dubai, UAE',
    manager: 'Farhan Zaidi',
    phone: '+971 52 987 6543',
    status: 'Active',
    capacity: 3000,
    activePackages: 95
  },
  {
    id: 'hub-4',
    name: 'Delhi Gateway Hub',
    country: 'India',
    location: 'Mahipalpur Extension, New Delhi - 110037',
    manager: 'Vikram Mehta',
    phone: '+91 98111 22334',
    status: 'Active',
    capacity: 2000,
    activePackages: 110
  },
  {
    id: 'hub-5',
    name: 'Bangkok Logistics Hub',
    country: 'Thailand',
    location: 'Bangna-Trad Road, Bang Phli, Samut Prakan, Bangkok',
    manager: 'Somchai Prasert',
    phone: '+66 89 876 5432',
    status: 'Active',
    capacity: 1800,
    activePackages: 54
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'PO-2026-000125',
    orderNumber: 'PO-2026-000125',
    country: 'India',
    countryFlag: '🇮🇳',
    status: 'Processing', // 'Processing', 'Purchased', 'At Delivery House', 'Shipped', 'BD Received', 'Delivered'
    paymentStatus: 'Advance Paid',
    createdAt: '2026-05-12 10:30 AM',
    purchaseDeadline: '2026-05-15',
    assignedAgentId: 'agent-1',
    assignedAgentName: 'Arafat Khan',
    hubId: 'hub-1',
    hubName: 'Dhaka Main Hub',
    
    // Customer Info (ONLY VISIBLE TO ADMIN & CUSTOMER, STRICTLY HIDDEN FROM AGENT)
    customer: {
      id: 'cust-101',
      name: 'Rahim Chowdhury',
      phone: '+880 1712-345678',
      email: 'rahim.c@example.com',
      address: 'House 12, Road 5, Dhanmondi, Dhaka-1205',
      district: 'Dhaka',
      note: 'Please pack in double bubble wrap for fragile shoe box.'
    },

    // Financials (Customer View)
    financials: {
      currency: 'BDT',
      symbol: '৳',
      estimatedSubtotal: 13000,
      deliveryCharge: 200,
      estimatedTotal: 13200,
      advanceRequired: 3050,
      advancePaid: 3050,
      finalSellingPrice: 13200,
      dueAmount: 10150
    },

    // Items
    items: [
      {
        id: 'item-1',
        name: 'Nike Air Max 270',
        url: 'https://www.nike.com/in/t/air-max-270-mens-shoes-K2NzSd',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
        specs: { size: '42', color: 'Black/Red', unit: 1 },
        expectedPrice: 8000,
        // Agent Purchase Tracking (Mandatory to enter)
        actualPurchasePrice: 6000,
        actualPurchaseCurrency: 'INR',
        mrp: 8500,
        purchasedFrom: 'Nike India Official Store',
        purchaseDate: '2026-05-12 04:15 PM',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
        notes: 'Original box with seal intact.'
      },
      {
        id: 'item-2',
        name: 'Adidas Classic Backpack',
        url: 'https://www.adidas.co.in/classic-badge-of-sport-backpack/HG0348.html',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
        specs: { size: 'Free Size', color: 'Matte Black', unit: 1 },
        expectedPrice: 5000,
        actualPurchasePrice: 2100,
        actualPurchaseCurrency: 'INR',
        mrp: 3000,
        purchasedFrom: 'Adidas Ambience Mall Delhi',
        purchaseDate: '2026-05-12 05:00 PM',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
        notes: 'Water resistant edition.'
      }
    ],

    // Transition History
    timeline: [
      { step: 'Order Placed', time: '12 May 2026, 10:30 AM', actor: 'Customer', note: 'Pre-order submitted with 2 items', done: true },
      { step: 'Payment Confirmed', time: '12 May 2026, 10:32 AM', actor: 'bKash Gateway', note: 'Advance payment of ৳3,050 verified (TrxID: 9X29A1K)', done: true },
      { step: 'Agent Assigned', time: '12 May 2026, 11:00 AM', actor: 'Admin', note: 'Assigned to Agent Arafat Khan (India)', done: true },
      { step: 'Purchase Updated', time: '12 May 2026, 05:10 PM', actor: 'Arafat Khan (Agent)', note: 'Purchase price (₹8,100 total) & MRP recorded', done: true },
      { step: 'Arrived at Hub', time: '13 May 2026, 09:40 AM', actor: 'Delhi Gateway Hub', note: 'Received at Hub and prepared for air consignment', done: false },
      { step: 'Shipped to Bangladesh', time: 'Pending', actor: 'Air Cargo', note: 'Flight transit to Dhaka DAC', done: false },
      { step: 'Bangladesh Received', time: 'Pending', actor: 'Dhaka Main Hub', note: 'Customs cleared and stored in Mirpur warehouse', done: false },
      { step: 'Ready for Delivery', time: 'Pending', actor: 'Steadfast Courier', note: 'Assigned to last-mile rider', done: false },
      { step: 'Delivered', time: 'Pending', actor: 'Customer', note: 'Due collection & delivery completed', done: false }
    ]
  },
  {
    id: 'PO-2026-000124',
    orderNumber: 'PO-2026-000124',
    country: 'Dubai',
    countryFlag: '🇦🇪',
    status: 'Purchased',
    paymentStatus: 'Advance Paid',
    createdAt: '2026-05-11 03:20 PM',
    purchaseDeadline: '2026-05-14',
    assignedAgentId: 'agent-2',
    assignedAgentName: 'Sabbir Hossain',
    hubId: 'hub-3',
    hubName: 'Dubai Central Hub',
    customer: {
      id: 'cust-102',
      name: 'Nusrat Jahan',
      phone: '+880 1911-223344',
      email: 'nusrat.j@example.com',
      address: 'Flat 4B, Green Road, Dhaka',
      district: 'Dhaka',
      note: 'Call before delivery.'
    },
    financials: {
      currency: 'BDT',
      symbol: '৳',
      estimatedSubtotal: 28000,
      deliveryCharge: 300,
      estimatedTotal: 28300,
      advanceRequired: 7000,
      advancePaid: 7000,
      finalSellingPrice: 28300,
      dueAmount: 21300
    },
    items: [
      {
        id: 'item-3',
        name: 'Apple AirPods Max (Sky Blue)',
        url: 'https://www.apple.com/ae/shop/buy-airpods/airpods-max',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
        specs: { size: 'Standard', color: 'Sky Blue', unit: 1 },
        expectedPrice: 28000,
        actualPurchasePrice: 850,
        actualPurchaseCurrency: 'AED',
        mrp: 999,
        purchasedFrom: 'Apple Store Dubai Mall',
        purchaseDate: '2026-05-11 06:40 PM',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
        notes: 'Serial verified with 1-year Apple care.'
      }
    ],
    timeline: [
      { step: 'Order Placed', time: '11 May 2026, 03:20 PM', actor: 'Customer', note: 'Pre-order submitted', done: true },
      { step: 'Payment Confirmed', time: '11 May 2026, 03:25 PM', actor: 'Nagad Gateway', note: 'Advance paid ৳7,000', done: true },
      { step: 'Agent Assigned', time: '11 May 2026, 04:00 PM', actor: 'Admin', note: 'Assigned to Sabbir Hossain (Dubai)', done: true },
      { step: 'Purchase Updated', time: '11 May 2026, 06:45 PM', actor: 'Sabbir Hossain (Agent)', note: 'Purchased from Dubai Mall for 850 AED', done: true },
      { step: 'Arrived at Hub', time: 'Pending', actor: 'Dubai Central Hub', note: 'Drop-off scheduled', done: false },
      { step: 'Shipped to Bangladesh', time: 'Pending', actor: 'Cargo Emirates', note: '', done: false },
      { step: 'Bangladesh Received', time: 'Pending', actor: 'Dhaka Hub', note: '', done: false },
      { step: 'Ready for Delivery', time: 'Pending', actor: 'Rider', note: '', done: false },
      { step: 'Delivered', time: 'Pending', actor: 'Customer', note: '', done: false }
    ]
  },
  {
    id: 'PO-2026-000123',
    orderNumber: 'PO-2026-000123',
    country: 'Thailand',
    countryFlag: '🇹🇭',
    status: 'In Transit',
    paymentStatus: 'Advance Paid',
    createdAt: '2026-05-09 11:15 AM',
    purchaseDeadline: '2026-05-12',
    assignedAgentId: 'agent-3',
    assignedAgentName: 'Mehedi Hasan',
    hubId: 'hub-5',
    hubName: 'Bangkok Logistics Hub',
    customer: {
      id: 'cust-103',
      name: 'Tanvir Ahmed',
      phone: '+880 1819-876543',
      email: 'tanvir.a@example.com',
      address: 'GEC Circle, Chittagong',
      district: 'Chittagong',
      note: 'Fragile cosmetic packaging.'
    },
    financials: {
      currency: 'BDT',
      symbol: '৳',
      estimatedSubtotal: 9500,
      deliveryCharge: 250,
      estimatedTotal: 9750,
      advanceRequired: 2500,
      advancePaid: 2500,
      finalSellingPrice: 9750,
      dueAmount: 7250
    },
    items: [
      {
        id: 'item-4',
        name: 'Snailwhite Premium Skincare Set',
        url: 'https://shopee.co.th/snailwhite-official',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
        specs: { size: 'Pack of 3', color: 'Gold/White', unit: 2 },
        expectedPrice: 9500,
        actualPurchasePrice: 2400,
        actualPurchaseCurrency: 'THB',
        mrp: 3200,
        purchasedFrom: 'CentralWorld Bangkok',
        purchaseDate: '2026-05-10 01:20 PM',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
        notes: 'Manufacture date April 2026'
      }
    ],
    timeline: [
      { step: 'Order Placed', time: '09 May 2026, 11:15 AM', actor: 'Customer', note: 'Pre-order created', done: true },
      { step: 'Payment Confirmed', time: '09 May 2026, 11:20 AM', actor: 'bKash', note: 'Advance received ৳2,500', done: true },
      { step: 'Agent Assigned', time: '09 May 2026, 01:00 PM', actor: 'Admin', note: 'Assigned to Mehedi Hasan', done: true },
      { step: 'Purchase Updated', time: '10 May 2026, 01:30 PM', actor: 'Mehedi Hasan', note: 'Purchased for 2400 THB', done: true },
      { step: 'Arrived at Hub', time: '10 May 2026, 05:40 PM', actor: 'Bangkok Logistics Hub', note: 'Package sealed in crate', done: true },
      { step: 'Shipped to Bangladesh', time: '11 May 2026, 08:00 AM', actor: 'Thai Airways Cargo', note: 'AWB: TG-89102431', done: true },
      { step: 'Bangladesh Received', time: 'Pending', actor: 'Dhaka Hub', note: '', done: false },
      { step: 'Ready for Delivery', time: 'Pending', actor: 'Chittagong Hub Rider', note: '', done: false },
      { step: 'Delivered', time: 'Pending', actor: 'Customer', note: '', done: false }
    ]
  },
  {
    id: 'PO-2026-000122',
    orderNumber: 'PO-2026-000122',
    country: 'Dubai',
    countryFlag: '🇦🇪',
    status: 'Delivered',
    paymentStatus: 'Fully Paid',
    createdAt: '2026-05-01 09:10 AM',
    purchaseDeadline: '2026-05-04',
    assignedAgentId: 'agent-2',
    assignedAgentName: 'Sabbir Hossain',
    hubId: 'hub-1',
    hubName: 'Dhaka Main Hub',
    customer: {
      id: 'cust-104',
      name: 'Ashrafuzzaman',
      phone: '+880 1711-998877',
      email: 'ashraf@example.com',
      address: 'Uttara Sector 7, Dhaka',
      district: 'Dhaka',
      note: 'Office delivery before 5 PM'
    },
    financials: {
      currency: 'BDT',
      symbol: '৳',
      estimatedSubtotal: 45000,
      deliveryCharge: 200,
      estimatedTotal: 45200,
      advanceRequired: 10000,
      advancePaid: 10000,
      finalSellingPrice: 45200,
      dueAmount: 0
    },
    items: [
      {
        id: 'item-5',
        name: 'Sony PlayStation 5 Slim Digital',
        url: 'https://www.amazon.ae/playstation-5',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
        specs: { size: '1TB Digital', color: 'White', unit: 1 },
        expectedPrice: 45000,
        actualPurchasePrice: 1350,
        actualPurchaseCurrency: 'AED',
        mrp: 1549,
        purchasedFrom: 'Sharaf DG Dubai',
        purchaseDate: '2026-05-02 11:30 AM',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
        notes: 'UAE Official Warranty'
      }
    ],
    timeline: [
      { step: 'Order Placed', time: '01 May 2026', actor: 'Customer', note: 'Pre-order created', done: true },
      { step: 'Payment Confirmed', time: '01 May 2026', actor: 'Card Gateway', note: 'Advance paid ৳10,000', done: true },
      { step: 'Agent Assigned', time: '01 May 2026', actor: 'Admin', note: 'Assigned to Sabbir', done: true },
      { step: 'Purchase Updated', time: '02 May 2026', actor: 'Sabbir Hossain', note: 'Purchased for 1,350 AED', done: true },
      { step: 'Arrived at Hub', time: '02 May 2026', actor: 'Dubai Hub', note: 'Received at Hub', done: true },
      { step: 'Shipped to Bangladesh', time: '04 May 2026', actor: 'Air Emirates', note: 'Arrived Dhaka DAC', done: true },
      { step: 'Bangladesh Received', time: '06 May 2026', actor: 'Dhaka Main Hub', note: 'Cleared customs', done: true },
      { step: 'Ready for Delivery', time: '07 May 2026', actor: 'Steadfast Rider', note: 'Out for delivery', done: true },
      { step: 'Delivered', time: '08 May 2026, 03:40 PM', actor: 'Customer', note: 'Cash due ৳35,200 collected & delivered', done: true }
    ]
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    agentId: 'agent-1',
    agentName: 'Arafat Khan',
    country: 'India',
    currency: 'INR',
    symbol: '₹',
    category: 'Travel / Transport',
    amount: 1200,
    date: '2026-05-12',
    paymentMethod: 'Agent Cash/Card',
    status: 'Approved',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
    notes: 'Metro & auto fare to Nike Flagship Connaught Place'
  },
  {
    id: 'exp-2',
    agentId: 'agent-1',
    agentName: 'Arafat Khan',
    country: 'India',
    currency: 'INR',
    symbol: '₹',
    category: 'Packaging & Bubble Wrap',
    amount: 650,
    date: '2026-05-11',
    paymentMethod: 'Agent Cash',
    status: 'Approved',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
    notes: 'Export grade bubble wrap & sturdy cartons'
  },
  {
    id: 'exp-3',
    agentId: 'agent-2',
    agentName: 'Sabbir Hossain',
    country: 'Dubai',
    currency: 'AED',
    symbol: 'د.إ',
    category: 'Fuel / Petrol',
    amount: 150,
    date: '2026-05-10',
    paymentMethod: 'Fuel Card',
    status: 'Pending',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49016a3e5c?w=500&auto=format&fit=crop&q=80',
    notes: 'Enoc petrol station refill for delivery trips'
  }
];

export const INITIAL_BALANCE_TRANSFERS = [
  {
    id: 'TRF-2026-089',
    agentId: 'agent-1',
    agentName: 'Arafat Khan',
    country: 'India',
    amountBDT: 14285.71,
    conversionRate: 0.70,
    amountTarget: 10000.00,
    targetCurrency: 'INR',
    symbol: '₹',
    date: '12 May 2026, 10:20 AM',
    status: 'Pending', // Pending Acceptance by Agent
    adminNote: 'Top-up for Nike order batch #125'
  },
  {
    id: 'TRF-2026-092',
    agentId: 'agent-3',
    agentName: 'Mehedi Hasan',
    country: 'Thailand',
    amountBDT: 53900.00,
    conversionRate: 0.282,
    amountTarget: 15200.00,
    targetCurrency: 'THB',
    symbol: '฿',
    date: '12 May 2026, 09:40 AM',
    status: 'Pending',
    adminNote: 'Top-up for Siam Paragon cosmetics purchase'
  },
  {
    id: 'TRF-2026-085',
    agentId: 'agent-2',
    agentName: 'Sabbir Hossain',
    country: 'Dubai',
    amountBDT: 65000.00,
    conversionRate: 0.0308,
    amountTarget: 2000.00,
    targetCurrency: 'AED',
    symbol: 'د.إ',
    date: '10 May 2026, 02:15 PM',
    status: 'Accepted',
    adminNote: 'Electronics purchase fund'
  }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    senderRole: 'customer',
    senderName: 'Rahim Chowdhury',
    text: 'Hello, when will my Nike shoe order PO-2026-000125 be purchased?',
    time: '12 May 2026, 10:35 AM',
    isAgent: false
  },
  {
    id: 'msg-2',
    senderRole: 'admin',
    senderName: 'WrikMart Support',
    text: 'Hi Rahim! Our India agent Arafat is already at the official store and will update the invoice shortly.',
    time: '12 May 2026, 10:38 AM',
    isAgent: false
  },
  {
    id: 'msg-3',
    senderRole: 'agent',
    senderName: 'Arafat Khan (India Agent)',
    text: 'Product purchased! Size 42 Black/Red verified in brand new condition.',
    time: '12 May 2026, 05:12 PM',
    isAgent: true
  }
];

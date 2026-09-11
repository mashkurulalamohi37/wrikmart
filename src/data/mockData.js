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
    whatsapp: '+91 98765 43210',
    email: 'arafat.india@wrikmart.com',
    address: 'Lotus Heights, Saket, New Delhi 110017, India',
    referencePerson: {
      name: 'Mohit Agrawal',
      phone: '+91 98111 55667',
      address: 'B-14 Malviya Nagar, New Delhi'
    },
    govtDocument: {
      type: 'Aadhaar Card',
      number: '4892-3819-0192',
      documentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
      verified: true
    },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    balance: 0.00,
    totalSpent: 0.00,
    activeOrders: 0,
    completedOrders: 0,
    status: 'Active',
    pendingBalance: 0,
    pendingBalanceBDT: 0,
    pendingTransferId: null
  },
  {
    id: 'agent-2',
    name: 'Sabbir Hossain',
    country: 'Dubai',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'د.إ',
    phone: '+971 50 123 4567',
    whatsapp: '+971 50 123 4567',
    email: 'sabbir.dubai@wrikmart.com',
    address: 'Al Karama, Dubai, United Arab Emirates',
    referencePerson: {
      name: 'Kazi Farhan',
      phone: '+971 52 987 6543',
      address: 'Al Barsha 1, Dubai, UAE'
    },
    govtDocument: {
      type: 'Emirates ID',
      number: '784-1990-1234567-1',
      documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
      verified: true
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    balance: 0.00,
    totalSpent: 0.00,
    activeOrders: 0,
    completedOrders: 0,
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
    whatsapp: '+66 81 234 5678',
    email: 'mehedi.thai@wrikmart.com',
    address: 'Asoke, Sukhumvit, Bangkok 10110, Thailand',
    referencePerson: {
      name: 'Anan Chokchai',
      phone: '+66 89 555 4321',
      address: 'Sathorn Road, Yannawa, Bangkok'
    },
    govtDocument: {
      type: 'Passport / Work Permit',
      number: 'BD-A09823145',
      documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
      verified: true
    },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    balance: 0.00,
    totalSpent: 0.00,
    activeOrders: 0,
    completedOrders: 0,
    status: 'Active',
    pendingBalance: 0,
    pendingBalanceBDT: 0,
    pendingTransferId: null
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
    activePackages: 0
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
    activePackages: 0
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
    activePackages: 0
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
    activePackages: 0
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
    activePackages: 0
  }
];

export const INITIAL_STOCK_INVENTORY = [];

export const INITIAL_COUPONS = [
  {
    id: 'coup-1',
    code: 'WRIK10',
    title: '10% Launch Celebration Discount',
    description: 'Get 10% OFF on any Ready Stock order across all categories (Max discount ৳2,000)',
    discountType: 'percentage', // 'percentage' | 'fixed' | 'free_shipping'
    discountValue: 10,
    maxDiscountBDT: 2000,
    minOrderBDT: 1000,
    applicableCategory: 'All',
    status: 'Active',
    expiresAt: '2026-12-31',
    usedCount: 142
  },
  {
    id: 'coup-2',
    code: 'EID500',
    title: 'Flat ৳500 Special Saving',
    description: 'Enjoy a flat ৳500 instant deduction on orders above ৳3,000',
    discountType: 'fixed',
    discountValue: 500,
    maxDiscountBDT: 500,
    minOrderBDT: 3000,
    applicableCategory: 'All',
    status: 'Active',
    expiresAt: '2026-12-31',
    usedCount: 89
  },
  {
    id: 'coup-3',
    code: 'FREESHIP',
    title: 'Free Express Courier Delivery',
    description: '100% Free Shipping anywhere across Bangladesh (Dhaka & Nationwide)',
    discountType: 'free_shipping',
    discountValue: 0,
    maxDiscountBDT: 200,
    minOrderBDT: 1500,
    applicableCategory: 'All',
    status: 'Active',
    expiresAt: '2026-12-31',
    usedCount: 310
  },
  {
    id: 'coup-4',
    code: 'TECH1000',
    title: '৳1,000 Electronics Mega Voucher',
    description: 'Flat ৳1,000 OFF on high-end Electronics, Audio & Gadgets above ৳8,000',
    discountType: 'fixed',
    discountValue: 1000,
    maxDiscountBDT: 1000,
    minOrderBDT: 8000,
    applicableCategory: 'Electronics',
    status: 'Active',
    expiresAt: '2026-12-31',
    usedCount: 45
  },
  {
    id: 'coup-5',
    code: 'FASHION15',
    title: '15% Style & Sneaker Special',
    description: '15% OFF on Fashion, Footwear & Apparel (Max discount ৳1,500)',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscountBDT: 1500,
    minOrderBDT: 2500,
    applicableCategory: 'Fashion',
    status: 'Active',
    expiresAt: '2026-12-31',
    usedCount: 62
  }
];

export const INITIAL_ORDERS = [];

export const INITIAL_EXPENSES = [];

export const INITIAL_BALANCE_TRANSFERS = [];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-welcome-1',
    senderRole: 'admin',
    senderName: 'WrikMart Support Desk',
    text: 'Hello! Welcome to WrikMart 24/7 Global Support. How can we help you with your cross-border pre-order, overseas store sourcing, or delivery tracking today?',
    time: 'Live',
    isAgent: false
  }
];

export const INITIAL_HQ_EXPENSES = [];

export const DEFAULT_RECURRING_HQ_TEMPLATES = [
  {
    title: 'Banani Head Office Monthly Lease Rent',
    category: 'Rent & Facilities',
    department: 'Corporate Headquarters',
    payeeName: 'Ahmed Properties Holdings Ltd.',
    defaultAmount: 85000,
    paymentMethod: 'Bank Transfer (BRAC Bank)'
  },
  {
    title: 'Tejgaon Central Sorting Warehouse & Hub Lease',
    category: 'Rent & Facilities',
    department: 'Tejgaon Fulfillment Center',
    payeeName: 'Bengal Logistics Industrial Park',
    defaultAmount: 45000,
    paymentMethod: 'Bank Transfer (City Bank)'
  },
  {
    title: 'Core Management & Tech Team Salary Disbursement',
    category: 'Salaries & Payroll',
    department: 'Head Office Staff',
    payeeName: 'WrikMart Corporate Payroll Account (8 Employees)',
    defaultAmount: 145000,
    paymentMethod: 'Corporate Bank BEFTN'
  },
  {
    title: 'Customer Support & Dispatch Team Salaries',
    category: 'Salaries & Payroll',
    department: 'Customer Service & Dispatch',
    payeeName: 'Operations Support Staff (4 Employees)',
    defaultAmount: 58000,
    paymentMethod: 'Corporate Bank BEFTN'
  },
  {
    title: 'Commercial Electricity Bill - DESCO (Banani & Tejgaon)',
    category: 'Utilities & Internet',
    department: 'Facilities & Logistics',
    payeeName: 'Dhaka Electric Supply Company (DESCO)',
    defaultAmount: 19800,
    paymentMethod: 'bKash Merchant Pay'
  },
  {
    title: 'Optical Fiber Dedicated Leased Internet (100 Mbps)',
    category: 'Utilities & Internet',
    department: 'Head Office & Warehouse',
    payeeName: 'Dot Internet Technologies Ltd.',
    defaultAmount: 8500,
    paymentMethod: 'bKash Merchant Pay'
  },
  {
    title: 'Cloud Infrastructure & Server Database Hosting',
    category: 'Cloud & Software',
    department: 'Engineering',
    payeeName: 'Amazon Web Services (AWS)',
    defaultAmount: 14200,
    paymentMethod: 'Corporate Credit Card'
  },
  {
    title: 'Meta Ads (Facebook & Instagram) Sourcing Campaign',
    category: 'Marketing & Advertising',
    department: 'Marketing & Growth',
    payeeName: 'Meta Platforms Ireland Ltd.',
    defaultAmount: 65000,
    paymentMethod: 'Corporate Credit Card'
  },
  {
    title: 'Packaging & Bubble Wrap Monthly Restock Batch',
    category: 'Packaging & Supplies',
    department: 'Tejgaon Fulfillment Center',
    payeeName: 'Dhaka Packaging & Polymers Ltd.',
    defaultAmount: 32000,
    paymentMethod: 'Bank Transfer (BRAC Bank)'
  }
];

export const DEFAULT_BIRTHDAY_SETTINGS = {
  autoBirthdayDiscountEnabled: true,
  discountType: 'percentage', // 'percentage' | 'fixed'
  discountValue: 20, // 20% OFF or ৳500
  maxDiscountBDT: 1500,
  minOrderBDT: 500,
  validityDays: 7,
  wishTemplate: "Happy Birthday {name}! 🎂 Team WrikMart wishes you a joyful day! We've gifted you an exclusive {discount} birthday discount voucher: {code}. Shop authentic global products: https://wrikmart.com"
};

export const INITIAL_CUSTOMERS = [];

export const DEFAULT_SOURCING_STORES = [
  { id: 'store-1', name: 'Nike India', country: 'India', cat: 'Sneakers & Apparel', url: 'https://www.nike.com/in', brand: 'nike', isActive: true },
  { id: 'store-2', name: 'Apple Dubai', country: 'Dubai', cat: 'iPhone, AirPods, Mac', url: 'https://www.apple.com/ae', brand: 'apple', isActive: true },
  { id: 'store-3', name: 'Zara Global', country: 'India', cat: 'Designer Fashion', url: 'https://www.zara.com/in', brand: 'zara', isActive: true },
  { id: 'store-4', name: 'Amazon India', country: 'India', cat: 'Electronics & Books', url: 'https://www.amazon.in', brand: 'amazon', isActive: true },
  { id: 'store-5', name: 'Noon Dubai', country: 'Dubai', cat: 'Perfumes & Watches', url: 'https://www.noon.com/uae-en', brand: 'noon', isActive: true },
  { id: 'store-6', name: 'Shopee Thailand', country: 'Thailand', cat: 'Skincare & Cosmetics', url: 'https://shopee.co.th', brand: 'shopee', isActive: true },
  { id: 'store-7', name: 'Flipkart India', country: 'India', cat: 'Smartphones & Tech', url: 'https://www.flipkart.com', brand: 'flipkart', isActive: true },
  { id: 'store-8', name: 'Sephora Dubai', country: 'Dubai', cat: 'Luxury Cosmetics', url: 'https://www.sephora.ae', brand: 'sephora', isActive: true },
  { id: 'store-9', name: 'Amazon UAE', country: 'Dubai', cat: 'Dubai Lifestyle & Tech', url: 'https://www.amazon.ae', brand: 'amazon', isActive: true },
  { id: 'store-10', name: 'Central Thailand', country: 'Thailand', cat: 'Bangkok Mall Fashion', url: 'https://www.central.co.th', brand: 'central', isActive: true },
  { id: 'store-11', name: 'Myntra India', country: 'India', cat: 'Trending Western Fashion', url: 'https://www.myntra.com', brand: 'myntra', isActive: true },
  { id: 'store-12', name: 'Lazada Thailand', country: 'Thailand', cat: 'Thai Beauty & Tech', url: 'https://www.lazada.co.th', brand: 'lazada', isActive: true },
];

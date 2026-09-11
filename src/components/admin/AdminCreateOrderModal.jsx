import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Package, 
  Globe2, 
  Calendar,
  Layers,
  Sparkles,
  Search,
  ChevronDown,
  Check,
  Upload,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

const SearchableStockSelector = ({ inventory = [], onSelect, currentItemName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Filter inventory based on search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.toLowerCase().trim();
    return inventory.filter(inv => 
      (inv.name && inv.name.toLowerCase().includes(q)) ||
      (inv.sku && inv.sku.toLowerCase().includes(q)) ||
      (inv.brand && inv.brand.toLowerCase().includes(q)) ||
      (inv.category && inv.category.toLowerCase().includes(q))
    );
  }, [inventory, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedItem = inventory.find(inv => inv.name === currentItemName);

  return (
    <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
      <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Load from Stock:</span>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold text-navy-900 shadow-2xs transition-all max-w-[280px] sm:max-w-[340px]"
        title="Search and select from warehouse stock"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search className="w-3 h-3 text-brand-600 flex-shrink-0" />
          <span className="truncate">
            {selectedItem 
              ? `${selectedItem.name} (৳${selectedItem.sellingPrice?.toLocaleString()})`
              : '-- Search & Choose Stock Item --'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu with Search Input */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock by name, SKU, brand..."
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No stock product found matching "{searchQuery}"
              </div>
            ) : (
              filtered.map(inv => {
                const isSelected = inv.name === currentItemName;
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      onSelect(inv);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-2.5 hover:bg-brand-50/70 flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-brand-50 text-brand-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={inv.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt={inv.name}
                        className="w-9 h-9 object-cover rounded-lg border border-slate-200 bg-white flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-extrabold text-navy-900 text-[11px] block truncate">
                          {inv.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{inv.brand || 'Store Item'}</span>
                          {inv.sku && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{inv.sku}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className={inv.currentStock > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                            Stock: {inv.currentStock}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-brand-600 text-xs block">
                        ৳{inv.sellingPrice?.toLocaleString()}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase flex items-center justify-end gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Showing {filtered.length} of {inventory.length} warehouse items
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminCreateOrderModal = ({ onClose }) => {
  const { agents, inventory, createAdminOrder, showToast } = useApp();

  const [orderType, setOrderType] = useState('Pre-Order'); // 'Pre-Order' | 'Stock Product'
  const [country, setCountry] = useState('India');
  const [assignedAgentId, setAssignedAgentId] = useState('');

  // Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: 'Dhaka',
    note: ''
  });

  // Line Items
  const [items, setItems] = useState([
    {
      id: 'item-new-1',
      name: '',
      category: 'Electronics',
      brand: '',
      url: '',
      image: '',
      specs: { size: 'Standard', color: 'Default', unit: 1 },
      expectedPrice: ''
    }
  ]);

  // Payment Setup
  const [paymentStatus, setPaymentStatus] = useState('Advance Paid'); // 'Advance Paid' | 'Fully Paid' | 'Unpaid'
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [customAdvance, setCustomAdvance] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(200);
  const [purchaseDeadline, setPurchaseDeadline] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [adminNote, setAdminNote] = useState('');

  // Auto Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.expectedPrice || 0) * (it.specs?.unit || 1)), 0);
  const total = subtotal + Number(deliveryCharge || 0);
  const advanceRequired = paymentStatus === 'Fully Paid'
    ? total
    : (paymentStatus === 'Unpaid' ? 0 : (customAdvance ? Number(customAdvance) : Math.round(total * 0.25)));

  // Add Item Line
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-new-${Date.now()}`,
        name: '',
        category: 'Fashion',
        brand: '',
        url: '',
        image: '',
        specs: { size: 'Standard', color: 'Default', unit: 1 },
        expectedPrice: ''
      }
    ]);
  };

  // Quick Pick from Stock Inventory if Stock Product
  const handleSelectFromStock = (stockItem, itemIndex) => {
    setItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        name: stockItem.name,
        category: stockItem.category,
        brand: stockItem.brand,
        expectedPrice: stockItem.sellingPrice,
        costPrice: stockItem.costPrice,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
      };
      return updated;
    });
    showToast(`Loaded ${stockItem.name} into line item`, 'info');
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      if (field.startsWith('specs.')) {
        const specKey = field.split('.')[1];
        updated[index] = {
          ...updated[index],
          specs: { ...updated[index].specs, [specKey]: value }
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleItemImageUpload = (index, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be less than 8MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      handleItemChange(index, 'image', uploadEvt.target.result);
      showToast(`Uploaded image for Item #${index + 1}!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      showToast('Customer Name, Phone, and Address are required', 'warning');
      return;
    }

    const invalidItem = items.find(it => !it.name.trim() || !it.expectedPrice || Number(it.expectedPrice) <= 0);
    if (invalidItem) {
      showToast('Please enter a valid Product Name and Expected Price for all items', 'warning');
      return;
    }

    createAdminOrder({
      orderType,
      country: orderType === 'Stock Product' ? 'Bangladesh' : country,
      customerInfo,
      items,
      financials: {
        deliveryCharge: Number(deliveryCharge),
        advancePaid: advanceRequired
      },
      paymentMethod,
      paymentStatus,
      assignedAgentId: orderType === 'Stock Product' ? null : (assignedAgentId || null),
      purchaseDeadline,
      note: adminNote
    });

    onClose();
  };

  const filteredAgents = agents.filter(a => a.country.toLowerCase() === country.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full my-auto max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-in">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-navy-900">Create New Order (Admin Console)</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Generate pre-orders or local warehouse stock consignments</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close Create Order Modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6 text-xs">
          {/* Order Type & Country Tabs */}
          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="w-full sm:w-auto">
                <label className="block font-bold text-slate-700 mb-1">Order Classification *</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('Pre-Order')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      orderType === 'Pre-Order' 
                        ? 'bg-brand-500 text-white shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Pre-Order (Overseas Sourcing)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('Stock Product')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                      orderType === 'Stock Product' 
                        ? 'bg-navy-900 text-white shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Stock Product (Local Dhaka Warehouse)</span>
                  </button>
                </div>
              </div>

              {orderType === 'Pre-Order' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sourcing Destination *</label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setAssignedAgentId('');
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="Dubai">🇦🇪 Dubai (UAE)</option>
                    <option value="Thailand">🇹🇭 Thailand</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-brand-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" />
              <span>Customer & Delivery Details in Bangladesh</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzul Alam"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone / Mobile *</label>
                <input
                  type="text"
                  required
                  placeholder="+880 1712-345678"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District *</label>
                <select
                  value={customerInfo.district}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House, Road, Area, Thana/Post Code"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Product Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-brand-700 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                <span>Product Line Items ({items.length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-3 right-3 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center justify-between pr-8">
                  <span className="font-extrabold text-navy-900 text-xs">Item #{idx + 1}</span>
                  
                  {orderType === 'Stock Product' && inventory && inventory.length > 0 && (
                    <SearchableStockSelector
                      inventory={inventory}
                      currentItemName={item.name}
                      onSelect={(matched) => handleSelectFromStock(matched, idx)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nike Air Max 270 Black"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Watches">Watches</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Fragrance">Fragrance</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Size / Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. 42 / XL / 128GB"
                      value={item.specs?.size || ''}
                      onChange={(e) => handleItemChange(idx, 'specs.size', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Black / White"
                      value={item.specs?.color || ''}
                      onChange={(e) => handleItemChange(idx, 'specs.color', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.specs?.unit || 1}
                      onChange={(e) => handleItemChange(idx, 'specs.unit', Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Selling Price (BDT) *</label>
                    <input
                      type="number"
                      required
                      placeholder="৳ 0.00"
                      value={item.expectedPrice}
                      onChange={(e) => handleItemChange(idx, 'expectedPrice', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-600"
                    />
                  </div>
                </div>

                {orderType === 'Pre-Order' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Store URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://www.nike.com/in/... or official retailer link"
                      value={item.url || ''}
                      onChange={(e) => handleItemChange(idx, 'url', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                )}

                {/* Product Reference Image (File Picker & Drag/Drop or URL) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Reference Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                    {item.image ? (
                      <div className="flex items-center gap-3 w-full">
                        <img 
                          src={item.image} 
                          alt="Product Preview" 
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs flex-shrink-0 bg-slate-50"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-navy-900 block truncate">Reference Image Attached</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Ready for Overseas Sourcing</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <label className="cursor-pointer px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors">
                            Replace
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleItemImageUpload(idx, e.target.files?.[0])}
                            />
                          </label>
                          <button 
                            type="button" 
                            onClick={() => handleItemChange(idx, 'image', '')}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                        <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-slate-600 hover:text-brand-600 text-xs font-bold">
                          <Upload className="w-3.5 h-3.5 text-brand-600" />
                          <span>Upload Image / Drop photo here</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleItemImageUpload(idx, e.target.files?.[0])}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold text-center sm:text-left">OR</span>
                        <div className="relative flex-1">
                          <input 
                            type="url"
                            placeholder="Paste image URL..."
                            value={item.image || ''}
                            onChange={(e) => handleItemChange(idx, 'image', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financials & Payment Configuration */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Financials, Advance Collection & Assignment</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Charge (BDT)</label>
                <input
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Status *</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                >
                  <option value="Advance Paid">Advance Paid (25%)</option>
                  <option value="Fully Paid">Fully Paid (100%)</option>
                  <option value="Unpaid">Unpaid / Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                >
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad Direct</option>
                  <option value="Bank Transfer">Bank Wire / EFT</option>
                  <option value="Visa/Mastercard">Credit / Debit Card</option>
                  <option value="Cash">Cash at Dhaka Hub</option>
                </select>
              </div>
            </div>

            {orderType === 'Pre-Order' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Overseas Agent</label>
                  <select
                    value={assignedAgentId}
                    onChange={(e) => setAssignedAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="">Auto-Assign Best {country} Agent</option>
                    {filteredAgents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.flag} {a.country})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Deadline</label>
                  <input
                    type="date"
                    value={purchaseDeadline}
                    onChange={(e) => setPurchaseDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-4 font-bold text-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Order Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Delivery Fee</span>
                <span>৳{Number(deliveryCharge).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Selling Price</span>
                <span className="text-navy-900 text-sm">৳{total.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 uppercase block">Advance Collected</span>
                <span className="text-emerald-700 text-sm">৳{advanceRequired.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-600 uppercase block">Remaining Due</span>
                <span className="text-amber-700 text-sm">৳{Math.max(0, total - advanceRequired).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Admin Remarks & Internal Instructions */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Remarks & Internal Notes (Optional)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Visible to Admin HQ & Assigned Agent</span>
            </div>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Verify product batch & expiry, ensure authentic seal intact, package with double bubble-wrap, note customer preference..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-navy-900 focus:ring-2 focus:ring-brand-500 bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Generate Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

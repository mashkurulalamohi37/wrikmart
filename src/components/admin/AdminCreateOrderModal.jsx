import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

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
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold">Load from Stock:</span>
                      <select
                        onChange={(e) => {
                          const matched = inventory.find(i => i.id === e.target.value);
                          if (matched) handleSelectFromStock(matched, idx);
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 text-[10px] font-bold bg-white"
                      >
                        <option value="">-- Choose Stock Item --</option>
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>{inv.name} (৳{inv.sellingPrice})</option>
                        ))}
                      </select>
                    </div>
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

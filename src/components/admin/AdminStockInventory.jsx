import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  DollarSign, 
  Tag, 
  Boxes, 
  Building2, 
  RotateCcw, 
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

const CATEGORIES = [
  { id: 'Electronics', name: 'Electronics & Gadgets' },
  { id: 'Fashion', name: 'Fashion & Apparel' },
  { id: 'Perfumes', name: 'Perfumes & Fragrances' },
  { id: 'Beauty', name: 'Skincare & Beauty' },
  { id: 'Footwear', name: 'Footwear & Sneakers' },
  { id: 'Watches & Accessories', name: 'Luxury & Watches' },
  { id: 'General', name: 'General Commerce' }
];

const WAREHOUSES = [
  'Dhaka Main Hub (Tejgaon)',
  'Uttara Fulfillment Hub',
  'Dhanmondi Express Hub',
  'Chattogram Regional Hub'
];

export const AdminStockInventory = () => {
  const { 
    inventory = [], 
    addInventoryProduct, 
    updateInventoryProduct, 
    deleteInventoryProduct, 
    clearAllInventory, 
    restoreDemoInventory,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Electronics',
    sku: '',
    warehouse: 'Dhaka Main Hub (Tejgaon)',
    costPrice: '',
    sellingPrice: '',
    originalMrp: '',
    currentStock: '',
    reorderLevel: '5',
    image: '',
    description: '',
    badge: 'New Arrival',
    specs: [
      { key: 'Color', value: 'Black' },
      { key: 'Warranty', value: '1 Year Official' }
    ]
  });

  const [imagePreview, setImagePreview] = useState('');

  // Open modal for new product
  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: 'Electronics',
      sku: `WM-ELEC-${Math.floor(1000 + Math.random() * 9000)}`,
      warehouse: 'Dhaka Main Hub (Tejgaon)',
      costPrice: '',
      sellingPrice: '',
      originalMrp: '',
      currentStock: '10',
      reorderLevel: '5',
      image: '',
      description: '',
      badge: 'New Arrival',
      specs: [
        { key: 'Color', value: '' },
        { key: 'Warranty', value: '1 Year Official' }
      ]
    });
    setImagePreview('');
    setIsModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    const specEntries = product.specs 
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
      : [{ key: 'Color', value: '' }];

    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || 'Electronics',
      sku: product.sku || '',
      warehouse: product.warehouse || 'Dhaka Main Hub (Tejgaon)',
      costPrice: product.costPrice || '',
      sellingPrice: product.sellingPrice || '',
      originalMrp: product.originalMrp || '',
      currentStock: product.currentStock || 0,
      reorderLevel: product.reorderLevel || 5,
      image: product.image || '',
      description: product.description || '',
      badge: product.badge || 'New Arrival',
      specs: specEntries.length > 0 ? specEntries : [{ key: 'Color', value: '' }]
    });
    setImagePreview(product.image || '');
    setIsModalOpen(true);
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result;
      if (base64) {
        setFormData(prev => ({ ...prev, image: base64 }));
        setImagePreview(base64);
        showToast('Image uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Add / remove specification rows
  const handleAddSpecRow = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { key: '', value: '' }]
    }));
  };

  const handleRemoveSpecRow = (index) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, idx) => idx !== index)
    }));
  };

  const handleSpecChange = (index, field, val) => {
    setFormData(prev => {
      const nextSpecs = [...prev.specs];
      nextSpecs[index][field] = val;
      return { ...prev, specs: nextSpecs };
    });
  };

  // Submit product form
  const handleSubmitProduct = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Product title is required', 'warning');
      return;
    }

    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      showToast('Please enter a valid positive selling price', 'warning');
      return;
    }

    // Convert specs array to object
    const specsObj = {};
    formData.specs.forEach(s => {
      if (s.key.trim()) {
        specsObj[s.key.trim()] = s.value.trim() || 'Standard';
      }
    });

    const productPayload = {
      name: formData.name.trim(),
      brand: formData.brand.trim() || 'Original Brand',
      category: formData.category,
      sku: formData.sku.trim() || `WM-${formData.category.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      warehouse: formData.warehouse,
      costPrice: Number(formData.costPrice || formData.sellingPrice * 0.75),
      sellingPrice: Number(formData.sellingPrice),
      originalMrp: formData.originalMrp ? Number(formData.originalMrp) : null,
      currentStock: Number(formData.currentStock || 0),
      reorderLevel: Number(formData.reorderLevel || 5),
      image: formData.image.trim() || FALLBACK_PRODUCT_IMAGE,
      description: formData.description.trim() || 'High quality authentic import stock with official warranty.',
      badge: formData.badge || null,
      specs: specsObj
    };

    if (editingProduct) {
      updateInventoryProduct(editingProduct.id, productPayload);
    } else {
      addInventoryProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  // Quick Stock Step (+1 / -1)
  const handleStockDelta = (productId, delta) => {
    const prod = inventory.find(p => p.id === productId);
    if (!prod) return;
    const newQty = Math.max(0, (prod.currentStock || 0) + delta);
    updateInventoryProduct(productId, { currentStock: newQty });
  };

  // Metrics
  const totalProducts = inventory.length;
  const totalUnits = inventory.reduce((sum, item) => sum + (item.currentStock || 0), 0);
  const totalValuation = inventory.reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.currentStock || 0)), 0);
  const totalCost = inventory.reduce((sum, item) => sum + ((item.costPrice || item.sellingPrice * 0.75) * (item.currentStock || 0)), 0);
  const outOfStockCount = inventory.filter(item => (item.currentStock || 0) <= 0).length;
  const lowStockCount = inventory.filter(item => (item.currentStock || 0) > 0 && (item.currentStock || 0) <= (item.reorderLevel || 5)).length;

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return inventory.filter(item => {
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (stockFilter === 'in_stock' && (item.currentStock || 0) <= 0) return false;
      if (stockFilter === 'low_stock' && ((item.currentStock || 0) <= 0 || (item.currentStock || 0) > (item.reorderLevel || 5))) return false;
      if (stockFilter === 'out_of_stock' && (item.currentStock || 0) > 0) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchSku = item.sku?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSku) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      if (sortBy === 'price_asc') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      if (sortBy === 'stock_asc') return (a.currentStock || 0) - (b.currentStock || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  }, [inventory, selectedCategory, stockFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Main Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Warehouse Catalog
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Real-Time Stock Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900">Ready Stock & Inventory Management</h2>
          <p className="text-xs text-slate-500">
            Upload new products, manage warehouse inventory quantities, adjust prices, and monitor stock velocity
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {inventory.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all shadow-xs"
              title="Wipe mock inventory"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Products</span>
            </button>
          )}



          <button
            onClick={handleOpenNewModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload New Product</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider">Catalog SKUs</span>
            <Boxes className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-navy-900">{totalProducts}</span>
            <span className="text-xs text-slate-500 font-medium">products listed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Shelf Units</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalUnits.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium">units in stock</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider">Stock Valuation</span>
            <DollarSign className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-navy-900">৳{totalValuation.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Est. Cost: ৳{totalCost.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider">Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${outOfStockCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${outOfStockCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {outOfStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">out of stock • {lowStockCount} low</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbars */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, brand, SKU..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="stock_asc">Stock: Lowest First</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* 4. Products Table / List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-black text-lg text-navy-900">
              {inventory.length === 0 ? 'No Stock Products in Inventory' : 'No Matching Products Found'}
            </h3>
            <p className="text-xs text-slate-500">
              {inventory.length === 0 
                ? 'Your inventory is currently empty and clean! Click below to upload your real stock products, set prices, and attach photos.'
                : 'Try adjusting your search keywords or clearing filters to see available inventory items.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenNewModal}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Upload Product Now</span>
            </button>


          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category & SKU</th>
                  <th className="p-4">Warehouse</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">Cost Price</th>
                  <th className="p-4 text-center">Available Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map(product => {
                  const marginPercent = product.costPrice && product.sellingPrice 
                    ? Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100) 
                    : 25;

                  const isLowStock = (product.currentStock || 0) > 0 && (product.currentStock || 0) <= (product.reorderLevel || 5);
                  const isOut = (product.currentStock || 0) <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 block truncate">
                              {product.brand}
                            </span>
                            <h4 className="font-bold text-navy-900 text-xs truncate" title={product.name}>
                              {product.name}
                            </h4>
                            {product.badge && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{product.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{product.sku}</span>
                      </td>

                      {/* Warehouse */}
                      <td className="p-4 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{product.warehouse || 'Dhaka Main Hub'}</span>
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="p-4 font-bold text-navy-900">
                        ৳{product.sellingPrice?.toLocaleString()}
                        {product.originalMrp && product.originalMrp > product.sellingPrice && (
                          <span className="block text-[10px] text-slate-400 line-through font-normal">
                            ৳{product.originalMrp.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Cost Price & Margin */}
                      <td className="p-4">
                        <span className="text-slate-600 font-medium">৳{(product.costPrice || 0).toLocaleString()}</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">
                          +{marginPercent}% margin
                        </span>
                      </td>

                      {/* Available Stock & Inline Adjuster */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => handleStockDelta(product.id, -1)}
                            disabled={(product.currentStock || 0) <= 0}
                            className="p-1 rounded text-slate-500 hover:bg-white disabled:opacity-30 transition-colors"
                            title="Decrease stock by 1"
                            aria-label={`Decrease stock for ${product.name}`}
                          >
                            -
                          </button>
                          <span className="px-2 font-black text-navy-900 min-w-[28px] text-center text-xs">
                            {product.currentStock || 0}
                          </span>
                          <button
                            onClick={() => handleStockDelta(product.id, 1)}
                            className="p-1 rounded text-slate-500 hover:bg-white transition-colors"
                            title="Increase stock by 1"
                            aria-label={`Increase stock for ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock ({product.currentStock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock ({product.currentStock})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                deleteInventoryProduct(product.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT PRODUCT MODAL (via createPortal) */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-navy-900">
                    {editingProduct ? 'Edit Stock Product' : 'Upload New Stock Product'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill in the details below to list items in the 24h Ready Stock catalog
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProduct} className="space-y-5 text-xs">
              
              {/* Product Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apple AirPods Pro (2nd Gen, USB-C)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple, Nike, Casio, Zara"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">SKU Code (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. WM-ELEC-APL-01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse Storage Location</label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium cursor-pointer"
                  >
                    {WAREHOUSES.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Quantities */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600 block">
                  Pricing & Inventory Control
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Selling Price (৳) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      placeholder="e.g. 28900"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 font-bold text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Compare MRP (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalMrp}
                      onChange={(e) => setFormData({ ...formData, originalMrp: e.target.value })}
                      placeholder="e.g. 32500"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cost Price (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="e.g. 24500"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      placeholder="e.g. 15"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload: Dual Mode (URL or Local File) */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Product Image *</label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="url"
                      value={formData.image.startsWith('data:') ? 'Image uploaded from device (Base64)' : formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Paste image web URL (https://...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-3 py-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 hover:bg-brand-50 text-brand-700 font-bold cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload photo from your computer/device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative shadow-xs">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, warranty notes, authenticity details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Dynamic Specifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold">Specifications / Attributes</label>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Attribute</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        placeholder="Feature (e.g. Color, Size)"
                        className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-brand-500"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder="Value (e.g. Black, 42, 1 Year)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-brand-500"
                      />
                      {formData.specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  {editingProduct ? 'Save Changes' : 'Upload Product'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Clearing All Inventory */}
      {showClearConfirm && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy-900 text-base">Clear Entire Stock Inventory?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will delete all {inventory.length} products from the inventory so you can upload fresh, real stock data. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllInventory();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

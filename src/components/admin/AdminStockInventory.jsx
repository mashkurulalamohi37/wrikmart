import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ArrowUpDown,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Eye,
  FileText,
  FolderPlus,
  ShieldCheck,
  Check,
  ChevronDown,
  Percent,
  Settings,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { FormattedDescription } from '../common/FormattedDescription';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

const DEFAULT_CATEGORIES = [
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

export const DEFECT_PRESETS = [
  { 
    id: 'air_cargo',
    name: 'Air Cargo Box Crease', 
    text: 'Outer cardboard box slightly creased during international air cargo transit. Product is 100% brand new, untouched with original tags and warranty.' 
  },
  { 
    id: 'packaging_dented',
    name: 'Packaging Dented / Squeezed', 
    text: 'Cardboard packaging was squished during transit. Factory seal intact, inner device and all accessories 100% mint and untouched with official warranty.' 
  },
  { 
    id: 'open_box',
    name: 'Open Box / QA Inspected', 
    text: 'Packaging was opened at customs or warehouse QA for physical verification. Product is 100% unused and authentic with complete original accessories.' 
  },
  { 
    id: 'cosmetic_scratch',
    name: 'Minor Cosmetic Scratch', 
    text: 'Tiny superficial cosmetic hairline mark on outer casing from handling. Hardware, performance, and screen 100% brand new and tested.' 
  },
  { 
    id: 'customer_return',
    name: 'Customer Return (Untouched)', 
    text: 'Customer returned sealed/untouched due to ordering wrong size or model. Full inspection performed, 100% brand new condition with all tags.' 
  },
  { 
    id: 'store_display',
    name: 'Store Display / Demo Unit', 
    text: 'Former overseas official showroom display demo piece. Handled in glass casing, 100% mint condition with full packaging and accessories.' 
  }
];

export const AdminStockInventory = ({ initialTab = 'all' }) => {
  const { 
    inventory = [], 
    addInventoryProduct, 
    updateInventoryProduct, 
    deleteInventoryProduct, 
    clearAllInventory, 
    restoreDemoInventory,
    convertProductToClearance,
    revertProductFromClearance,
    updateClearancePrice,
    clearanceSettings,
    updateClearanceSettings,
    resetClearanceSettings,
    showToast 
  } = useApp();

  const [activeViewTab, setActiveViewTab] = useState(() => {
    return initialTab === 'clearance' ? 'clearance' : 'all';
  });

  useEffect(() => {
    if (initialTab) {
      setActiveViewTab(initialTab === 'clearance' ? 'clearance' : 'all');
    }
  }, [initialTab]);

  // Clearance specific KPI metrics
  const clearanceProducts = useMemo(() => {
    return (inventory || []).filter(item => Boolean(item && item.isDefect));
  }, [inventory]);

  const clearanceProductsCount = clearanceProducts.length;
  const clearanceUnits = clearanceProducts.reduce((acc, curr) => acc + (Number(curr.currentStock) || 0), 0);
  const clearanceValuation = clearanceProducts.reduce((acc, curr) => acc + ((Number(curr.sellingPrice) || Number(curr.price) || 0) * (Number(curr.currentStock) || 0)), 0);
  const avgClearanceDiscount = useMemo(() => {
    if (clearanceProducts.length === 0) return 0;
    const totalDisc = clearanceProducts.reduce((acc, curr) => {
      const original = Number(curr.originalMrp) || Number(curr.sellingPrice) || 0;
      const current = Number(curr.sellingPrice) || Number(curr.price) || 0;
      if (original > current && original > 0) {
        return acc + Math.round(((original - current) / original) * 100);
      }
      return acc;
    }, 0);
    return Math.round(totalDisc / clearanceProducts.length);
  }, [clearanceProducts]);

  // Convert to Clearance Modal State
  const [convertToClearanceItem, setConvertToClearanceItem] = useState(null);
  const [convertForm, setConvertForm] = useState({
    defectType: 'Air Cargo Box Crease',
    defectNote: '',
    clearancePrice: ''
  });

  const handleOpenConvertModal = (product) => {
    const regularPrice = product.sellingPrice || product.price || 0;
    const defaultClearance = Math.round(regularPrice * 0.7);
    setConvertToClearanceItem(product);
    setConvertForm({
      defectType: 'Air Cargo Box Crease',
      defectNote: DEFECT_PRESETS[0].text,
      clearancePrice: String(defaultClearance)
    });
  };

  const handleConfirmConvert = (e) => {
    e.preventDefault();
    if (!convertToClearanceItem) return;
    if (!convertForm.defectNote.trim()) {
      showToast('Please enter a condition description', 'warning');
      return;
    }
    if (!convertForm.clearancePrice || Number(convertForm.clearancePrice) <= 0) {
      showToast('Please enter a valid clearance price', 'warning');
      return;
    }
    convertProductToClearance(convertToClearanceItem.id, {
      defectNote: convertForm.defectNote.trim(),
      clearancePrice: Number(convertForm.clearancePrice),
      defectType: convertForm.defectType
    });
    setConvertToClearanceItem(null);
  };

  // Quick Inline Price Adjust Modal State
  const [quickPriceItem, setQuickPriceItem] = useState(null);
  const [quickPriceValue, setQuickPriceValue] = useState('');

  const handleSaveQuickPrice = (e) => {
    e.preventDefault();
    if (!quickPriceItem) return;
    const num = Number(quickPriceValue);
    if (!num || num <= 0) {
      showToast('Please enter a valid price', 'warning');
      return;
    }
    updateClearancePrice(quickPriceItem.id, num);
    setQuickPriceItem(null);
  };

  // Storefront Clearance Settings State
  const [settingsForm, setSettingsForm] = useState(() => ({
    enabled: clearanceSettings?.enabled ?? true,
    badgeText: clearanceSettings?.badgeText || '70% OFF',
    bannerTitle: clearanceSettings?.bannerTitle || 'Defect & Clearance Deals (Open-Box / B-Stock)',
    bannerSubtitle: clearanceSettings?.bannerSubtitle || '100% authentic genuine items with slight packaging damage or cosmetic box creases incurred during international air cargo transit. Every piece is strictly inspected, tested, and backed by our full warranty at exceptional discount prices!',
    guaranteeBadge: clearanceSettings?.guaranteeBadge || '🛡️ 100% Authentic Guarantee'
  }));

  useEffect(() => {
    if (clearanceSettings) {
      setSettingsForm({
        enabled: clearanceSettings.enabled ?? true,
        badgeText: clearanceSettings.badgeText || '70% OFF',
        bannerTitle: clearanceSettings.bannerTitle || 'Defect & Clearance Deals (Open-Box / B-Stock)',
        bannerSubtitle: clearanceSettings.bannerSubtitle || '100% authentic genuine items with slight packaging damage or cosmetic box creases incurred during international air cargo transit. Every piece is strictly inspected, tested, and backed by our full warranty at exceptional discount prices!',
        guaranteeBadge: clearanceSettings.guaranteeBadge || '🛡️ 100% Authentic Guarantee'
      });
    }
  }, [clearanceSettings]);

  const handleSaveClearanceSettings = (e) => {
    e.preventDefault();
    updateClearanceSettings(settingsForm);
  };

  // Dynamic Categories stored in localStorage
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('wrikmart_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('wrikmart_custom_categories', JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  // Add Category modal/inline state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleCreateNewCategory = (e) => {
    e?.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      showToast('Please enter a category name', 'warning');
      return;
    }
    const existing = categories.find(c => c.name.toLowerCase() === cleanName.toLowerCase() || c.id.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      setFormData(prev => ({ ...prev, category: existing.id }));
      setShowAddCatModal(false);
      setNewCatName('');
      showToast(`Selected existing category "${existing.name}"`, 'info');
      return;
    }
    const newCat = { id: cleanName, name: cleanName };
    setCategories(prev => [...prev, newCat]);
    setFormData(prev => ({ ...prev, category: newCat.id }));
    setShowAddCatModal(false);
    setNewCatName('');
    showToast(`New category "${cleanName}" created and selected!`, 'success');
  };

  // Brand Suggestions from Inventory + popular brands
  const existingBrands = useMemo(() => {
    const fromInv = inventory.map(i => i.brand).filter(Boolean);
    const defaults = ['Apple', 'Nike', 'Zara', 'Casio', 'Samsung', 'Sony', 'Dyson', 'Sephora', 'The Body Shop', 'L\'Oreal', 'Adidas', 'Gucci'];
    return Array.from(new Set([...fromInv, ...defaults]));
  }, [inventory]);

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
    isDefect: false,
    defectNote: '',
    clearancePrice: '',
    specs: [
      { key: 'Color', value: 'Black' },
      { key: 'Warranty', value: '1 Year Official' }
    ]
  });

  const [imagePreview, setImagePreview] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [descTab, setDescTab] = useState('editor'); // 'editor' | 'preview'
  const descTextareaRef = useRef(null);

  // Rich text insertion helper
  const insertFormatting = (type) => {
    const textarea = descTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = formData.description || '';
    const selected = current.substring(start, end);
    let replacement = '';

    if (type === 'bold') {
      replacement = selected ? `**${selected}**` : '**Bold Feature Title**';
    } else if (type === 'italic') {
      replacement = selected ? `*${selected}*` : '*Italic Note*';
    } else if (type === 'h3') {
      replacement = selected ? `\n### ${selected}\n` : '\n### Key Highlights\n';
    } else if (type === 'bullet') {
      replacement = selected 
        ? '\n' + selected.split('\n').map(l => l.startsWith('• ') ? l : `• ${l}`).join('\n') + '\n'
        : '\n• 100% Authentic imported stock\n• Official international packaging & serial code\n• Premium build quality';
    } else if (type === 'number') {
      replacement = selected
        ? '\n' + selected.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n') + '\n'
        : '\n1. Original sealed box\n2. Sourced directly from authorized brand retailer\n3. Doorstep delivery with tracking';
    } else if (type === 'authentic') {
      replacement = '\n⭐ **100% Authentic Guarantee**: Purchased from official brand store in original box.\n';
    } else if (type === 'warranty') {
      replacement = '\n🛡️ **Official Warranty Included**: 1-Year manufacturer replacement coverage.\n';
    }

    const updated = current.substring(0, start) + replacement + current.substring(end);
    setFormData(prev => ({ ...prev, description: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // Open modal for new product
  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setDescTab('editor');
    setShowUrlInput(false);
    setFormData({
      name: '',
      brand: '',
      category: categories[0]?.id || 'Electronics',
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
      isDefect: false,
      defectNote: '',
      clearancePrice: '',
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
    setDescTab('editor');
    setShowUrlInput(Boolean(product.image && !product.image.startsWith('data:')));
    const specEntries = product.specs 
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
      : [{ key: 'Color', value: '' }];

    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || categories[0]?.id || 'Electronics',
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
      isDefect: Boolean(product.isDefect),
      defectNote: product.defectNote || '',
      clearancePrice: product.clearancePrice || (product.isDefect ? product.sellingPrice : ''),
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
      sellingPrice: formData.isDefect && formData.clearancePrice ? Number(formData.clearancePrice) : Number(formData.sellingPrice),
      originalMrp: formData.isDefect && formData.clearancePrice
        ? Number(formData.originalMrp || formData.sellingPrice)
        : (formData.originalMrp ? Number(formData.originalMrp) : null),
      currentStock: Number(formData.currentStock || 0),
      reorderLevel: Number(formData.reorderLevel || 5),
      image: formData.image.trim() || FALLBACK_PRODUCT_IMAGE,
      description: formData.description.trim() || 'High quality authentic import stock with official warranty.',
      badge: formData.isDefect ? (formData.badge || 'Clearance Deal') : (formData.badge || null),
      isDefect: Boolean(formData.isDefect),
      defectNote: formData.isDefect ? formData.defectNote.trim() : '',
      clearancePrice: formData.isDefect && formData.clearancePrice ? Number(formData.clearancePrice) : null,
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
      if (stockFilter === 'defect_clearance' && !item.isDefect) return false;
      if (stockFilter === 'regular_stock' && item.isDefect) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchSku = item.sku?.toLowerCase().includes(q);
        const matchNote = item.defectNote?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSku && !matchNote) return false;
      }

      if (activeViewTab === 'clearance' && !item.isDefect) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      if (sortBy === 'price_asc') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      if (sortBy === 'stock_asc') return (a.currentStock || 0) - (b.currentStock || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  }, [inventory, selectedCategory, stockFilter, searchQuery, sortBy, activeViewTab]);

  const handleOpenNewClearanceModal = () => {
    handleOpenNewModal();
    setFormData(prev => ({
      ...prev,
      isDefect: true,
      badge: 'Clearance Deal',
      defectNote: DEFECT_PRESETS[0].text,
      clearancePrice: ''
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Main Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${
              activeViewTab === 'clearance' 
                ? 'text-rose-700 bg-rose-50 border-rose-200' 
                : 'text-brand-600 bg-brand-50 border-brand-200'
            }`}>
              {activeViewTab === 'clearance' ? '🏷️ Clearance & Defect Hub' : activeViewTab === 'settings' ? '⚙️ Clearance CMS' : 'Warehouse Catalog'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Real-Time Stock Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900">
            {activeViewTab === 'clearance' 
              ? 'Defect & Clearance Deals Management' 
              : activeViewTab === 'settings'
                ? 'Storefront Defect & Clearance Settings'
                : 'Ready Stock & Inventory Management'}
          </h2>
          <p className="text-xs text-slate-500">
            {activeViewTab === 'clearance'
              ? 'Control discounted B-stock products, transparent condition notes, clearance pricing, and customer trust badges.'
              : activeViewTab === 'settings'
                ? 'Manage public visibility, storefront announcement banners, trust guarantees, and sale tags.'
                : 'Upload new products, manage warehouse inventory quantities, adjust prices, and monitor stock velocity.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {activeViewTab === 'clearance' ? (
            <>
              <button
                onClick={() => updateClearanceSettings({ enabled: !clearanceSettings?.enabled })}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border shadow-xs ${
                  clearanceSettings?.enabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Storefront Clearance Section"
              >
                <span className={`w-2 h-2 rounded-full ${clearanceSettings?.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>Storefront Sale: {clearanceSettings?.enabled ? 'ACTIVE (Live)' : 'PAUSED (Hidden)'}</span>
              </button>

              <button
                onClick={handleOpenNewClearanceModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Upload Defect / Clearance Item</span>
              </button>
            </>
          ) : activeViewTab === 'all' ? (
            <>
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
            </>
          ) : null}
        </div>
      </div>

      {/* 2. Top View Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveViewTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeViewTab === 'all'
              ? 'bg-white text-navy-950 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-navy-950 hover:bg-white/60'
          }`}
        >
          <Boxes className="w-4 h-4 text-brand-600" />
          <span>All Stock Products</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeViewTab === 'all' ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-700'
          }`}>
            {totalProducts}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('clearance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeViewTab === 'clearance'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
              : 'text-slate-600 hover:text-rose-700 hover:bg-white/60'
          }`}
        >
          <Tag className={`w-4 h-4 ${activeViewTab === 'clearance' ? 'text-amber-300' : 'text-rose-500'}`} />
          <span>Defect & Clearance Deals Hub</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeViewTab === 'clearance' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {clearanceProductsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeViewTab === 'settings'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-white/60'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeViewTab === 'settings' ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span>Storefront Clearance Settings</span>
          <span className={`w-2 h-2 rounded-full ${clearanceSettings?.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
        </button>
      </div>

      {/* 3. Dynamic KPI Metrics Bar */}
      {activeViewTab === 'clearance' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-soft">
            <div className="flex items-center justify-between text-rose-400 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">Clearance Deals</span>
              <Tag className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700">{clearanceProductsCount}</span>
              <span className="text-xs text-slate-500 font-medium">B-Stock SKUs</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Total Defect Units</span>
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{clearanceUnits.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">units ready to ship</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Clearance Value</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-navy-900">৳{clearanceValuation.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Discounted Selling Asset</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-soft">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Avg Discount %</span>
              <Percent className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">
                {avgClearanceDiscount}%
              </span>
              <span className="text-xs text-slate-500 font-medium">customer savings</span>
            </div>
          </div>
        </div>
      ) : activeViewTab === 'all' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
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
      ) : null}

      {/* 4. MAIN VIEW CONTENT: Settings View OR Table View */}
      {activeViewTab === 'settings' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-navy-950">Storefront Defect & Clearance Settings</h3>
                <p className="text-xs text-slate-500">Configure global visibility, customer promotional banners, and trust guarantees.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetClearanceSettings}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Reset Defaults
            </button>
          </div>

          <form onSubmit={handleSaveClearanceSettings} className="space-y-6">
            {/* Master Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-navy-900 text-sm">Enable Customer Clearance Section & Tabs</span>
                  {settingsForm.enabled ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">Active on Storefront</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px]">Hidden / Disabled</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  When toggled off, the Defect / Clearance tab in customer navigation and category pills are completely hidden from shoppers.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settingsForm.enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Navigation Badge Text
                </label>
                <input
                  type="text"
                  value={settingsForm.badgeText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, badgeText: e.target.value })}
                  placeholder="e.g. 70% OFF or CLEARANCE"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Displayed on desktop and mobile navigation tabs as a promotional badge.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Trust / Guarantee Badge Text
                </label>
                <input
                  type="text"
                  value={settingsForm.guaranteeBadge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, guaranteeBadge: e.target.value })}
                  placeholder="e.g. 🛡️ 100% Authentic Guarantee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Reassures shoppers that clearance items are authentic and QA inspected.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">
                Clearance Showcase Banner Headline
              </label>
              <input
                type="text"
                value={settingsForm.bannerTitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, bannerTitle: e.target.value })}
                placeholder="e.g. Defect & Clearance Deals (Open-Box / B-Stock)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">
                Clearance Showcase Description / QA Explanation
              </label>
              <textarea
                rows="3"
                value={settingsForm.bannerSubtitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, bannerSubtitle: e.target.value })}
                placeholder="Explain the sourcing, condition, inspection, and return guarantee..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs leading-relaxed"
              />
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Live Storefront Showcase Banner Preview:
              </span>
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border-2 border-rose-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-rose-500/30">
                    🏷️
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-navy-950">
                        {settingsForm.bannerTitle}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase tracking-wide">
                        {settingsForm.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {settingsForm.bannerSubtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-rose-200 shadow-2xs shrink-0">
                  <span>{settingsForm.guaranteeBadge}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 cursor-pointer"
              >
                Save Storefront Clearance Settings
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Search & Filter Toolbars */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeViewTab === 'clearance' ? "Search clearance by name, defect note..." : "Search by product name, brand, SKU..."}
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
                <option value="all">All Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Stock Status Filter (only relevant when on All Products view) */}
              {activeViewTab === 'all' && (
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="all">All Inventory Items</option>
                  <option value="regular_stock">Regular Stock (Brand New)</option>
                  <option value="defect_clearance">⚠️ Defect & Clearance Deals</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low_stock">Low Stock (≤ 5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              )}

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

          {/* Products Table / List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-soft space-y-4">
              <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-inner ${
                activeViewTab === 'clearance' ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'
              }`}>
                {activeViewTab === 'clearance' ? <Tag className="w-8 h-8" /> : <Package className="w-8 h-8" />}
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-black text-lg text-navy-900">
                  {activeViewTab === 'clearance' ? 'No Defect / Clearance Products Listed' : 'No Matching Products Found'}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeViewTab === 'clearance'
                    ? 'There are currently no items marked as defect or clearance. Click below to add a clearance product, or move standard items to clearance from the "All Stock Products" tab.'
                    : 'Try adjusting your search keywords or clearing filters to see available inventory items.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {activeViewTab === 'clearance' ? (
                  <button
                    onClick={handleOpenNewClearanceModal}
                    className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Upload Clearance Product Now</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenNewModal}
                    className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Upload Product Now</span>
                  </button>
                )}
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
                                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                  {product.isDefect && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                                      <span>Clearance / Defect</span>
                                    </span>
                                  )}
                                  {product.badge && !product.isDefect && (
                                    <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                      {product.badge}
                                    </span>
                                  )}
                                  {product.isDefect && product.defectNote && (
                                    <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-[220px]" title={product.defectNote}>
                                      ⚠️ {product.defectNote}
                                    </span>
                                  )}
                                </div>
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
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className={product.isDefect ? 'text-rose-700 font-black' : 'text-navy-900'}>
                                ৳{product.sellingPrice?.toLocaleString()}
                              </span>
                              {product.originalMrp && product.originalMrp > product.sellingPrice && (
                                <span className="text-[10px] text-slate-400 line-through font-normal">
                                  ৳{product.originalMrp.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.originalMrp && product.originalMrp > product.sellingPrice && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 mt-0.5">
                                {Math.round(((product.originalMrp - product.sellingPrice) / product.originalMrp) * 100)}% OFF
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
                              {product.isDefect ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickPriceItem(product);
                                      setQuickPriceValue(String(product.sellingPrice || product.price || ''));
                                    }}
                                    className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Quick adjust clearance price"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Revert "${product.name}" back to standard inventory stock?`)) {
                                        revertProductFromClearance(product.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Revert to regular stock"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenConvertModal(product)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Move to Defect / Clearance Sale"
                                >
                                  <Tag className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(product)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
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
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        </>
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium text-slate-800"
                  />
                </div>

                {/* Brand Name with Suggestions & Custom Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">Brand Name *</label>
                    <span className="text-[10px] text-slate-400">Type or select from list</span>
                  </div>
                  <input
                    type="text"
                    required
                    list="admin-brand-suggestions"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple, Nike, Zara, Casio, Sephora"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium text-slate-800"
                  />
                  <datalist id="admin-brand-suggestions">
                    {existingBrands.map((b, idx) => (
                      <option key={idx} value={b} />
                    ))}
                  </datalist>
                  {/* Quick popular brand chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className="text-[10px] font-semibold text-slate-400">Quick:</span>
                    {['Apple', 'Nike', 'Zara', 'Casio', 'Dyson', 'Sephora'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, brand: b })}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                          formData.brand === b 
                            ? 'bg-brand-600 text-white border-brand-600 font-bold' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Category with "+ Add New Category" */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">Product Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCatModal(true)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add New Category</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__add_new__') {
                          setShowAddCatModal(true);
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium cursor-pointer text-slate-800"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="__add_new__" className="text-brand-600 font-bold">+ Add New Category...</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">SKU Code (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. WM-ELEC-APL-01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Warehouse Storage Location</label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium cursor-pointer text-slate-800"
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

              {/* Defect / Clearance Item Toggle & Condition Note */}
              <div className="p-4 rounded-2xl border transition-all bg-amber-50/50 border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Defect / Clearance / B-Stock Product</span>
                      <span className="text-[11px] text-slate-500">Mark item as clearance (e.g., damaged box, cosmetic scratch, display piece)</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefect}
                      onChange={(e) => setFormData({ ...formData, isDefect: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {formData.isDefect && (
                  <div className="pt-2 border-t border-amber-200 space-y-3 animate-fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <label className="block text-slate-700 font-bold text-xs">Defect / Clearance Condition Description *</label>
                        <span className="text-[10px] text-amber-800 font-semibold">1-Click Condition Templates:</span>
                      </div>
                      
                      {/* Defect Preset Buttons */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {DEFECT_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, defectNote: preset.text }));
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/80 transition-colors cursor-pointer shadow-2xs"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows="3"
                        required={formData.isDefect}
                        value={formData.defectNote}
                        onChange={(e) => setFormData({ ...formData, defectNote: e.target.value })}
                        placeholder="e.g. Outer cardboard box slightly dented during freight transit. Inner item is 100% brand new, authentic, and working perfectly with full warranty."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 text-xs leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Special Discounted Clearance Price (৳) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required={formData.isDefect}
                          value={formData.clearancePrice}
                          onChange={(e) => setFormData({ ...formData, clearancePrice: e.target.value })}
                          placeholder="e.g. 19500"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 focus:ring-2 focus:ring-amber-500 font-bold text-amber-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Regular Selling Price Benchmark</label>
                        <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-between min-h-[38px]">
                          <span>৳{formData.sellingPrice ? Number(formData.sellingPrice).toLocaleString() : '0'}</span>
                          {formData.clearancePrice && formData.sellingPrice && Number(formData.sellingPrice) > Number(formData.clearancePrice) && (
                            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              {Math.round(((Number(formData.sellingPrice) - Number(formData.clearancePrice)) / Number(formData.sellingPrice)) * 100)}% DISCOUNT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-amber-800 font-medium">
                      💡 Clearance products are showcased with a transparent defect note and special clearance badge on the storefront to build 100% customer trust.
                    </p>
                  </div>
                )}
              </div>

              {/* Product Image: Direct Device Upload Primary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Product Photo / Image *</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-brand-600 hover:underline font-bold"
                  >
                    {showUrlInput ? 'Hide Web URL Input' : 'Or paste online image URL'}
                  </button>
                </div>

                {/* Primary Upload Area */}
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-400 transition-colors">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Thumbnail / Upload Trigger */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 relative shadow-xs group">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Product Preview"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-navy-900/80 px-2 py-1 rounded-lg">Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-400 font-bold block">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div>
                        <h4 className="font-bold text-navy-900 text-xs sm:text-sm">
                          {imagePreview ? 'Photo Selected & Ready' : 'Upload photo from your computer or phone'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Supports JPG, PNG, WEBP, and JPEG image files (Auto-resized for fast loading)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        <label className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{imagePreview ? 'Choose Different Photo' : 'Select Photo from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: '' }));
                              setImagePreview('');
                            }}
                            className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Web URL Input (collapsible) */}
                  {showUrlInput && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">External Image Web URL (Optional):</label>
                      <input
                        type="url"
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/product-image.jpg"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description: Rich Formatting Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Product Description & Key Highlights</label>
                  {/* Editor vs Preview Mode Switcher */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDescTab('editor')}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        descTab === 'editor' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab('preview')}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        descTab === 'preview' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Live Store Preview</span>
                    </button>
                  </div>
                </div>

                {descTab === 'editor' ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 bg-white">
                    {/* Formatting Toolbar */}
                    <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => insertFormatting('bold')}
                        title="Bold Text (**text**)"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold hover:text-navy-900 shadow-2xs transition-colors"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('italic')}
                        title="Italic Text (*text*)"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-navy-900 shadow-2xs transition-colors"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('h3')}
                        title="Heading (### Title)"
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[11px] shadow-2xs transition-colors"
                      >
                        H3
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('bullet')}
                        title="Bullet List (• item)"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-navy-900 shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Bullet List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('number')}
                        title="Numbered List (1. item)"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-navy-900 shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">1. 2. 3.</span>
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('authentic')}
                        title="Add Authentic Guarantee Badge"
                        className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] shadow-2xs transition-colors"
                      >
                        ⭐ Authentic Badge
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('warranty')}
                        title="Add Warranty Note"
                        className="px-2 py-1 rounded-lg bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 font-bold text-[10px] shadow-2xs transition-colors"
                      >
                        🛡️ Warranty Badge
                      </button>
                    </div>

                    <textarea
                      ref={descTextareaRef}
                      rows="6"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write rich product description here...&#10;&#10;### Key Features&#10;• 100% Authentic imported stock&#10;• Premium build and official warranty&#10;• Fast 24-48h Dhaka delivery"
                      className="w-full p-3.5 bg-white focus:outline-none text-xs leading-relaxed text-slate-800 font-sans"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 min-h-[160px] max-h-[220px] overflow-y-auto">
                    {formData.description ? (
                      <FormattedDescription content={formData.description} />
                    ) : (
                      <p className="text-xs text-slate-400 italic">No description entered yet. Switch to Editor tab to add formatted text.</p>
                    )}
                  </div>
                )}
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
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20 cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Upload Product'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add New Category Modal */}
      {showAddCatModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-navy-900 font-extrabold text-sm">
                <FolderPlus className="w-5 h-5 text-brand-600" />
                <span>Add New Product Category</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddCatModal(false);
                  setNewCatName('');
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Home & Kitchen, Gaming, Jewelry"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCatModal(false);
                    setNewCatName('');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  Save Category
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
      {/* Convert to Defect / Clearance Modal */}
      {convertToClearanceItem && createPortal(
        <div 
          className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConvertToClearanceItem(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-200 relative my-auto max-h-[92vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy-950 text-base">Move Product to Clearance Sale</h3>
                  <span className="text-xs text-slate-500">Configure condition note & discounted pricing</span>
                </div>
              </div>
              <button
                onClick={() => setConvertToClearanceItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                <img
                  src={convertToClearanceItem.image}
                  alt={convertToClearanceItem.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-brand-600 block">{convertToClearanceItem.brand}</span>
                <h4 className="text-xs font-bold text-navy-900 truncate">{convertToClearanceItem.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs">
                  <span className="text-slate-400">Regular Selling Price:</span>
                  <span className="font-black text-navy-900">৳{convertToClearanceItem.sellingPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-4">
              {/* Defect Presets */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  1-Click Defect Condition Templates:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DEFECT_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setConvertForm(prev => ({
                        ...prev,
                        defectType: preset.name,
                        defectNote: preset.text
                      }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        convertForm.defectType === preset.name
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <textarea
                  rows="3"
                  required
                  value={convertForm.defectNote}
                  onChange={(e) => setConvertForm({ ...convertForm, defectNote: e.target.value })}
                  placeholder="Describe exact defect or condition..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs leading-relaxed text-slate-800"
                />
              </div>

              {/* Clearance Price Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Clearance Selling Price (৳) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={convertForm.clearancePrice}
                    onChange={(e) => setConvertForm({ ...convertForm, clearancePrice: e.target.value })}
                    placeholder="e.g. 2100"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-black text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Customer Savings
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs font-bold text-rose-800 flex items-center justify-between min-h-[42px]">
                    {convertForm.clearancePrice && convertToClearanceItem.sellingPrice > Number(convertForm.clearancePrice) ? (
                      <>
                        <span>Save ৳{(convertToClearanceItem.sellingPrice - Number(convertForm.clearancePrice)).toLocaleString()}</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black">
                          {Math.round(((convertToClearanceItem.sellingPrice - Number(convertForm.clearancePrice)) / convertToClearanceItem.sellingPrice) * 100)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal text-[11px]">Enter lower clearance price</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertToClearanceItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Tag className="w-4 h-4" />
                  <span>Confirm & Move to Clearance</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Quick Clearance Price Adjust Modal */}
      {quickPriceItem && createPortal(
        <div 
          className="fixed inset-0 z-[115] flex items-center justify-center p-3 bg-navy-950/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickPriceItem(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-navy-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Adjust Clearance Price</span>
              </h3>
              <button
                onClick={() => setQuickPriceItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-600 uppercase block">{quickPriceItem.brand}</span>
              <h4 className="text-xs font-bold text-navy-900 truncate">{quickPriceItem.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Original MRP / Regular: ৳{Number(quickPriceItem.originalMrp || quickPriceItem.sellingPrice || 0).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Clearance Price (৳):</label>
                <input
                  type="number"
                  min="1"
                  required
                  autoFocus
                  value={quickPriceValue}
                  onChange={(e) => setQuickPriceValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-black text-rose-700 text-base"
                />
              </div>

              {quickPriceValue && Number(quickPriceItem.originalMrp || quickPriceItem.sellingPrice) > Number(quickPriceValue) && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold flex items-center justify-between">
                  <span>Customer Savings:</span>
                  <span>{Math.round(((Number(quickPriceItem.originalMrp || quickPriceItem.sellingPrice) - Number(quickPriceValue)) / Number(quickPriceItem.originalMrp || quickPriceItem.sellingPrice)) * 100)}% DISCOUNT</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPriceItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md"
                >
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

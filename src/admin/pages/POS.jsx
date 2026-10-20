import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  UserPlus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Receipt, 
  Percent, 
  AlertCircle, 
  Check, 
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useBusiness } from '../../context/BusinessContext';
import { calculateBill, formatINR, TAX_RATES } from '../../utils/billingCalculator';
import PrintableInvoice from '../components/PrintableInvoice';
import toast from 'react-hot-toast';

const POS = () => {
  const { products, categories } = useShop();
  const { customers, recordSale, addCustomer, getNextInvoiceNumber } = useBusiness();

  // Catalog search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchInputRef = useRef(null);

  // Bill items state
  const [billItems, setBillItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0] || null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    city: 'Udaipur',
    notes: ''
  });

  // Billing discounts & tax
  const [billDiscountType, setBillDiscountType] = useState('flat'); // 'flat' | 'percent'
  const [billDiscountValue, setBillDiscountValue] = useState(0);
  const [selectedTaxRate, setSelectedTaxRate] = useState(0.12); // Standard 12% GST

  // Payment states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'Cash' | 'UPI' | 'Card' | 'Split'
  const [cashTendered, setCashTendered] = useState('');
  const [upiReference, setUpiReference] = useState('');
  const [cardAuthCode, setCardAuthCode] = useState('');
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [splitUpiAmount, setSplitUpiAmount] = useState('');

  // Completed sale for printable invoice
  const [completedSale, setCompletedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Quick keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        String(p.id) === q;
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Billing calculation
  const billCalc = useMemo(() => {
    const amountPaid = isPaymentModalOpen
      ? (paymentMethod === 'Cash'
          ? Number(cashTendered) || 0
          : paymentMethod === 'Split'
          ? (Number(splitCashAmount) || 0) + (Number(splitUpiAmount) || 0)
          : undefined)
      : 0;

    return calculateBill({
      items: billItems,
      billDiscountType,
      billDiscountValue,
      taxRate: selectedTaxRate,
      amountPaid: amountPaid !== undefined ? amountPaid : 0
    });
  }, [billItems, billDiscountType, billDiscountValue, selectedTaxRate, isPaymentModalOpen, paymentMethod, cashTendered, splitCashAmount, splitUpiAmount]);

  // Add product to bill
  const handleAddToBill = (product, mode = 'purchase') => {
    const unitPrice = mode === 'rent' ? (product.rentPrice || Math.round(product.price * 0.3)) : product.price;
    const defaultSize = product.sizes?.[0] || 'Standard';
    const sku = product.sku || `RNJ-${product.category?.slice(0, 3).toUpperCase() || 'ITM'}-${String(product.id).padStart(3, '0')}`;

    // Check existing
    const existingIndex = billItems.findIndex(
      (item) => item.id === product.id && item.mode === mode && item.size === defaultSize
    );

    if (existingIndex > -1) {
      const currentQty = billItems[existingIndex].quantity;
      if (currentQty >= product.stock) {
        toast.error(`Only ${product.stock} units available in showroom stock!`);
        return;
      }
      setBillItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (product.stock <= 0) {
        toast.error(`${product.name} is currently out of stock!`);
        return;
      }
      setBillItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku,
          mode, // 'purchase' | 'rent'
          size: defaultSize,
          sizes: product.sizes || ['Standard'],
          color: product.color || 'Standard',
          price: unitPrice,
          unitPrice,
          quantity: 1,
          discount: 0,
          discountType: 'flat',
          maxStock: product.stock
        }
      ]);
    }
    toast.success(`Added ${product.name} to bill`, { duration: 1500 });
  };

  // Modify item quantity
  const handleUpdateQuantity = (index, delta) => {
    setBillItems((prev) =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              toast.error(`Max stock available is ${item.maxStock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Change item size
  const handleItemSizeChange = (index, newSize) => {
    setBillItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, size: newSize } : item))
    );
  };

  // Change item mode (Sale vs Rental)
  const handleItemModeToggle = (index) => {
    setBillItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const originalProd = products.find((p) => p.id === item.id);
          const newMode = item.mode === 'purchase' ? 'rent' : 'purchase';
          const newPrice = newMode === 'rent'
            ? (originalProd?.rentPrice || Math.round(originalProd?.price * 0.3) || 3000)
            : (originalProd?.price || item.price);
          return {
            ...item,
            mode: newMode,
            price: newPrice,
            unitPrice: newPrice
          };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setBillItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Clear bill
  const handleClearBill = () => {
    if (billItems.length === 0) return;
    if (window.confirm('Clear all items from current bill?')) {
      setBillItems([]);
      setBillDiscountValue(0);
      toast('Bill cleared');
    }
  };

  // Add quick customer
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.phone.trim()) {
      toast.error('Customer phone number is required');
      return;
    }
    const res = addCustomer({
      name: newCustomerForm.name.trim() || 'Showroom Guest',
      phone: newCustomerForm.phone.trim(),
      city: newCustomerForm.city.trim() || 'Udaipur',
      address: '',
      notes: newCustomerForm.notes.trim()
    });
    if (res.success) {
      setSelectedCustomer(res.customer);
      setIsNewCustomerModalOpen(false);
      setNewCustomerForm({ name: '', phone: '', city: 'Udaipur', notes: '' });
      toast.success('Customer registered successfully');
    }
  };

  // Open Payment modal
  const handleInitiatePayment = () => {
    if (billItems.length === 0) {
      toast.error('Cannot proceed: Bill is empty!');
      return;
    }
    setCashTendered(String(billCalc.grandTotal));
    setSplitCashAmount(String(Math.round(billCalc.grandTotal / 2)));
    setSplitUpiAmount(String(billCalc.grandTotal - Math.round(billCalc.grandTotal / 2)));
    setIsPaymentModalOpen(true);
  };

  // Finalize Sale & Generate Invoice
  const handleFinalizeSale = async () => {
    let payments = [];
    let amountPaid = billCalc.grandTotal;

    if (paymentMethod === 'Cash') {
      const tendered = Number(cashTendered) || billCalc.grandTotal;
      payments.push({
        method: 'Cash',
        amount: Math.min(tendered, billCalc.grandTotal),
        tendered,
        change: Math.max(0, tendered - billCalc.grandTotal),
        timestamp: new Date().toISOString()
      });
    } else if (paymentMethod === 'UPI') {
      payments.push({
        method: 'UPI',
        amount: billCalc.grandTotal,
        reference: upiReference || `UPI/${Date.now().toString().slice(-8)}/RANAJI`,
        timestamp: new Date().toISOString()
      });
    } else if (paymentMethod === 'Card') {
      payments.push({
        method: 'Card',
        amount: billCalc.grandTotal,
        reference: cardAuthCode || `AUTH-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString()
      });
    } else if (paymentMethod === 'Split') {
      const c = Number(splitCashAmount) || 0;
      const u = Number(splitUpiAmount) || 0;
      amountPaid = c + u;
      payments.push({ method: 'Cash', amount: c, timestamp: new Date().toISOString() });
      payments.push({ method: 'UPI', amount: u, timestamp: new Date().toISOString() });
    }

    const salePayload = {
      customer: selectedCustomer || {
        name: 'Walk-in Customer',
        phone: '+91 99999 00000',
        city: 'Udaipur Showroom'
      },
      items: billCalc.items,
      calculation: {
        ...billCalc,
        amountPaid
      },
      payments,
      cashier: 'Admin (Master POS)',
      register: 'Counter 01'
    };

    // Atomic execution & persistence
    const res = await recordSale(salePayload);
    if (res.success) {
      setCompletedSale(res.sale);
      setIsPaymentModalOpen(false);
      setBillItems([]);
      setBillDiscountValue(0);
      setIsInvoiceOpen(true);
      toast.success(`Sale recorded! Invoice #${res.sale.invoiceNumber} generated.`);
    } else {
      toast.error('Failed to complete sale: ' + (res.message || 'Unknown error'));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mt-2">
      {/* Top Banner / Register Stats */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gold/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Receipt size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl text-cream tracking-wide">Showroom POS & Counter Billing</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                Register #1 Active
              </span>
            </div>
            <p className="text-xs text-cream/50 font-body">Ranaji Flagship Showroom — Palace Road, Udaipur</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearBill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/20 text-cream/60 hover:text-crimson hover:border-crimson/40 text-xs font-body transition-colors"
          >
            <RotateCcw size={14} />
            <span>New Bill (F2)</span>
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* LEFT PANEL: Catalog & Quick Add (Col 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col bg-night-light/30 border border-gold/20 rounded-2xl p-4 overflow-hidden">
          {/* Search & Barcode Bar */}
          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search product by name, SKU, barcode, or category (Press '/' to search)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-night border border-gold/30 rounded-xl text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
            />
            <Barcode className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/40" size={18} />
          </div>

          {/* Category Quick Chips */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gold text-night font-bold shadow-md'
                  : 'bg-night/80 text-cream/70 hover:bg-gold/10 hover:text-gold border border-gold/20'
              }`}
            >
              All Outfits ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gold text-night font-bold shadow-md'
                    : 'bg-night/80 text-cream/70 hover:bg-gold/10 hover:text-gold border border-gold/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inStock = (p.stock || 0) > 0;
              const isLowStock = p.stock > 0 && p.stock <= 3;

              return (
                <div
                  key={p.id}
                  className="group bg-night border border-gold/20 hover:border-gold/50 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-night-light overflow-hidden">
                    <img
                      src={p.image || '/images/image.png'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-night/80 text-gold border border-gold/30">
                        {p.sku || `RNJ-${p.id}`}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        !inStock
                          ? 'bg-crimson/80 text-cream'
                          : isLowStock
                          ? 'bg-amber-500/80 text-night'
                          : 'bg-emerald-500/80 text-cream'
                      }`}>
                        {inStock ? `${p.stock} left` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm text-cream truncate" title={p.name}>
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-cream/50 truncate font-body">
                        {p.subcategory || p.category}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gold/10 flex items-center justify-between">
                      <div>
                        <div className="font-display text-sm text-gold font-bold">
                          {formatINR(p.price)}
                        </div>
                        {p.rentPrice && (
                          <div className="text-[10px] text-cream/50 font-body">
                            Rent: {formatINR(p.rentPrice)}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        {/* Rent Add */}
                        {p.rentPrice && inStock && (
                          <button
                            onClick={() => handleAddToBill(p, 'rent')}
                            className="px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 rounded text-[10px] font-bold uppercase transition-colors"
                            title="Add to Bill as Rental"
                          >
                            Rent
                          </button>
                        )}
                        {/* Sale Add */}
                        <button
                          disabled={!inStock}
                          onClick={() => handleAddToBill(p, 'purchase')}
                          className="px-2.5 py-1 bg-gold text-night hover:bg-copper font-bold rounded text-xs flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Add to Bill as Purchase"
                        >
                          <Plus size={12} />
                          <span>Buy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: The Active Bill (Col 5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col bg-night border border-gold/30 rounded-2xl p-4 overflow-hidden shadow-2xl">
          {/* Customer Selection Bar */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gold/20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <User size={16} />
              </div>
              <div>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust) setSelectedCustomer(cust);
                  }}
                  className="bg-transparent text-cream font-display text-sm font-bold focus:outline-none cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-night text-cream">
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-cream/50 font-body">
                  {selectedCustomer?.city || 'Showroom Customer'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-xs font-body transition-colors"
            >
              <UserPlus size={14} />
              <span>+ New</span>
            </button>
          </div>

          {/* Current Bill Lines Table */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-3">
            {billItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-cream/40">
                <ShoppingBag size={48} className="text-gold/20 mb-3" />
                <p className="font-display text-cream/70 text-sm">Bill is currently empty</p>
                <p className="text-xs text-cream/40 font-body mt-1">
                  Click on garments on the left or scan barcode to add
                </p>
              </div>
            ) : (
              billItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.mode}-${item.size}-${idx}`}
                  className="p-3 bg-night-light/40 border border-gold/15 hover:border-gold/30 rounded-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm text-cream truncate">
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleItemModeToggle(idx)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.mode === 'rent'
                              ? 'bg-purple-900/50 text-purple-300 border border-purple-500/40'
                              : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.mode === 'rent' ? 'Rental' : 'Sale'}
                        </button>
                      </div>

                      {/* Size & SKU Bar */}
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-cream/60 font-body">
                        <span className="font-mono text-gold/80">{item.sku}</span>
                        <span>•</span>
                        <select
                          value={item.size}
                          onChange={(e) => handleItemSizeChange(idx, e.target.value)}
                          className="bg-night border border-gold/20 rounded px-1.5 py-0.5 text-cream text-[11px] focus:outline-none"
                        >
                          {item.sizes?.map((sz) => (
                            <option key={sz} value={sz} className="bg-night">
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-cream/40 hover:text-crimson p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold/10">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gold/30 rounded-lg bg-night">
                        <button
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          className="p-1 hover:text-gold text-cream/60 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-cream">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          className="p-1 hover:text-gold text-cream/60 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs text-cream/50 font-body">
                        × {formatINR(item.unitPrice)}
                      </span>
                    </div>

                    <div className="font-display text-sm font-bold text-cream">
                      {formatINR(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Calculations & Discounts */}
          <div className="bg-night-light/50 border border-gold/20 rounded-xl p-3 space-y-2 shrink-0">
            {/* Bill Discount Row */}
            <div className="flex items-center justify-between text-xs font-body">
              <span className="text-cream/70 flex items-center gap-1">
                <Percent size={12} className="text-gold" />
                <span>Bill Discount:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex border border-gold/20 rounded overflow-hidden text-[11px]">
                  <button
                    onClick={() => setBillDiscountType('flat')}
                    className={`px-1.5 py-0.5 ${
                      billDiscountType === 'flat' ? 'bg-gold text-night font-bold' : 'text-cream/60'
                    }`}
                  >
                    ₹
                  </button>
                  <button
                    onClick={() => setBillDiscountType('percent')}
                    className={`px-1.5 py-0.5 ${
                      billDiscountType === 'percent' ? 'bg-gold text-night font-bold' : 'text-cream/60'
                    }`}
                  >
                    %
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={billDiscountValue || ''}
                  onChange={(e) => setBillDiscountValue(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-16 px-1.5 py-0.5 bg-night border border-gold/30 rounded text-right text-xs text-cream focus:outline-none"
                />
              </div>
            </div>

            {/* GST Tax Tier Selector */}
            <div className="flex items-center justify-between text-xs font-body">
              <span className="text-cream/70">GST Tax Treatment:</span>
              <select
                value={selectedTaxRate}
                onChange={(e) => setSelectedTaxRate(Number(e.target.value))}
                className="bg-night border border-gold/30 text-cream text-[11px] rounded px-2 py-0.5 focus:outline-none"
              >
                {TAX_RATES.map((t) => (
                  <option key={t.rate} value={t.rate} className="bg-night text-cream">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtotal & Taxes Breakdown */}
            <div className="pt-2 border-t border-gold/10 space-y-1 text-xs font-body">
              <div className="flex justify-between text-cream/60">
                <span>Items Subtotal:</span>
                <span className="font-mono">{formatINR(billCalc.itemsGross)}</span>
              </div>
              {billCalc.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatINR(billCalc.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream/60">
                <span>GST Tax (CGST + SGST):</span>
                <span className="font-mono">{formatINR(billCalc.totalTax)}</span>
              </div>
            </div>

            {/* Grand Total Bar */}
            <div className="pt-2 border-t border-gold/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-cream/50 font-body block">
                  Payable Amount
                </span>
                <span className="text-2xl font-display font-extrabold text-gold tracking-wide">
                  {formatINR(billCalc.grandTotal)}
                </span>
              </div>

              <button
                disabled={billItems.length === 0}
                onClick={handleInitiatePayment}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-copper text-night font-display font-bold text-sm tracking-wider uppercase rounded-xl hover:brightness-110 shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Pay & Bill</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK NEW CUSTOMER MODAL */}
      <AnimatePresence>
        {isNewCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-night border border-gold/30 rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="font-display text-lg text-cream mb-4 flex items-center gap-2">
                <UserPlus className="text-gold" size={20} />
                <span>Quick Add Showroom Client</span>
              </h2>

              <form onSubmit={handleCreateCustomer} className="space-y-3 font-body text-xs">
                <div>
                  <label className="block text-cream/70 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kunwar Ranveer Singh"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-lg text-cream text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-cream/70 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98290 00000"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-lg text-cream text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-cream/70 mb-1">City / Origin</label>
                  <input
                    type="text"
                    placeholder="Udaipur, Jaipur, Jodhpur..."
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-lg text-cream text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-cream/70 mb-1">Tailoring Notes / Fitting Requests</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Groom fitting, safa size 22 in..."
                    value={newCustomerForm.notes}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-lg text-cream text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(false)}
                    className="px-4 py-2 border border-gold/20 text-cream/60 hover:text-cream rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold text-night font-bold rounded-lg text-xs hover:bg-copper"
                  >
                    Save & Select
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYMENT SETTLEMENT MODAL */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-night border border-gold/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-4">
                <div>
                  <h2 className="font-display text-lg text-cream tracking-wide">
                    Settle Payment & Generate Tax Invoice
                  </h2>
                  <p className="text-xs text-cream/50 font-body">
                    Billed to: {selectedCustomer?.name || 'Walk-in Customer'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-cream/50">Total Due</div>
                  <div className="font-display text-xl text-gold font-bold">
                    {formatINR(billCalc.grandTotal)}
                  </div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'Card', label: 'POS Card', icon: CreditCard },
                  { id: 'Split', label: 'Split Pay', icon: Layers }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      paymentMethod === m.id
                        ? 'bg-gold/20 border-gold text-gold font-bold shadow-md'
                        : 'bg-night-light border-gold/15 text-cream/60 hover:text-cream'
                    }`}
                  >
                    <m.icon size={20} className="mb-1" />
                    <span className="text-xs font-body">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Method Specific Fields */}
              <div className="p-4 bg-night-light/50 border border-gold/20 rounded-xl mb-4 font-body text-xs space-y-3">
                {paymentMethod === 'UPI' && (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                      {/* Stylized QR Code placeholder */}
                      <div className="w-full h-full border-4 border-slate-900 border-dashed rounded flex flex-col items-center justify-center text-slate-800">
                        <QrCode size={40} className="text-amber-900 mb-1" />
                        <span className="text-[9px] font-bold font-mono">ranaji@upi</span>
                      </div>
                    </div>
                    <div className="text-cream/70 text-xs">
                      Scan via GPay / PhonePe / Paytm to transfer <span className="font-bold text-gold">{formatINR(billCalc.grandTotal)}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Transaction UTR / Reference No. (Optional)"
                      value={upiReference}
                      onChange={(e) => setUpiReference(e.target.value)}
                      className="w-full px-3 py-2 bg-night border border-gold/30 rounded-lg text-cream text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                )}

                {paymentMethod === 'Cash' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-cream/70 mb-1">Cash Tendered by Customer (₹)</label>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-full px-3 py-2.5 bg-night border border-gold/40 rounded-lg text-gold font-mono font-bold text-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                    {Number(cashTendered) >= billCalc.grandTotal ? (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex justify-between items-center text-emerald-300">
                        <span>Change to Return:</span>
                        <span className="font-mono text-base font-bold">
                          {formatINR(Number(cashTendered) - billCalc.grandTotal)}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Short by: {formatINR(billCalc.grandTotal - (Number(cashTendered) || 0))}</span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-2">
                    <p className="text-cream/70">Swipe or tap card on showroom EDC machine:</p>
                    <input
                      type="text"
                      placeholder="Card Approval / Auth Code (Optional)"
                      value={cardAuthCode}
                      onChange={(e) => setCardAuthCode(e.target.value)}
                      className="w-full px-3 py-2 bg-night border border-gold/30 rounded-lg text-cream text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                )}

                {paymentMethod === 'Split' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-cream/70 mb-1">Cash Part (₹)</label>
                        <input
                          type="number"
                          value={splitCashAmount}
                          onChange={(e) => setSplitCashAmount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-night border border-gold/30 rounded text-cream text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-cream/70 mb-1">UPI Part (₹)</label>
                        <input
                          type="number"
                          value={splitUpiAmount}
                          onChange={(e) => setSplitUpiAmount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-night border border-gold/30 rounded text-cream text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gold/20 text-cream/60 hover:text-cream rounded-xl text-xs font-body"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeSale}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold rounded-xl text-xs uppercase tracking-wider hover:brightness-110 shadow-lg font-body"
                >
                  <Check size={16} />
                  <span>Confirm Sale & Print</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPLETED PRINTABLE INVOICE MODAL */}
      <PrintableInvoice
        sale={completedSale}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};

export default POS;

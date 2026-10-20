import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  ArrowUpDown, 
  Plus, 
  History, 
  Check, 
  Filter, 
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/billingCalculator';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { products } = useShop();
  const { inventoryMovements, adjustStock } = useBusiness();

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('Showroom Physical Count Verification');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q));

      const isLowStock = (p.stock || 0) <= 3;
      const matchStock = filterLowStockOnly ? isLowStock : true;

      return matchSearch && matchStock;
    });
  }, [products, searchQuery, filterLowStockOnly]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    products.forEach((p) => {
      const st = Number(p.stock) || 0;
      totalUnits += st;
      totalValuation += st * (Number(p.price) || 0);
      if (st === 0) outOfStockCount++;
      else if (st <= 3) lowStockCount++;
    });

    return { totalUnits, lowStockCount, outOfStockCount, totalValuation };
  }, [products]);

  const handleOpenAdjust = (prod) => {
    setSelectedProductForAdjust(prod);
    setAdjustDelta('');
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProductForAdjust || adjustDelta === '') return;

    const deltaNum = Number(adjustDelta);
    if (isNaN(deltaNum)) {
      toast.error('Please enter a valid numeric change');
      return;
    }

    const prodId = selectedProductForAdjust._id || selectedProductForAdjust.id;
    const res = await adjustStock(
      prodId,
      deltaNum,
      adjustReason,
      'Admin (Inventory Desk)'
    );

    if (res.success) {
      toast.success(`Stock updated for ${selectedProductForAdjust.name}`);
      setIsAdjustModalOpen(false);
      setSelectedProductForAdjust(null);
    } else {
      toast.error(res.message || 'Error updating stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-cream tracking-wide">Showroom Inventory & Garment Stock</h1>
          <p className="text-xs text-cream/50 font-body mt-1">
            Real-time multi-variant tracking, low-stock alerts, and auditable movement logs
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-gold/20 rounded-xl overflow-hidden text-xs font-body">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
              activeTab === 'stock'
                ? 'bg-gold text-night font-bold'
                : 'bg-night text-cream/70 hover:text-cream'
            }`}
          >
            <Package size={14} />
            <span>Garment Stock ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
              activeTab === 'movements'
                ? 'bg-gold text-night font-bold'
                : 'bg-night text-cream/70 hover:text-cream'
            }`}
          >
            <History size={14} />
            <span>Audit Trail ({inventoryMovements.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Total Garments in Stock</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {stats.totalUnits} Units
            </div>
          </div>
        </div>

        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Low Stock Alert (≤ 3)</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {stats.lowStockCount} Items
            </div>
          </div>
        </div>

        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-crimson/10 border border-crimson/30 flex items-center justify-center text-crimson">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Sold Out Outfits</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {stats.outOfStockCount} Items
            </div>
          </div>
        </div>

        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Package size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Inventory Valuation</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {formatINR(stats.totalValuation)}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-night-light/30 border border-gold/20 rounded-2xl p-3">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" size={16} />
              <input
                type="text"
                placeholder="Search garments by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-night border border-gold/20 rounded-xl text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold font-body"
              />
            </div>

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-body border transition-colors ${
                filterLowStockOnly
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                  : 'bg-night text-cream/60 border-gold/20 hover:text-cream'
              }`}
            >
              <AlertTriangle size={14} />
              <span>Show Low Stock Only</span>
            </button>
          </div>

          {/* Garments Stock Table */}
          <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="bg-night-light/60 border-b border-gold/20 text-cream/60 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 font-semibold">Garment Details</th>
                    <th className="py-3.5 px-4 font-semibold">SKU / Code</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Selling Price</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Available Stock</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Stock Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {filteredProducts.map((p) => {
                    const st = Number(p.stock) || 0;
                    const isLow = st > 0 && st <= 3;
                    const isOut = st === 0;

                    return (
                      <tr key={p.id} className="hover:bg-gold/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || '/images/image.png'}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gold/20 shrink-0"
                            />
                            <div>
                              <div className="font-display font-bold text-cream text-sm">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-cream/50">
                                {p.color || 'Standard royal hue'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gold/80 font-bold">
                          {p.sku || `RNJ-SKU-${p.id}`}
                        </td>
                        <td className="py-3 px-4 text-cream/70 capitalize">
                          {p.subcategory || p.category}
                        </td>
                        <td className="py-3 px-4 text-right font-display text-sm font-bold text-cream font-mono">
                          {formatINR(p.price)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-base font-bold text-cream">
                            {st}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isOut
                              ? 'bg-crimson/20 text-crimson border border-crimson/30'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {isOut ? 'Sold Out' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-xs font-body transition-colors"
                          >
                            <ArrowUpDown size={12} />
                            <span>Adjust Stock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* AUDIT TRAIL TAB */
        <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-night-light/40 border-b border-gold/20">
            <h2 className="font-display text-base text-cream">Historical Inventory Movements Audit Trail</h2>
            <p className="text-xs text-cream/50 font-body">
              Immutable ledger of showroom sales deductions, restocks, returns, and physical audit adjustments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="bg-night-light/60 border-b border-gold/20 text-cream/60 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Garment / SKU</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Movement</th>
                  <th className="py-3.5 px-4 font-semibold text-center">New Balance</th>
                  <th className="py-3.5 px-4 font-semibold">Activity Type</th>
                  <th className="py-3.5 px-4 font-semibold">Reference / Audit Note</th>
                  <th className="py-3.5 px-4 font-semibold">Acting Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {inventoryMovements.map((m) => {
                  const formattedDate = new Date(m.date).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const isPositive = m.change > 0;

                  return (
                    <tr key={m.id} className="hover:bg-gold/5 transition-colors">
                      <td className="py-3.5 px-4 text-cream/70 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-cream">{m.productName}</div>
                        <div className="text-[10px] font-mono text-gold/70">{m.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-crimson/20 text-crimson'
                        }`}>
                          {isPositive ? `+${m.change}` : m.change}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-cream">
                        {m.balance}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/20">
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-cream/70">
                        {m.reference}
                      </td>
                      <td className="py-3.5 px-4 text-cream/50">
                        {m.actor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      <AnimatePresence>
        {isAdjustModalOpen && selectedProductForAdjust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-night border border-gold/30 rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="font-display text-lg text-cream mb-1 flex items-center gap-2">
                <ArrowUpDown className="text-gold" size={20} />
                <span>Adjust Stock: {selectedProductForAdjust.name}</span>
              </h2>
              <p className="text-xs text-cream/50 font-body mb-4">
                Current showroom inventory: <span className="font-bold text-gold">{selectedProductForAdjust.stock} units</span>
              </p>

              <form onSubmit={handleConfirmAdjust} className="space-y-4 font-body text-xs">
                <div>
                  <label className="block text-cream/70 mb-1">
                    Stock Change Delta (+ to add, - to reduce) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. +5 or -2"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(e.target.value)}
                    className="w-full px-3 py-2.5 bg-night-light border border-gold/40 rounded-xl text-gold font-mono font-bold text-base focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-cream/70 mb-1">Reason for Adjustment *</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-xl text-cream focus:outline-none"
                  >
                    <option value="Showroom Physical Count Verification">Showroom Physical Count Verification</option>
                    <option value="New Workshop Batch Received">New Workshop Batch Received</option>
                    <option value="Damaged / Fabric Defect Removal">Damaged / Fabric Defect Removal</option>
                    <option value="Customer Return Restock">Customer Return Restock</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 border border-gold/20 text-cream/60 hover:text-cream rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold text-night font-bold rounded-xl text-xs hover:bg-copper"
                  >
                    Record & Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;

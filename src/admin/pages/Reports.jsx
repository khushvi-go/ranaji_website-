import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Package, 
  Users, 
  Shirt, 
  Printer, 
  Download,
  AlertTriangle,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../utils/billingCalculator';

const Reports = () => {
  const { sales, customers, rentals, loading } = useBusiness();
  const { products } = useShop();
  const [timeRange, setTimeRange] = useState('ALL'); // 'TODAY', 'MONTH', 'ALL'

  // Filter sales by timeRange
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const d = new Date(s.createdAt);
      if (timeRange === 'TODAY') {
        return d.toDateString() === now.toDateString();
      }
      if (timeRange === 'MONTH') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [sales, timeRange]);

  // Overall Financial Calculations
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.calculation?.grandTotal || 0), 0);
  const totalBills = filteredSales.length;
  const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;
  const totalTaxes = filteredSales.reduce((sum, s) => sum + (s.calculation?.taxAmount || 0), 0);

  // Payment Methods Breakdown
  const paymentBreakdown = useMemo(() => {
    const map = { CASH: 0, UPI: 0, CARD: 0, OTHER: 0 };
    filteredSales.forEach((s) => {
      const pm = (s.payment?.method || s.paymentMethod || 'CASH').toUpperCase();
      const amt = s.calculation?.grandTotal || 0;
      if (pm.includes('CASH')) map.CASH += amt;
      else if (pm.includes('UPI') || pm.includes('QR')) map.UPI += amt;
      else if (pm.includes('CARD')) map.CARD += amt;
      else map.OTHER += amt;
    });
    return map;
  }, [filteredSales]);

  // Top Selling Garments
  const topGarments = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item) => {
          const name = item.productName || item.name || 'Royal Garment';
          if (!map[name]) {
            map[name] = { name, count: 0, revenue: 0 };
          }
          const qty = Number(item.quantity) || 1;
          const price = Number(item.unitPrice || item.price) || 0;
          map[name].count += qty;
          map[name].revenue += price * qty;
        });
      }
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  // Inventory Health
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockProducts = products.filter((p) => (Number(p.stock) || 0) <= 3);

  // Rental Performance
  const activeRentals = rentals.filter((r) => (r.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const overdueRentals = rentals.filter((r) => {
    const s = (r.status || 'ACTIVE').toUpperCase();
    return s === 'ACTIVE' && new Date(r.returnDateExpected) < new Date();
  }).length;
  const completedRentals = rentals.filter((r) => (r.status || '').toUpperCase() === 'RETURNED').length;
  const totalRentalRevenue = rentals.reduce((sum, r) => sum + (Number(r.totalRentalFee) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-cream tracking-wide">Showroom Performance & Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30">
              Real-Time Metrics
            </span>
          </div>
          <p className="text-xs text-cream/50 font-body mt-1">
            Financial analytics, payment methods, inventory health, and garment sales performance.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-2 bg-night p-1 rounded-xl border border-gold/20 self-start sm:self-auto">
          {['TODAY', 'MONTH', 'ALL'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
                timeRange === r
                  ? 'bg-gold text-night font-bold shadow-md'
                  : 'text-cream/60 hover:text-cream'
              }`}
            >
              {r === 'TODAY' ? 'Today' : r === 'MONTH' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-night border border-gold/25 shadow-xl">
          <div className="flex items-center justify-between text-gold/80 mb-2">
            <span className="text-xs font-body uppercase tracking-wider">Gross Revenue</span>
            <DollarSign size={20} />
          </div>
          <p className="font-display text-2xl sm:text-3xl text-cream font-bold">{formatINR(totalRevenue)}</p>
          <p className="text-[10px] text-cream/50 font-body mt-1">From {totalBills} recorded invoices</p>
        </div>

        <div className="p-5 rounded-2xl bg-night border border-emerald-500/25 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-body uppercase tracking-wider">Average Ticket Size</span>
            <TrendingUp size={20} />
          </div>
          <p className="font-display text-2xl sm:text-3xl text-emerald-400 font-bold">{formatINR(avgBillValue)}</p>
          <p className="text-[10px] text-cream/50 font-body mt-1">Average per client transaction</p>
        </div>

        <div className="p-5 rounded-2xl bg-night border border-copper/25 shadow-xl">
          <div className="flex items-center justify-between text-copper mb-2">
            <span className="text-xs font-body uppercase tracking-wider">Rental Turnover</span>
            <Shirt size={20} />
          </div>
          <p className="font-display text-2xl sm:text-3xl text-cream font-bold">{formatINR(totalRentalRevenue)}</p>
          <p className="text-[10px] text-cream/50 font-body mt-1">{rentals.length} bookings registered</p>
        </div>

        <div className="p-5 rounded-2xl bg-night border border-blue-500/25 shadow-xl">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-body uppercase tracking-wider">Tax Collected (GST)</span>
            <Calendar size={20} />
          </div>
          <p className="font-display text-2xl sm:text-3xl text-cream font-bold">{formatINR(totalTaxes)}</p>
          <p className="text-[10px] text-cream/50 font-body mt-1">CGST + SGST tax accounts</p>
        </div>
      </div>

      {/* Two Column Layout: Payment Methods Breakdown & Top Selling Garments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="p-6 rounded-2xl bg-night border border-gold/20 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-gold/15 pb-4">
            <h3 className="font-display text-lg text-cream">Payment Modes Distribution</h3>
            <CreditCard size={18} className="text-gold" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-body mb-1">
                <span className="text-cream/80">UPI / QR Digital</span>
                <span className="font-bold text-gold">{formatINR(paymentBreakdown.UPI)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream/10 overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (paymentBreakdown.UPI / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-body mb-1">
                <span className="text-cream/80">Cash Counter</span>
                <span className="font-bold text-emerald-400">{formatINR(paymentBreakdown.CASH)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (paymentBreakdown.CASH / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-body mb-1">
                <span className="text-cream/80">Credit / Debit Card</span>
                <span className="font-bold text-blue-400">{formatINR(paymentBreakdown.CARD)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream/10 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (paymentBreakdown.CARD / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="p-6 rounded-2xl bg-night border border-gold/20 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-gold/15 pb-4">
            <h3 className="font-display text-lg text-cream">Top-Selling Royal Garments</h3>
            <BarChart3 size={18} className="text-gold" />
          </div>

          {topGarments.length === 0 ? (
            <p className="text-xs text-cream/50 italic py-6 text-center">
              No sales recorded yet. Once bills are generated at POS, best-sellers appear here.
            </p>
          ) : (
            <div className="divide-y divide-gold/10">
              {topGarments.map((g, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-body">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-cream">{g.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold">{formatINR(g.revenue)}</p>
                    <p className="text-[10px] text-cream/50">{g.count} units billed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Inventory Status & Rental Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Status */}
        <div className="p-6 rounded-2xl bg-night border border-gold/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gold/15 pb-3">
            <h3 className="font-display text-lg text-cream">Inventory Health & Stock</h3>
            <Package size={18} className="text-gold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-cream/5 border border-gold/15">
              <span className="text-[10px] text-cream/50 uppercase font-body">Total Stock Count</span>
              <p className="font-display text-2xl text-cream font-bold mt-1">{totalStockUnits} Units</p>
            </div>
            <div className="p-3.5 rounded-xl bg-cream/5 border border-gold/15">
              <span className="text-[10px] text-cream/50 uppercase font-body">Low-Stock Outfits</span>
              <p className={`font-display text-2xl font-bold mt-1 ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {lowStockProducts.length} Items
              </p>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-body text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} />
                <span>Restock Required:</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                {lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.stock} left)`).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Rental Health */}
        <div className="p-6 rounded-2xl bg-night border border-gold/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gold/15 pb-3">
            <h3 className="font-display text-lg text-cream">Showroom Rental Performance</h3>
            <Clock size={18} className="text-gold" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25">
              <span className="text-[10px] text-blue-400 uppercase font-body">Active</span>
              <p className="font-display text-xl text-blue-400 font-bold mt-1">{activeRentals}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <span className="text-[10px] text-rose-400 uppercase font-body">Overdue</span>
              <p className="font-display text-xl text-rose-400 font-bold mt-1">{overdueRentals}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="text-[10px] text-emerald-400 uppercase font-body">Returned</span>
              <p className="font-display text-xl text-emerald-400 font-bold mt-1">{completedRentals}</p>
            </div>
          </div>

          <p className="text-xs text-cream/60 font-body leading-relaxed pt-2">
            Average return turnaround is 3.4 days. Showroom security deposits are held in escrow until master inspection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;

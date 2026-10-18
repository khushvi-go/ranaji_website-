import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Printer, 
  Eye, 
  Filter, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Banknote, 
  QrCode,
  DollarSign
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/billingCalculator';
import PrintableInvoice from '../components/PrintableInvoice';

const SalesInvoices = () => {
  const { sales } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        sale.invoiceNumber?.toLowerCase().includes(q) ||
        sale.customer?.name?.toLowerCase().includes(q) ||
        sale.customer?.phone?.includes(q);

      const matchStatus =
        statusFilter === 'ALL' ||
        (sale.calculation?.paymentStatus || 'PAID') === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [sales, searchQuery, statusFilter]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let cashTotal = 0;
    let upiTotal = 0;
    let totalItemsSold = 0;

    sales.forEach((s) => {
      const grand = s.calculation?.grandTotal || 0;
      totalRevenue += grand;
      totalItemsSold += (s.items || []).reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);

      s.payments?.forEach((p) => {
        if (p.method === 'Cash') cashTotal += (Number(p.amount) || 0);
        else if (p.method === 'UPI') upiTotal += (Number(p.amount) || 0);
      });
    });

    return {
      totalRevenue,
      billsCount: sales.length,
      cashTotal,
      upiTotal,
      totalItemsSold
    };
  }, [sales]);

  const handleOpenInvoice = (sale) => {
    setSelectedSaleForInvoice(sale);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-cream tracking-wide">Sales & Invoices Management</h1>
          <p className="text-xs text-cream/50 font-body mt-1">
            Official showroom counter transactions, GST invoices, and payment audits
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Total Showroom Sales</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {formatINR(stats.totalRevenue)}
            </div>
          </div>
        </div>

        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Receipt size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Invoices Generated</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {stats.billsCount} Bills
            </div>
          </div>
        </div>

        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Banknote size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">Cash Collections</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {formatINR(stats.cashTotal)}
            </div>
          </div>
        </div>

        <div className="bg-night border border-gold/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <QrCode size={24} />
          </div>
          <div>
            <div className="text-xs text-cream/50 font-body">UPI & Digital Collections</div>
            <div className="font-display text-xl text-cream font-bold mt-0.5">
              {formatINR(stats.upiTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-night-light/30 border border-gold/20 rounded-2xl p-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" size={16} />
          <input
            type="text"
            placeholder="Search by Invoice No., Customer Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-night border border-gold/20 rounded-xl text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold font-body"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex border border-gold/20 rounded-xl overflow-hidden text-xs font-body">
            {['ALL', 'PAID', 'PARTIAL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 transition-colors ${
                  statusFilter === st
                    ? 'bg-gold text-night font-bold'
                    : 'bg-night text-cream/60 hover:text-cream'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="bg-night-light/60 border-b border-gold/20 text-cream/60 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Invoice No.</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                <th className="py-3.5 px-4 font-semibold text-center">Items</th>
                <th className="py-3.5 px-4 font-semibold">Payment Mode</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Grand Total</th>
                <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-cream/40">
                    No sales invoices match your query.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const formattedDate = new Date(sale.date).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const paymentMethods = sale.payments?.map((p) => p.method).join(', ') || 'Direct';
                  const status = sale.calculation?.paymentStatus || 'PAID';

                  return (
                    <tr key={sale.id} className="hover:bg-gold/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-cream/70 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-display font-bold text-cream text-sm">
                          {sale.customer?.name || 'Walk-in Customer'}
                        </div>
                        {sale.customer?.phone && (
                          <div className="text-[11px] text-cream/50 font-mono">
                            {sale.customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-cream">
                        {sale.items?.length || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/20">
                          {paymentMethods}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-display text-sm font-bold text-cream font-mono">
                        {formatINR(sale.calculation?.grandTotal || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenInvoice(sale)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-xs font-body transition-colors"
                          title="View and Print Official Tax Invoice"
                        >
                          <Printer size={13} />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      <PrintableInvoice
        sale={selectedSaleForInvoice}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};

export default SalesInvoices;

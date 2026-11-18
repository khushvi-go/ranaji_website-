import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Save, 
  RotateCcw,
  User,
  Phone,
  DollarSign,
  Filter,
  Check
} from 'lucide-react';
import { rentalsAPI, productsAPI } from '../../services/api';
import { formatINR } from '../../utils/billingCalculator';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active Rental', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  RETURNED: { label: 'Returned', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  OVERDUE: { label: 'Overdue', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelled', color: 'bg-cream/10 text-cream/50 border-cream/20', icon: X }
};

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnNotes, setReturnNotes] = useState('Ensemble inspected. Garment in good condition. Deposit released.');

  // Form state for creating new rental
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: 'Udaipur',
    garmentName: '',
    size: '40 (L)',
    rentPrice: 3500,
    quantity: 1,
    securityDeposit: 1500,
    startDate: new Date().toISOString().split('T')[0],
    returnDateExpected: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await rentalsAPI.getAll();
      if (res.success) {
        setRentals(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
      toast.error('Failed to load rentals from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Filter rentals
  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        const rStatus = (r.status || 'ACTIVE').toUpperCase();
        if (statusFilter === 'OVERDUE') {
          const isOverdue = rStatus === 'ACTIVE' && new Date(r.returnDateExpected) < new Date();
          if (!isOverdue) return false;
        } else if (rStatus !== statusFilter) {
          return false;
        }
      }

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const num = (r.rentalNumber || '').toLowerCase();
        const cust = (r.customer?.name || '').toLowerCase();
        const phone = (r.customer?.phone || '').toLowerCase();
        const item = (r.items?.[0]?.name || '').toLowerCase();
        if (!num.includes(q) && !cust.includes(q) && !phone.includes(q) && !item.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [rentals, statusFilter, searchTerm]);

  // Compute metrics
  const activeCount = rentals.filter((r) => (r.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const overdueCount = rentals.filter((r) => {
    const s = (r.status || 'ACTIVE').toUpperCase();
    return s === 'ACTIVE' && new Date(r.returnDateExpected) < new Date();
  }).length;
  const returnedCount = rentals.filter((r) => (r.status || '').toUpperCase() === 'RETURNED').length;

  const handleCreateRental = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }
    if (!formData.garmentName.trim()) {
      toast.error('Garment name is required');
      return;
    }

    try {
      const res = await rentalsAPI.create(formData);
      if (res.success || res.data) {
        toast.success('Rental record created in showroom database!', { icon: '👑' });
        setIsAddModalOpen(false);
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          city: 'Udaipur',
          garmentName: '',
          size: '40 (L)',
          rentPrice: 3500,
          quantity: 1,
          securityDeposit: 1500,
          startDate: new Date().toISOString().split('T')[0],
          returnDateExpected: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: ''
        });
        fetchRentals();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create rental');
    }
  };

  const handleReturnRental = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;
    try {
      const id = selectedRental.id || selectedRental._id;
      const res = await rentalsAPI.updateStatus(id, 'RETURNED', returnNotes);
      if (res.success || res.data) {
        toast.success(`Rental ${selectedRental.rentalNumber} marked as RETURNED!`);
        setIsReturnModalOpen(false);
        setSelectedRental(null);
        fetchRentals();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update rental status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-cream tracking-wide">Showroom Rental Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30">
              Live Registry
            </span>
          </div>
          <p className="text-xs text-cream/50 font-body mt-1">
            Track active royal sherwani and poshak rentals, security deposits, expected return dates, and return inspections.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg font-body transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Rental Booking</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-night border border-gold/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-cream/50 uppercase tracking-wider">Total Bookings</p>
            <p className="font-display text-2xl text-cream font-bold mt-1">{rentals.length}</p>
          </div>
          <Shirt size={26} className="text-gold/40" />
        </div>

        <div className="p-4 rounded-xl bg-night border border-blue-500/25 flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-blue-400 uppercase tracking-wider">Active Rentals</p>
            <p className="font-display text-2xl text-blue-400 font-bold mt-1">{activeCount}</p>
          </div>
          <Clock size={26} className="text-blue-400/40" />
        </div>

        <div className="p-4 rounded-xl bg-night border border-rose-500/25 flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-rose-400 uppercase tracking-wider">Overdue Returns</p>
            <p className="font-display text-2xl text-rose-400 font-bold mt-1">{overdueCount}</p>
          </div>
          <AlertTriangle size={26} className="text-rose-400/40" />
        </div>

        <div className="p-4 rounded-xl bg-night border border-emerald-500/25 flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-emerald-400 uppercase tracking-wider">Completed Returns</p>
            <p className="font-display text-2xl text-emerald-400 font-bold mt-1">{returnedCount}</p>
          </div>
          <CheckCircle2 size={26} className="text-emerald-400/40" />
        </div>
      </div>

      {/* Controls: Filter Pills & Search */}
      <div className="p-4 rounded-2xl bg-night border border-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'ACTIVE', 'OVERDUE', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body uppercase tracking-wider transition-colors font-medium ${
                statusFilter === st
                  ? 'bg-gold text-night font-bold'
                  : 'bg-cream/5 text-cream/70 hover:text-cream'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rental #, patron or garment..."
            className="w-full pl-9 pr-4 py-2 bg-cream/5 border border-gold/20 rounded-xl text-cream placeholder-cream/30 text-xs font-body focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-cream/5 text-gold border-b border-gold/20 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Rental #</th>
                <th className="py-3.5 px-4 font-semibold">Patron & Contact</th>
                <th className="py-3.5 px-4 font-semibold">Garment Ensemble</th>
                <th className="py-3.5 px-4 font-semibold">Rental Duration</th>
                <th className="py-3.5 px-4 font-semibold text-right">Fee / Deposit</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-cream/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gold/70">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading showroom rental registry...</span>
                  </td>
                </tr>
              ) : filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-cream/50">
                    No rental bookings found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => {
                  const s = (r.status || 'ACTIVE').toUpperCase();
                  const isOverdue = s === 'ACTIVE' && new Date(r.returnDateExpected) < new Date();
                  const cfg = isOverdue ? STATUS_CONFIG.OVERDUE : (STATUS_CONFIG[s] || STATUS_CONFIG.ACTIVE);
                  const Icon = cfg.icon;

                  const garment = r.items?.[0] || { name: 'Royal Ensemble', size: 'Standard' };

                  return (
                    <tr key={r.id || r._id} className="hover:bg-cream/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold">
                        {r.rentalNumber || 'RNT-2026-0001'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-cream">{r.customer?.name || 'Showroom Guest'}</div>
                        <div className="text-[10px] text-cream/50">{r.customer?.phone || '+91 9999999999'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-cream">{garment.name}</div>
                        <div className="text-[10px] text-gold/80">Size: {garment.size || 'Standard'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-cream/50">Out:</span> {new Date(r.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px]">
                          <span className="text-cream/50">Due:</span>{' '}
                          <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-cream'}>
                            {new Date(r.returnDateExpected).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-cream">{formatINR(r.totalRentalFee || 0)}</div>
                        <div className="text-[10px] text-copper">Deposit: {formatINR(r.securityDeposit || 0)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          <Icon size={11} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s === 'ACTIVE' ? (
                          <button
                            onClick={() => {
                              setSelectedRental(r);
                              setIsReturnModalOpen(true);
                            }}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-medium transition-all"
                          >
                            Return Outfit
                          </button>
                        ) : (
                          <span className="text-[10px] text-cream/40 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Rental Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="bg-night border border-gold/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <h3 className="font-display text-xl text-cream">Create Royal Rental Booking</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-cream/50 hover:text-cream">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateRental} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Patron Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="e.g. Vikramaditya Singh"
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Garment Ensemble *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.garmentName}
                      onChange={(e) => setFormData({ ...formData, garmentName: e.target.value })}
                      placeholder="e.g. Maharaja Royal Sherwani"
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    >
                      <option value="38 (M)">38 (M)</option>
                      <option value="40 (L)">40 (L)</option>
                      <option value="42 (XL)">42 (XL)</option>
                      <option value="44 (XXL)">44 (XXL)</option>
                      <option value="Custom Fit">Custom Fit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Rental Fee (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.rentPrice}
                      onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Rental Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Expected Return Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.returnDateExpected}
                      onChange={(e) => setFormData({ ...formData, returnDateExpected: e.target.value })}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gold/20 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-cream/5 text-cream/70 rounded-xl text-xs font-body hover:bg-cream/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-copper"
                  >
                    Confirm Rental Booking
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Inspection Modal */}
      <AnimatePresence>
        {isReturnModalOpen && selectedRental && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsReturnModalOpen(false)}
          >
            <div
              className="bg-night border border-gold/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <h3 className="font-display text-lg text-cream">Return Inspection & Deposit Release</h3>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-cream/50 hover:text-cream">
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-cream/5 border border-gold/15 space-y-1 text-xs font-body">
                <p><span className="text-cream/50">Rental Number:</span> <span className="font-mono text-gold font-bold">{selectedRental.rentalNumber}</span></p>
                <p><span className="text-cream/50">Patron:</span> {selectedRental.customer?.name}</p>
                <p><span className="text-cream/50">Security Deposit to Release:</span> <span className="font-bold text-emerald-400">{formatINR(selectedRental.securityDeposit || 0)}</span></p>
              </div>

              <form onSubmit={handleReturnRental} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                    Inspection & Return Notes
                  </label>
                  <textarea
                    rows={3}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-4 py-2 bg-cream/5 text-cream/70 rounded-xl text-xs font-body hover:bg-cream/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400"
                  >
                    Confirm Return & Release Deposit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rentals;

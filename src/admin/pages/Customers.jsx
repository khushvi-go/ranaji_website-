import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Scissors, 
  ShoppingBag, 
  ChevronRight, 
  X,
  FileText
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/billingCalculator';
import toast from 'react-hot-toast';

const Customers = () => {
  const { customers, sales, addCustomer, updateCustomer } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Udaipur, Rajasthan',
    address: '',
    notes: '',
    measurements: {
      chest: '',
      waist: '',
      shoulder: '',
      sherwaniLength: '',
      sleeveLength: '',
      safaSize: '',
      notes: ''
    }
  });

  // Filtered list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.city && c.city.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  // Handle Save
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      toast.error('Customer name and phone are required');
      return;
    }

    const res = addCustomer(customerForm);
    if (res.success) {
      toast.success('Customer registered');
      setIsAddModalOpen(false);
      setCustomerForm({
        name: '',
        phone: '',
        email: '',
        city: 'Udaipur, Rajasthan',
        address: '',
        notes: '',
        measurements: { chest: '', waist: '', shoulder: '', sherwaniLength: '', sleeveLength: '', safaSize: '', notes: '' }
      });
    }
  };

  // Customer sales history
  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter(
      (s) => s.customer?.id === selectedCustomer.id || s.customer?.phone === selectedCustomer.phone
    );
  }, [sales, selectedCustomer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-cream tracking-wide">Showroom Customer Directory</h1>
          <p className="text-xs text-cream/50 font-body mt-1">
            Royal patron profiles, bespoke tailoring measurements, and purchase histories
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg font-body"
        >
          <UserPlus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-night-light/30 border border-gold/20 rounded-2xl p-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" size={16} />
          <input
            type="text"
            placeholder="Search customers by name, phone, or royal title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-night border border-gold/20 rounded-xl text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold font-body"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const hasMeasurements =
            cust.measurements && Object.keys(cust.measurements).length > 0;

          return (
            <div
              key={cust.id}
              className="bg-night border border-gold/20 hover:border-gold/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display font-bold text-lg">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-cream text-base group-hover:text-gold transition-colors">
                        {cust.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-cream/60 font-body mt-0.5">
                        <Phone size={12} className="text-gold/70" />
                        <span>{cust.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {cust.city && (
                  <div className="flex items-center gap-1.5 text-xs text-cream/50 font-body mt-3">
                    <MapPin size={12} className="text-gold/60" />
                    <span>{cust.city}</span>
                  </div>
                )}

                {cust.notes && (
                  <p className="mt-2.5 p-2 bg-night-light/50 border border-gold/10 rounded-lg text-xs text-cream/70 font-body italic">
                    "{cust.notes}"
                  </p>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="mt-4 pt-4 border-t border-gold/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-cream/40 font-body">
                    Total Spent
                  </div>
                  <div className="font-display font-bold text-gold text-sm">
                    {formatINR(cust.totalSpent || 0)}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-xs font-body transition-colors"
                >
                  <Scissors size={14} />
                  <span>Measurements</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CUSTOMER DETAILS & BESPOKE MEASUREMENTS DRAWER */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-night border border-gold/30 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display font-bold text-xl">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-cream">{selectedCustomer.name}</h2>
                    <p className="text-xs text-cream/60 font-body">
                      {selectedCustomer.phone} • {selectedCustomer.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-cream/40 hover:text-cream rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Bespoke Tailoring Measurements Profile */}
              <div className="mb-6">
                <h3 className="font-display text-sm text-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Scissors size={16} />
                  <span>Bespoke Royal Tailoring Profile</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-body text-xs">
                  <div className="p-3 bg-night-light/50 border border-gold/20 rounded-xl">
                    <span className="text-cream/50 block">Chest:</span>
                    <span className="font-bold text-cream font-mono text-sm">
                      {selectedCustomer.measurements?.chest || 'Not recorded'}
                    </span>
                  </div>

                  <div className="p-3 bg-night-light/50 border border-gold/20 rounded-xl">
                    <span className="text-cream/50 block">Waist:</span>
                    <span className="font-bold text-cream font-mono text-sm">
                      {selectedCustomer.measurements?.waist || 'Not recorded'}
                    </span>
                  </div>

                  <div className="p-3 bg-night-light/50 border border-gold/20 rounded-xl">
                    <span className="text-cream/50 block">Shoulder Width:</span>
                    <span className="font-bold text-cream font-mono text-sm">
                      {selectedCustomer.measurements?.shoulder || 'Not recorded'}
                    </span>
                  </div>

                  <div className="p-3 bg-night-light/50 border border-gold/20 rounded-xl">
                    <span className="text-cream/50 block">Sherwani Length:</span>
                    <span className="font-bold text-cream font-mono text-sm">
                      {selectedCustomer.measurements?.sherwaniLength || 'Not recorded'}
                    </span>
                  </div>

                  <div className="p-3 bg-night-light/50 border border-gold/20 rounded-xl">
                    <span className="text-cream/50 block">Sleeve Length:</span>
                    <span className="font-bold text-cream font-mono text-sm">
                      {selectedCustomer.measurements?.sleeveLength || 'Not recorded'}
                    </span>
                  </div>

                  <div className="p-3 bg-night-light/50 border border-gold/20 rounded-xl">
                    <span className="text-cream/50 block">Saafa / Paag Size:</span>
                    <span className="font-bold text-cream font-mono text-sm">
                      {selectedCustomer.measurements?.safaSize || 'Not recorded'}
                    </span>
                  </div>
                </div>

                {selectedCustomer.measurements?.notes && (
                  <div className="mt-3 p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-200 font-body">
                    Fitting Note: {selectedCustomer.measurements.notes}
                  </div>
                )}
              </div>

              {/* Past Transactions */}
              <div>
                <h3 className="font-display text-sm text-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>Showroom Purchase History ({customerSales.length})</span>
                </h3>

                {customerSales.length === 0 ? (
                  <p className="text-xs text-cream/40 font-body">No previous transactions on record.</p>
                ) : (
                  <div className="space-y-2">
                    {customerSales.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 bg-night-light/40 border border-gold/15 rounded-xl flex items-center justify-between text-xs font-body"
                      >
                        <div>
                          <span className="font-mono font-bold text-gold">{s.invoiceNumber}</span>
                          <span className="text-cream/40 mx-2">•</span>
                          <span className="text-cream/60">
                            {new Date(s.date).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="font-display font-bold text-cream">
                          {formatINR(s.calculation?.grandTotal || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD CUSTOMER MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-night border border-gold/30 rounded-2xl p-6 shadow-2xl my-8"
            >
              <h2 className="font-display text-lg text-cream mb-4 flex items-center gap-2">
                <UserPlus className="text-gold" size={20} />
                <span>Register Showroom Client Profile</span>
              </h2>

              <form onSubmit={handleCreateCustomer} className="space-y-4 font-body text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cream/70 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thakur Devendra Singh"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-xl text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-cream/70 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98290 12345"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-xl text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cream/70 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-xl text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-cream/70 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-night-light border border-gold/30 rounded-xl text-cream focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Optional Tailoring Measurements */}
                <div className="pt-2 border-t border-gold/20">
                  <span className="font-display text-xs text-gold uppercase tracking-wider block mb-2">
                    Bespoke Fitting Measurements (Optional)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Chest (e.g. 42 in)"
                      value={customerForm.measurements.chest}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          measurements: { ...customerForm.measurements, chest: e.target.value }
                        })
                      }
                      className="px-2.5 py-1.5 bg-night-light border border-gold/20 rounded-lg text-cream text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Waist (e.g. 36 in)"
                      value={customerForm.measurements.waist}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          measurements: { ...customerForm.measurements, waist: e.target.value }
                        })
                      }
                      className="px-2.5 py-1.5 bg-night-light border border-gold/20 rounded-lg text-cream text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Sherwani Length"
                      value={customerForm.measurements.sherwaniLength}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          measurements: { ...customerForm.measurements, sherwaniLength: e.target.value }
                        })
                      }
                      className="px-2.5 py-1.5 bg-night-light border border-gold/20 rounded-lg text-cream text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gold/20 text-cream/60 hover:text-cream rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gold text-night font-bold rounded-xl text-xs hover:bg-copper"
                  >
                    Save Client Profile
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

export default Customers;

import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  MessageSquare, 
  Image, 
  Briefcase, 
  Calendar, 
  Mail, 
  TrendingUp, 
  Users, 
  Eye, 
  ArrowRight,
  Receipt,
  Package,
  Banknote,
  QrCode,
  DollarSign,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/billingCalculator';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, link, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="relative group"
  >
    <Link to={link} className="block">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/20 to-copper/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-cream/5 border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-colors duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} className="text-cream" />
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="bg-gold text-night text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {badge}
              </span>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-body ${trendUp ? 'text-green-400' : 'text-crimson'}`}>
                <TrendingUp size={16} className={trendUp ? '' : 'rotate-180'} />
                <span>{trend}</span>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-2xl lg:text-3xl font-display text-cream mb-1 truncate">{value}</h3>
        <p className="text-cream/50 font-body text-sm">{label}</p>
      </div>
    </Link>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, description, link, color, highlight }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 4 }}
    className="group"
  >
    <Link 
      to={link} 
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
        highlight 
          ? 'bg-gold/15 border-gold/40 hover:bg-gold/25 shadow-lg' 
          : 'bg-cream/5 border border-gold/10 hover:border-gold/30 hover:bg-cream/[0.07]'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-cream" />
      </div>
      <div className="flex-1">
        <h4 className="font-body font-medium text-cream group-hover:text-gold transition-colors">{label}</h4>
        <p className="text-cream/40 text-sm font-body">{description}</p>
      </div>
      <ArrowRight size={18} className="text-cream/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { stats, bookings, contacts } = useAdmin();
  const { products } = useShop();
  const { sales, customers, inventoryMovements } = useBusiness();

  // Business calculations
  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.calculation?.grandTotal || 0), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 3).length;

  const showroomCards = [
    {
      icon: Receipt,
      label: 'Showroom POS Billing',
      value: 'Counter Register',
      badge: 'ACTIVE POS',
      color: 'bg-gold/20',
      link: '/admin/pos'
    },
    { 
      icon: DollarSign, 
      label: 'Total Showroom Sales', 
      value: formatINR(totalSalesRevenue), 
      trend: `${sales.length} Bills Generated`,
      trendUp: true,
      color: 'bg-emerald-500/20',
      link: '/admin/sales'
    },
    { 
      icon: Package, 
      label: 'Inventory Garments', 
      value: `${totalStockUnits} In Stock`,
      trend: lowStockCount > 0 ? `${lowStockCount} low stock` : 'Healthy',
      trendUp: lowStockCount === 0,
      color: 'bg-copper/20',
      link: '/admin/inventory'
    },
    { 
      icon: Users, 
      label: 'Showroom Royal Clients', 
      value: `${customers.length} Patrons`, 
      color: 'bg-purple-500/20',
      link: '/admin/customers'
    },
    { 
      icon: Calendar, 
      label: 'Wedding Bookings', 
      value: stats.totalBookings,
      trend: stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : null,
      trendUp: true,
      color: 'bg-green-500/20',
      link: '/admin/bookings'
    },
    { 
      icon: Mail, 
      label: 'Customer Inquiries', 
      value: stats.totalContacts,
      trend: stats.unreadContacts > 0 ? `${stats.unreadContacts} unread` : null,
      trendUp: true,
      color: 'bg-lake/20',
      link: '/admin/contacts'
    },
  ];

  const quickActions = [
    {
      icon: Receipt,
      label: 'Launch Showroom POS Counter',
      description: 'Quick barcode search, billing calculation, GST & printable invoice',
      link: '/admin/pos',
      color: 'bg-gold/30',
      highlight: true
    },
    {
      icon: DollarSign,
      label: 'Sales & Tax Invoices',
      description: 'Review counter bills, print receipts, and track payment audits',
      link: '/admin/sales',
      color: 'bg-emerald-500/20'
    },
    {
      icon: Package,
      label: 'Adjust Garment Stock',
      description: 'Log new workshop batch deliveries, returns, and inventory counts',
      link: '/admin/inventory',
      color: 'bg-copper/20'
    },
    {
      icon: Users,
      label: 'Register Showroom Client',
      description: 'Record customer contact and bespoke tailoring measurements',
      link: '/admin/customers',
      color: 'bg-purple-500/20'
    },
    {
      icon: ShoppingBag,
      label: 'Manage Outfits & Catalog',
      description: 'Edit groom, bridal, and ceremonial apparel collections',
      link: '/admin/collections',
      color: 'bg-gold/20'
    },
    {
      icon: Eye,
      label: 'Preview Online Storefront',
      description: 'Explore live public website and independent e-commerce catalog',
      link: '/shop',
      color: 'bg-lake/20'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Ranaji Showroom Management</h1>
          <p className="text-cream/50 font-body text-xs">
            Flagship Udaipur Counter POS, Multi-variant Inventory, Clients & Online Store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/pos"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-xl transition-all"
          >
            <Receipt size={16} />
            <span>Open POS Counter</span>
          </Link>
        </div>
      </motion.div>

      {/* Showroom & Business Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {showroomCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions (Col 2) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/10 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl text-cream">Operational Shortcuts</h3>
              <span className="text-xs text-cream/40 font-body">Quick counter actions</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <QuickAction key={action.label} {...action} />
              ))}
            </div>
          </motion.div>

          {/* Recent Counter Sales Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/10 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl text-cream">Recent Counter Transactions</h3>
                <p className="text-xs text-cream/40 font-body mt-0.5">Live showroom invoices and receipts</p>
              </div>
              <Link to="/admin/sales" className="text-gold text-xs font-body hover:underline flex items-center gap-1">
                <span>View All Invoices</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {sales.slice(0, 4).map((sale) => (
                <div
                  key={sale.id}
                  className="p-3.5 bg-night border border-gold/10 hover:border-gold/30 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-mono text-xs font-bold">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gold text-xs">{sale.invoiceNumber}</span>
                        <span className="text-cream font-display text-sm font-bold truncate max-w-[150px] sm:max-w-[220px]">
                          {sale.customer?.name || 'Walk-in Customer'}
                        </span>
                      </div>
                      <p className="text-[11px] text-cream/50 font-body">
                        {new Date(sale.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {sale.items?.length || 0} Garments
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-cream text-sm">
                      {formatINR(sale.calculation?.grandTotal || 0)}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      {sale.calculation?.paymentStatus || 'PAID'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Overview & Bookings */}
        <div className="space-y-6">
          {/* Quick Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gold/10 via-night to-copper/10 border border-gold/20 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="font-serif text-xl text-cream mb-4">Showroom Operations Status</h3>
            <div className="space-y-3 font-body text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">POS Register:</span>
                <span className="text-emerald-400 font-bold uppercase">Online (Counter 01)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">Total Outfits in Store:</span>
                <span className="text-cream font-bold font-mono">{products.length} Products ({totalStockUnits} Units)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">Low Stock Warnings:</span>
                <span className={`font-bold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lowStockCount} Garments
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">Wedding Consultation Bookings:</span>
                <span className="text-cream font-bold font-mono">{stats.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cream/60">Pending Inquiries:</span>
                <span className="text-gold font-bold font-mono">{stats.unreadContacts}</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Consultation Inquiries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream/5 border border-gold/10 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-cream">Recent Inquiries</h3>
              <Link to="/admin/contacts" className="text-gold text-xs hover:underline">
                View All
              </Link>
            </div>
            {contacts.length === 0 ? (
              <p className="text-xs text-cream/40 font-body py-4 text-center">No messages received yet</p>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 3).map((contact, idx) => (
                  <div key={contact._id || idx} className="p-3 bg-night rounded-xl border border-gold/10">
                    <div className="flex justify-between items-start">
                      <span className="font-display font-bold text-cream text-xs">{contact.name}</span>
                      <span className="text-[10px] text-cream/40">
                        {new Date(contact.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-cream/70 font-body mt-1 line-clamp-1">{contact.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

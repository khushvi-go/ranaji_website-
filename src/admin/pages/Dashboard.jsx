import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  DollarSign,
  AlertTriangle,
  Printer,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Shirt,
  Truck,
  FileText,
  BarChart3,
  SlidersHorizontal,
  UserCog,
  ScrollText,
  Check,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/billingCalculator';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Shared Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, link, badge, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className="relative group"
  >
    <Link to={link || '#'} className="block h-full">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/20 to-copper/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-cream/5 border border-gold/15 rounded-2xl p-5 hover:border-gold/40 transition-all duration-300 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} className="text-cream" />
            </div>
            <div className="flex items-center gap-2">
              {badge && (
                <span className="bg-gold text-night text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  {badge}
                </span>
              )}
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-body font-semibold ${trendUp ? 'text-emerald-400' : 'text-crimson'}`}>
                  <TrendingUp size={14} className={trendUp ? '' : 'rotate-180'} />
                  <span>{trend}</span>
                </div>
              )}
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-display text-cream mb-1 truncate">{value}</h3>
          <p className="text-cream/60 font-body text-xs">{label}</p>
        </div>
        {subtext && (
          <p className="text-[11px] text-cream/40 font-body mt-3 pt-2 border-t border-gold/10">
            {subtext}
          </p>
        )}
      </div>
    </Link>
  </motion.div>
);

// Quick Action Card Component
const QuickAction = ({ icon: Icon, label, description, link, color, highlight, onClick }) => {
  const content = (
    <div 
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
        highlight 
          ? 'bg-gradient-to-r from-gold/20 to-copper/20 border-gold/40 hover:brightness-110 shadow-lg' 
          : 'bg-cream/5 border-gold/10 hover:border-gold/30 hover:bg-cream/[0.08]'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-cream" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-body font-medium text-cream group-hover:text-gold transition-colors text-sm truncate">{label}</h4>
        <p className="text-cream/40 text-xs font-body line-clamp-1">{description}</p>
      </div>
      <ArrowRight size={16} className="text-cream/30 group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 3 }}
      className="group cursor-pointer"
    >
      {link ? (
        <Link to={link} className="block">{content}</Link>
      ) : (
        <div onClick={onClick}>{content}</div>
      )}
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { adminUser, role, isOwner, isManager, isCashier, isInventory, stats, bookings, contacts } = useAdmin();
  const { products, refreshShopData } = useShop();
  const { sales, customers, rentals, inventoryMovements, adjustStock } = useBusiness();

  // Online Orders State
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Quick Counter Lookup state (Cashier / POS shortcut)
  const [barcodeSearch, setBarcodeSearch] = useState('');
  
  // Quick Stock Adjustment modal state (Inventory Staff)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState(5);
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState('Workshop Batch Delivery');

  // Load online orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await ordersAPI.getAll();
        if (res.success) {
          setOnlineOrders(res.data || []);
        }
      } catch (err) {
        // Soft fallback for offline/demo mode
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Current Role resolution
  const currentRole = role || (adminUser?.role === 'admin' ? 'owner' : (adminUser?.role || 'owner'));

  // Metrics Calculations
  const metrics = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Sales calculations
    const todaySales = sales.filter((s) => new Date(s.date || s.createdAt) >= todayStart);
    const todayRevenue = todaySales.reduce((acc, s) => acc + (s.calculation?.grandTotal || 0), 0);
    const todayBillsCount = todaySales.length;

    const totalRevenue = sales.reduce((acc, s) => acc + (s.calculation?.grandTotal || 0), 0);
    const totalBillsCount = sales.length;

    // Inventory calculations
    const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const lowStockItems = products.filter((p) => (Number(p.stock) || 0) <= 3 && (Number(p.stock) || 0) > 0);
    const outOfStockItems = products.filter((p) => (Number(p.stock) || 0) <= 0);

    // Rentals calculations
    const activeRentals = rentals.filter((r) => r.status === 'ACTIVE').length;
    const overdueRentals = rentals.filter((r) => 
      r.status === 'OVERDUE' || (r.status === 'ACTIVE' && r.rentalPeriod?.endDate && new Date(r.rentalPeriod.endDate) < new Date())
    ).length;

    // Online Orders
    const pendingOrders = onlineOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

    return {
      todayRevenue,
      todayBillsCount,
      totalRevenue,
      totalBillsCount,
      totalStockUnits,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems,
      activeRentals,
      overdueRentals,
      pendingOrders,
      totalOrders: onlineOrders.length
    };
  }, [sales, products, rentals, onlineOrders]);

  // Handle Quick Barcode / Product Jump for Cashier
  const handleBarcodeSearch = (e) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;
    navigate(`/admin/pos?search=${encodeURIComponent(barcodeSearch.trim())}`);
  };

  // Quick Restock Action for Inventory staff
  const handleQuickRestock = async (product, addQty = 5) => {
    try {
      await adjustStock({
        productId: product.id || product._id,
        quantity: addQty,
        type: 'IN',
        reason: 'Quick Restock via Inventory Hub',
        performedBy: adminUser?.name || 'Inventory Staff'
      });
      await refreshShopData();
      toast.success(`Restocked +${addQty} units for "${product.title}"`);
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    }
  };

  // =========================================================================
  // VIEW 1: OWNER / SUPER ADMIN DASHBOARD
  // =========================================================================
  if (currentRole === 'owner' || currentRole === 'admin') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gold/15"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-gold/10 border border-gold/30 rounded-xl text-gold">
                <Crown size={22} />
              </span>
              <div>
                <h1 className="font-display text-2xl lg:text-3xl text-cream">Owner Executive Command Center</h1>
                <p className="text-cream/50 font-body text-xs">
                  Full visibility across Udaipur Flagship Showroom, POS registers, royal rentals, online orders & staff operations
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/pos"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg transition-all"
            >
              <Receipt size={16} />
              <span>Launch POS Counter</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center gap-2 px-4 py-2.5 bg-cream/10 hover:bg-cream/15 text-cream border border-gold/20 font-semibold text-xs rounded-xl transition-all"
            >
              <BarChart3 size={16} className="text-gold" />
              <span>Financial Reports</span>
            </Link>
          </div>
        </motion.div>

        {/* Real Metrics Grid (Owner Overview) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={DollarSign}
            label="Today's Showroom Revenue"
            value={formatINR(metrics.todayRevenue)}
            trend={`${metrics.todayBillsCount} bills today`}
            trendUp={metrics.todayBillsCount > 0}
            color="bg-emerald-500/20"
            link="/admin/sales"
            badge="TODAY"
            subtext={`Total All-time: ${formatINR(metrics.totalRevenue)} (${metrics.totalBillsCount} bills)`}
          />
          <StatCard
            icon={Truck}
            label="Online E-Commerce Orders"
            value={`${metrics.pendingOrders} Active`}
            trend={metrics.pendingOrders > 0 ? 'Fulfillment needed' : 'All dispatched'}
            trendUp={metrics.pendingOrders === 0}
            color="bg-lake/20"
            link="/admin/orders"
            badge="WEB STORE"
            subtext={`${metrics.totalOrders} total digital showroom orders`}
          />
          <StatCard
            icon={Shirt}
            label="Royal Outfit Rentals"
            value={`${metrics.activeRentals} Ensembles`}
            trend={metrics.overdueRentals > 0 ? `${metrics.overdueRentals} overdue` : 'On schedule'}
            trendUp={metrics.overdueRentals === 0}
            color="bg-purple-500/20"
            link="/admin/rentals"
            badge="RENTALS"
            subtext={`${rentals.length} total client rental contracts`}
          />
          <StatCard
            icon={Package}
            label="Garments Inventory Health"
            value={`${metrics.totalStockUnits} Units`}
            trend={metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low stock` : 'Fully stocked'}
            trendUp={metrics.lowStockCount === 0}
            color="bg-copper/20"
            link="/admin/inventory"
            subtext={`${products.length} distinct garments & royal ensembles`}
          />
        </div>

        {/* Secondary Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-night border border-gold/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-gold" size={20} />
              <div>
                <p className="text-xs text-cream/50">Wedding Consultations</p>
                <p className="text-base font-display text-cream font-bold">{stats.totalBookings} Total ({stats.pendingBookings} Pending)</p>
              </div>
            </div>
            <Link to="/admin/bookings" className="text-gold hover:underline text-xs">Manage &rarr;</Link>
          </div>

          <div className="p-4 bg-night border border-gold/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-purple-400" size={20} />
              <div>
                <p className="text-xs text-cream/50">Registered Patrons</p>
                <p className="text-base font-display text-cream font-bold">{customers.length} Showroom Clients</p>
              </div>
            </div>
            <Link to="/admin/customers" className="text-gold hover:underline text-xs">Directory &rarr;</Link>
          </div>

          <div className="p-4 bg-night border border-gold/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCog className="text-blue-400" size={20} />
              <div>
                <p className="text-xs text-cream/50">Staff & Identity Matrix</p>
                <p className="text-base font-display text-cream font-bold">RBAC Enforced</p>
              </div>
            </div>
            <Link to="/admin/staff" className="text-gold hover:underline text-xs">Governance &rarr;</Link>
          </div>
        </div>

        {/* Quick Access to All Admin Modules (Owner Full Directory) */}
        <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-lg text-cream">Central Operations Hub</h3>
              <p className="text-xs text-cream/40 font-body">Direct access across all 15+ showroom management modules</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded font-bold">
              Owner Unrestricted Access
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'POS Billing', icon: Receipt, link: '/admin/pos', color: 'text-gold' },
              { label: 'Sales Invoices', icon: DollarSign, link: '/admin/sales', color: 'text-emerald-400' },
              { label: 'Online Orders', icon: Truck, link: '/admin/orders', color: 'text-lake' },
              { label: 'Garment Stock', icon: Package, link: '/admin/inventory', color: 'text-copper' },
              { label: 'Showroom Rentals', icon: Shirt, link: '/admin/rentals', color: 'text-purple-400' },
              { label: 'Clients Directory', icon: Users, link: '/admin/customers', color: 'text-blue-400' },
              { label: 'Outfits Catalog', icon: ShoppingBag, link: '/admin/collections', color: 'text-amber-400' },
              { label: 'Appointments', icon: Calendar, link: '/admin/bookings', color: 'text-green-400' },
              { label: 'Enquiries', icon: Mail, link: '/admin/contacts', color: 'text-indigo-400' },
              { label: 'Approvals Queue', icon: ShieldCheck, link: '/admin/approvals', color: 'text-gold' },
              { label: 'Financial Reports', icon: BarChart3, link: '/admin/reports', color: 'text-emerald-400' },
              { label: 'Staff Governance', icon: UserCog, link: '/admin/staff', color: 'text-rose-400' },
            ].map((mod) => (
              <Link
                key={mod.label}
                to={mod.link}
                className="p-3 bg-night/80 hover:bg-gold/10 border border-gold/10 hover:border-gold/30 rounded-xl flex flex-col items-center text-center gap-2 transition-all group"
              >
                <mod.icon size={22} className={`${mod.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs text-cream font-body font-medium group-hover:text-gold transition-colors">{mod.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Showroom Transactions & Low Stock Alerts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Counter Transactions (2 cols) */}
          <div className="lg:col-span-2 bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg text-cream">Live Counter Invoices</h3>
                <p className="text-xs text-cream/40 font-body">Recent Udaipur showroom billing records</p>
              </div>
              <Link to="/admin/sales" className="text-gold text-xs hover:underline flex items-center gap-1 font-body">
                <span>All Invoices</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id || sale._id}
                  className="p-3.5 bg-night border border-gold/10 hover:border-gold/30 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-mono text-xs font-bold shrink-0">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gold text-xs">{sale.invoiceNumber}</span>
                        <span className="text-cream font-display text-sm font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                          {sale.customer?.name || 'Walk-in Customer'}
                        </span>
                      </div>
                      <p className="text-[11px] text-cream/50 font-body">
                        {new Date(sale.date || sale.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {sale.items?.length || 0} Garments • {sale.paymentMethod || 'CASH'}
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
          </div>

          {/* Low Stock Critical Alert Box (1 col) */}
          <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="font-serif text-lg text-cream">Stock Alerts</h3>
              </div>
              <Link to="/admin/inventory" className="text-gold text-xs hover:underline">
                View All
              </Link>
            </div>

            {metrics.lowStockItems.length === 0 && metrics.outOfStockItems.length === 0 ? (
              <div className="py-12 text-center text-cream/40 text-xs">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                All showroom garments adequately stocked
              </div>
            ) : (
              <div className="space-y-3">
                {[...metrics.outOfStockItems, ...metrics.lowStockItems].slice(0, 5).map((item) => (
                  <div key={item.id || item._id} className="p-3 bg-night rounded-xl border border-gold/10 flex items-center justify-between">
                    <div>
                      <p className="font-display text-cream font-semibold text-xs line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-cream/40 font-mono mt-0.5">{item.category?.name || 'Garment'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      (Number(item.stock) || 0) <= 0 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MANAGER OPERATIONS OVERVIEW
  // =========================================================================
  if (currentRole === 'manager') {
    return (
      <div className="space-y-8">
        {/* Manager Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gold/15"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl text-cream">Manager Operations Hub</h1>
              <p className="text-cream/50 font-body text-xs">
                Storefront management, operational audits, sales overrides, stock transfers & rental tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/approvals"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg transition-all"
            >
              <ShieldCheck size={16} />
              <span>Approvals Queue</span>
            </Link>
            <Link
              to="/admin/pos"
              className="flex items-center gap-2 px-4 py-2.5 bg-cream/10 hover:bg-cream/15 text-cream border border-gold/20 font-semibold text-xs rounded-xl transition-all"
            >
              <Receipt size={16} className="text-gold" />
              <span>Counter POS</span>
            </Link>
          </div>
        </motion.div>

        {/* Manager Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={DollarSign}
            label="Today's Store Sales"
            value={formatINR(metrics.todayRevenue)}
            trend={`${metrics.todayBillsCount} counter bills`}
            trendUp={metrics.todayBillsCount > 0}
            color="bg-emerald-500/20"
            link="/admin/sales"
            badge="ACTIVE SHIFT"
          />
          <StatCard
            icon={Shirt}
            label="Active Outfits on Rent"
            value={`${metrics.activeRentals} Ensembles`}
            trend={metrics.overdueRentals > 0 ? `${metrics.overdueRentals} Overdue` : 'All on time'}
            trendUp={metrics.overdueRentals === 0}
            color="bg-purple-500/20"
            link="/admin/rentals"
            badge="RENTALS"
          />
          <StatCard
            icon={AlertTriangle}
            label="Stock Discrepancy Alerts"
            value={`${metrics.lowStockCount} Items`}
            trend={metrics.outOfStockCount > 0 ? `${metrics.outOfStockCount} Out of stock` : 'Healthy stock'}
            trendUp={metrics.outOfStockCount === 0}
            color="bg-copper/20"
            link="/admin/inventory"
          />
          <StatCard
            icon={Calendar}
            label="Fitting & Consultations"
            value={`${stats.totalBookings} Bookings`}
            trend={stats.pendingBookings > 0 ? `${stats.pendingBookings} unassigned` : 'Handled'}
            trendUp={true}
            color="bg-green-500/20"
            link="/admin/bookings"
          />
        </div>

        {/* Manager Operational Action Shortcuts */}
        <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-cream">Supervisory Quick Actions</h3>
            <span className="text-xs text-cream/40 font-body">Floor manager authority</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={ShieldCheck}
              label="Review Approvals"
              description="Authorize custom price discounts, voids and overrides"
              link="/admin/approvals"
              color="bg-gold/30"
              highlight={true}
            />
            <QuickAction
              icon={Package}
              label="Stock Audit"
              description="Reconcile inventory, review recent movements and batch logs"
              link="/admin/inventory"
              color="bg-copper/20"
            />
            <QuickAction
              icon={Shirt}
              label="Rental Returns & Inspection"
              description="Inspect returned ensembles and authorize deposit releases"
              link="/admin/rentals"
              color="bg-purple-500/20"
            />
            <QuickAction
              icon={ScrollText}
              label="Showroom Audit Trail"
              description="Review immutable event logs and staff action history"
              link="/admin/audit-logs"
              color="bg-blue-500/20"
            />
          </div>
        </div>

        {/* Live Transactions & Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-cream">Recent Register Transactions</h3>
              <Link to="/admin/sales" className="text-gold text-xs hover:underline">View Sales Ledger &rarr;</Link>
            </div>
            <div className="space-y-3">
              {sales.slice(0, 4).map((sale) => (
                <div key={sale.id || sale._id} className="p-3.5 bg-night border border-gold/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt size={18} className="text-gold" />
                    <div>
                      <p className="font-display text-cream font-bold text-xs">{sale.invoiceNumber} &bull; {sale.customer?.name || 'Walk-in'}</p>
                      <p className="text-[11px] text-cream/50 font-body">{new Date(sale.date || sale.createdAt).toLocaleTimeString()} &bull; {sale.items?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-cream text-sm">{formatINR(sale.calculation?.grandTotal || 0)}</p>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{sale.calculation?.paymentStatus || 'PAID'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
            <h3 className="font-serif text-lg text-cream mb-4">Storefront Status</h3>
            <div className="space-y-3 font-body text-xs">
              <div className="flex justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">Active Cashier Registers:</span>
                <span className="text-emerald-400 font-bold">Counter 01 Online</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">Rentals Out on Hire:</span>
                <span className="text-purple-400 font-bold">{metrics.activeRentals} Ensembles</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gold/10">
                <span className="text-cream/60">Overdue Returns:</span>
                <span className={`font-bold ${metrics.overdueRentals > 0 ? 'text-crimson' : 'text-emerald-400'}`}>
                  {metrics.overdueRentals} Items
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Pending Inquiries:</span>
                <span className="text-gold font-bold">{stats.unreadContacts} Unread</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: CASHIER FAST COUNTER POS HUB
  // =========================================================================
  if (currentRole === 'cashier') {
    return (
      <div className="space-y-8">
        {/* Cashier Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/15"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Receipt size={22} />
            </span>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl text-cream">Cashier POS Counter Hub</h1>
              <p className="text-cream/50 font-body text-xs">
                Flagship counter billing, instant barcode scanner lookup, client registration & receipt printing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Counter 01 Ready
            </span>
          </div>
        </motion.div>

        {/* High-Speed Hero Action Box */}
        <div className="bg-gradient-to-r from-gold/15 via-night to-copper/15 border-2 border-gold/40 rounded-2xl p-6 lg:p-8 shadow-2xl">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <span className="px-3 py-1 bg-gold text-night font-black text-[10px] uppercase tracking-widest rounded-full">
              FAST CHECKOUT TERMINAL
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-cream">Launch Showroom POS Counter</h2>
            <p className="text-cream/70 font-body text-sm max-w-xl mx-auto">
              Scan barcode, add bespoke Rajputi outfits, calculate multi-tier GST, apply discounts, and generate thermal tax invoices.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/admin/pos"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold to-copper text-night font-bold text-sm uppercase tracking-wider rounded-xl hover:brightness-110 shadow-2xl transition-all flex items-center justify-center gap-3 transform hover:scale-105"
              >
                <Receipt size={20} />
                <span>OPEN FULL POS BILLING COUNTER</span>
              </Link>
              <Link
                to="/admin/rentals"
                className="w-full sm:w-auto px-6 py-4 bg-cream/10 hover:bg-cream/20 text-cream border border-gold/30 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Shirt size={18} className="text-gold" />
                <span>Book Rental Outfit</span>
              </Link>
            </div>

            {/* Quick Barcode / SKU Jump */}
            <form onSubmit={handleBarcodeSearch} className="pt-4 max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60" size={18} />
                <input
                  type="text"
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  placeholder="Scan barcode or enter SKU to bill directly..."
                  className="w-full bg-night/80 border border-gold/30 rounded-xl pl-12 pr-28 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gold/20 hover:bg-gold/30 text-gold text-xs font-bold rounded-lg transition-colors"
                >
                  Jump to POS
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Cashier Today's Shift Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-cream/5 border border-gold/15 rounded-2xl">
            <p className="text-xs text-cream/50 font-body">Today's Counter Collections</p>
            <p className="text-3xl font-display text-emerald-400 font-bold mt-1">{formatINR(metrics.todayRevenue)}</p>
            <p className="text-[11px] text-cream/40 font-body mt-2">Verified cash, UPI & card receipts</p>
          </div>

          <div className="p-5 bg-cream/5 border border-gold/15 rounded-2xl">
            <p className="text-xs text-cream/50 font-body">Counter Receipts Issued</p>
            <p className="text-3xl font-display text-cream font-bold mt-1">{metrics.todayBillsCount} Bills</p>
            <p className="text-[11px] text-cream/40 font-body mt-2">Average: {metrics.todayBillsCount > 0 ? formatINR(Math.round(metrics.todayRevenue / metrics.todayBillsCount)) : '₹0'} / bill</p>
          </div>

          <div className="p-5 bg-cream/5 border border-gold/15 rounded-2xl">
            <p className="text-xs text-cream/50 font-body">Patrons Serviced</p>
            <p className="text-3xl font-display text-gold font-bold mt-1">{customers.length} Clients</p>
            <Link to="/admin/customers" className="text-[11px] text-gold hover:underline font-body mt-2 inline-block">
              Lookup Patron Profile &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Counter Invoices */}
        <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg text-cream">Recent Invoices Issued</h3>
              <p className="text-xs text-cream/40 font-body">Reprint receipts or inspect counter sales</p>
            </div>
            <Link to="/admin/sales" className="text-gold text-xs hover:underline">View Sales Ledger &rarr;</Link>
          </div>

          <div className="space-y-3">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id || sale._id} className="p-3.5 bg-night border border-gold/10 hover:border-gold/30 rounded-xl flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-mono text-xs font-bold">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gold text-xs">{sale.invoiceNumber}</span>
                      <span className="text-cream font-display text-sm font-semibold">{sale.customer?.name || 'Walk-in'}</span>
                    </div>
                    <p className="text-[11px] text-cream/50 font-body">
                      {new Date(sale.date || sale.createdAt).toLocaleTimeString()} &bull; {sale.paymentMethod || 'CASH'} &bull; {sale.items?.length || 0} Garments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display font-bold text-cream text-sm">{formatINR(sale.calculation?.grandTotal || 0)}</p>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{sale.calculation?.paymentStatus || 'PAID'}</span>
                  </div>
                  <Link
                    to="/admin/sales"
                    className="p-2 bg-cream/10 hover:bg-gold/20 text-cream hover:text-gold rounded-lg transition-colors"
                    title="Print Receipt"
                  >
                    <Printer size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: INVENTORY STAFF WAREHOUSE HUB
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Inventory Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/15"
      >
        <div className="flex items-center gap-3">
          <span className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Package size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-cream">Inventory Stockroom Hub</h1>
            <p className="text-cream/50 font-body text-xs">
              Garment stock counts, workshop deliveries, barcode SKUs, low-stock alerts & catalog movements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/inventory"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg transition-all"
          >
            <Package size={16} />
            <span>Manage All Stock</span>
          </Link>
        </div>
      </motion.div>

      {/* Stockroom Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Package}
          label="Total Units in Stockroom"
          value={`${metrics.totalStockUnits} Units`}
          trend={`${products.length} Garments`}
          trendUp={true}
          color="bg-copper/20"
          link="/admin/inventory"
          badge="TOTAL STOCK"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Warnings"
          value={`${metrics.lowStockCount} Items`}
          trend={metrics.lowStockCount > 0 ? 'Restock advised' : 'Stock optimal'}
          trendUp={metrics.lowStockCount === 0}
          color="bg-amber-500/20"
          link="/admin/inventory"
          badge="CRITICAL"
        />
        <StatCard
          icon={AlertTriangle}
          label="Out of Stock (Zero Units)"
          value={`${metrics.outOfStockCount} Items`}
          trend={metrics.outOfStockCount > 0 ? 'Urgent workshop batch' : 'No empty racks'}
          trendUp={metrics.outOfStockCount === 0}
          color="bg-rose-500/20"
          link="/admin/inventory"
        />
        <StatCard
          icon={ShoppingBag}
          label="Outfit Catalog Items"
          value={`${products.length} SKUs`}
          color="bg-gold/20"
          link="/admin/collections"
          subtext="Ceremonial groom & bridal designs"
        />
      </div>

      {/* Low Stock Attention List with Quick Restock (+5 Units) */}
      <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={18} />
            <h3 className="font-serif text-lg text-cream">Urgent Stock Attention Items</h3>
          </div>
          <Link to="/admin/inventory" className="text-gold text-xs hover:underline">Full Stock Table &rarr;</Link>
        </div>

        {metrics.lowStockItems.length === 0 && metrics.outOfStockItems.length === 0 ? (
          <div className="py-10 text-center text-cream/40 text-xs">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
            Stockroom in perfect state! No items require replenishment.
          </div>
        ) : (
          <div className="divide-y divide-gold/10">
            {[...metrics.outOfStockItems, ...metrics.lowStockItems].map((item) => (
              <div key={item.id || item._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="font-display text-cream font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-cream/50 font-body">SKU: {item.sku || 'RNJ-SKU'} &bull; Category: {item.category?.name || 'Garment'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    (Number(item.stock) || 0) <= 0 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.stock} left
                  </span>

                  <button
                    onClick={() => handleQuickRestock(item, 5)}
                    className="px-3 py-1.5 bg-gold/15 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Quickly add 5 units to stock"
                  >
                    <Plus size={13} />
                    <span>+5 Units</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Inventory Movement Trail */}
      <div className="bg-cream/5 border border-gold/15 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ScrollText className="text-gold" size={18} />
            <h3 className="font-serif text-lg text-cream">Recent Stock Movements Log</h3>
          </div>
          <Link to="/admin/inventory" className="text-gold text-xs hover:underline">View All &rarr;</Link>
        </div>

        {inventoryMovements.length === 0 ? (
          <p className="text-xs text-cream/40 py-6 text-center">No inventory movement logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {inventoryMovements.slice(0, 5).map((movement, idx) => (
              <div key={movement.id || movement._id || idx} className="p-3 bg-night border border-gold/10 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-display text-cream font-semibold">{movement.productName || 'Garment'} &bull; {movement.reason}</p>
                  <p className="text-[10px] text-cream/40 font-body">{new Date(movement.createdAt || Date.now()).toLocaleString()} &bull; By {movement.performedBy || 'Staff'}</p>
                </div>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  movement.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {movement.type === 'IN' ? `+${movement.quantity}` : `-${movement.quantity}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

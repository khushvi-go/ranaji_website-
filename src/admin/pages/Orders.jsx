import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  X, 
  Truck, 
  Calendar,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { formatINR } from '../../utils/billingCalculator';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Fitting Scheduled at Udaipur Showroom': 'bg-gold/20 text-gold border-gold/40',
  'Order Placed': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  'Confirmed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'In Production': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  'Dispatched': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  'Delivered': 'bg-green-500/20 text-green-400 border-green-500/40',
  'Cancelled': 'bg-rose-500/20 text-rose-400 border-rose-500/40'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load customer orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const num = (o.orderNumber || '').toLowerCase();
        const name = (o.customerName || '').toLowerCase();
        const phone = (o.customerPhone || '').toLowerCase();
        const email = (o.customerEmail || '').toLowerCase();
        if (!num.includes(q) && !name.includes(q) && !phone.includes(q) && !email.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || 'Order Placed');
    setNewPaymentStatus(order.paymentStatus || 'Pending');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdatingStatus(true);
    try {
      const id = selectedOrder.id || selectedOrder._id;
      const res = await ordersAPI.updateStatus(id, newStatus, newPaymentStatus);
      if (res.success || res.data) {
        toast.success(`Order ${selectedOrder.orderNumber} updated!`);
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus
        }));
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-cream tracking-wide">Customer Orders & Online Catalog</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30">
              Live Orders
            </span>
          </div>
          <p className="text-xs text-cream/50 font-body mt-1">
            Track online customer orders, showroom fitting appointments, delivery dispatches, and custom tailoring requests.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 text-xs font-mono transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-night border border-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'Fitting Scheduled at Udaipur Showroom', 'Order Placed', 'Confirmed', 'In Production', 'Dispatched', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors font-medium whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-gold text-night font-bold'
                  : 'bg-cream/5 text-cream/70 hover:text-cream'
              }`}
            >
              {st === 'Fitting Scheduled at Udaipur Showroom' ? 'Showroom Fittings' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, customer or phone..."
            className="w-full pl-9 pr-4 py-2 bg-cream/5 border border-gold/20 rounded-xl text-cream placeholder-cream/30 text-xs font-body focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-cream/5 text-gold border-b border-gold/20 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order #</th>
                <th className="py-3.5 px-4 font-semibold">Customer & Contact</th>
                <th className="py-3.5 px-4 font-semibold">Items & Garments</th>
                <th className="py-3.5 px-4 font-semibold">Delivery Type</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Payment</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-cream/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gold/70">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading customer orders from MongoDB Atlas...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-cream/50">
                    No customer orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusClass = STATUS_COLORS[order.orderStatus] || 'bg-cream/10 text-cream/70 border-cream/20';
                  const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';

                  return (
                    <tr key={order.id || order._id} className="hover:bg-cream/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold">
                        {order.orderNumber || 'RNJ-2026-0001'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-cream">{order.customerName}</div>
                        <div className="text-[10px] text-cream/50">{order.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-medium text-cream">
                          {order.items?.map((i) => `${i.productName || i.name} (${i.size})`).join(', ') || 'Royal Garment'}
                        </div>
                        <div className="text-[10px] text-gold/80">{order.items?.length || 1} item(s)</div>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] tracking-wider font-semibold text-cream/70">
                        {order.deliveryType || 'Showroom Fitting'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-cream">
                        {formatINR(order.total || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPaid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="px-3 py-1 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-lg text-xs font-medium transition-colors"
                        >
                          View & Edit
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

      {/* Order Details & Status Update Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-night border border-gold/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <h3 className="font-display text-xl text-cream">Royal Order Details</h3>
                  <p className="font-mono text-gold text-xs font-bold">{selectedOrder.orderNumber}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-cream/50 hover:text-cream">
                  <X size={20} />
                </button>
              </div>

              {/* Customer Contact & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-cream/5 border border-gold/15 text-xs font-body">
                <div>
                  <span className="text-cream/50 block text-[10px] uppercase tracking-wider mb-1">Customer Information</span>
                  <p className="font-bold text-cream text-sm">{selectedOrder.customerName}</p>
                  <p className="text-cream/70 flex items-center gap-1.5 mt-1">
                    <Phone size={12} className="text-gold" />
                    <span>{selectedOrder.customerPhone}</span>
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-cream/70 flex items-center gap-1.5 mt-1">
                      <Mail size={12} className="text-gold" />
                      <span>{selectedOrder.customerEmail}</span>
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-cream/50 block text-[10px] uppercase tracking-wider mb-1">Fulfillment & Destination</span>
                  <p className="text-cream font-medium uppercase text-[11px]">{selectedOrder.deliveryType}</p>
                  {selectedOrder.shippingAddress?.address ? (
                    <p className="text-cream/70 mt-1 leading-relaxed">
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.postalCode}
                    </p>
                  ) : (
                    <p className="text-gold/80 italic mt-1">Showroom Trial & Fitting at Surajpole, Udaipur</p>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3">
                <span className="text-cream/50 block text-[10px] uppercase tracking-wider font-body">Ensemble Items</span>
                <div className="divide-y divide-gold/10 border border-gold/15 rounded-xl overflow-hidden bg-night-light/40">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs font-body">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-night shrink-0 border border-gold/20">
                          <img src={item.image || '/images/image.png'} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-cream">{item.productName || item.name}</p>
                          <p className="text-[10px] text-cream/50">Size: {item.size} &bull; Type: {item.orderType?.toUpperCase() || 'PURCHASE'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-cream">{formatINR((item.unitPrice || 0) * (item.quantity || 1))}</p>
                        <p className="text-[10px] text-cream/50">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-xl bg-cream/5 border border-gold/15 space-y-1.5 text-xs font-body">
                <div className="flex justify-between text-cream/70">
                  <span>Garments Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal || selectedOrder.total || 0)}</span>
                </div>
                {selectedOrder.securityDeposit > 0 && (
                  <div className="flex justify-between text-copper">
                    <span>Refundable Security Deposit:</span>
                    <span>+{formatINR(selectedOrder.securityDeposit)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gold font-bold text-sm pt-2 border-t border-gold/20">
                  <span>Grand Total:</span>
                  <span>{formatINR(selectedOrder.total || 0)}</span>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-gold/20">
                <h4 className="font-serif text-sm text-cream font-medium">Update Status & Progress</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Fulfillment Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    >
                      <option value="Fitting Scheduled at Udaipur Showroom">Fitting Scheduled at Udaipur Showroom</option>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Production">In Production</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-cream/70 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-cream/5 border border-gold/20 rounded-lg text-xs text-cream focus:outline-none focus:border-gold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid in Full</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-cream/5 text-cream/70 rounded-xl text-xs font-body hover:bg-cream/10"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-5 py-2 bg-gold text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-copper disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Save Order Changes'}
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

export default Orders;

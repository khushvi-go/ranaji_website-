import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, CheckCircle, XCircle, Clock, Trash2, User, Phone, Mail, Filter } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const Bookings = () => {
  const { bookings, updateBookingStatus, deleteBooking, stats } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.occasion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleStatusChange = (id, status) => {
    updateBookingStatus(id, status);
  };

  const handleDelete = (id) => {
    deleteBooking(id);
    setDeleteConfirm(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelled: 'bg-crimson/20 text-crimson border-crimson/30'
    };
    return colors[status] || 'bg-cream/10 text-cream border-cream/20';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      completed: CheckCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Bookings</h1>
          <p className="text-cream/50 font-body">Manage appointment requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg">
            <span className="text-gold font-body text-sm">{stats.pendingBookings} Pending</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-12 pr-8 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <Calendar className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/50 font-body">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking, index) => {
            const StatusIcon = getStatusIcon(booking.status);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-cream/5 border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                        <User className="text-gold" size={20} />
                      </div>
                      <div>
                        <h3 className="font-body font-medium text-cream">{booking.name}</h3>
                        <p className="text-cream/50 text-sm font-body">
                          {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4 mt-4 pl-1">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gold/50" />
                        <span className="text-cream/70 text-sm font-body">{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gold/50" />
                        <span className="text-cream/70 text-sm font-body capitalize">{booking.occasion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gold/50" />
                        <span className="text-cream/70 text-sm font-body capitalize">{booking.lookingFor}</span>
                      </div>
                    </div>
                    
                    {booking.date && (
                      <div className="mt-3 pl-1">
                        <span className="text-gold/70 text-sm font-body">
                          Preferred Date: {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {booking.message && (
                      <div className="mt-3 p-3 bg-night rounded-lg border border-gold/5">
                        <p className="text-cream/60 text-sm font-body">{booking.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-body capitalize border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                      <StatusIcon size={14} />
                      {booking.status}
                    </span>
                    
                    <select
                      value={booking.status}
                      onChange={e => handleStatusChange(booking.id, e.target.value)}
                      className="px-3 py-1.5 bg-cream/5 border border-gold/20 rounded-lg text-cream text-sm font-body focus:border-gold focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <button
                      onClick={() => setDeleteConfirm(booking)}
                      className="p-2 text-cream/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-crimson/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl text-cream mb-2">Delete Booking?</h3>
            <p className="text-cream/50 font-body mb-6">
              Are you sure you want to delete this booking from {deleteConfirm.name}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-6 py-3 bg-crimson text-cream rounded-lg hover:bg-crimson/80 transition-colors font-body font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

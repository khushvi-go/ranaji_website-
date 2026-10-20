import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Check, 
  RotateCcw,
  Filter
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import toast from 'react-hot-toast';

const TestimonialModal = ({ isOpen, onClose, testimonial, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    occasion: '',
    rating: 5,
    text: '',
    avatar: '',
    status: 'approved',
    isActive: true,
    ...testimonial
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-night border border-gold/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gold/20 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cream">
              {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </h2>
            <button onClick={onClose} className="text-cream/50 hover:text-cream transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="e.g., Udaipur"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Occasion / Attire</label>
                <input
                  type="text"
                  value={formData.occasion}
                  onChange={e => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="e.g., Groom - Dec 2026"
                />
              </div>
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-2 transition-colors"
                    >
                      <Star
                        size={24}
                        className={star <= formData.rating ? 'text-gold fill-gold' : 'text-cream/20'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-cream/70 text-sm font-body mb-2">Approval Status</label>
              <select
                value={formData.status || (formData.isActive ? 'approved' : 'pending')}
                onChange={e => {
                  const newStatus = e.target.value;
                  setFormData({
                    ...formData,
                    status: newStatus,
                    isActive: newStatus === 'approved'
                  });
                }}
                className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors [&>option]:bg-night [&>option]:text-cream"
              >
                <option value="approved">Approved (Visible to Public)</option>
                <option value="pending">Pending Approval (Hidden)</option>
                <option value="rejected">Rejected (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-cream/70 text-sm font-body mb-2">Testimonial *</label>
              <textarea
                required
                rows={4}
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors resize-none"
                placeholder="Customer testimonial..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gold text-night rounded-lg hover:bg-copper transition-colors font-body font-medium flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Testimonial
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Testimonials = () => {
  const { 
    testimonials, 
    addTestimonial, 
    updateTestimonial, 
    approveTestimonial, 
    rejectTestimonial, 
    deleteTestimonial,
    adminUser,
    refreshAdminData
  } = useAdmin();

  useEffect(() => {
    if (refreshAdminData) {
      refreshAdminData();
    }
  }, [refreshAdminData]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isOwnTestimonial = (item) => {
    if (!adminUser || !item) return false;
    const authorId = item.userId || (item.user && (item.user._id || item.user.id || item.user));
    return Boolean(authorId && String(authorId) === String(adminUser._id || adminUser.id));
  };

  const getStatus = (item) => item.status || (item.isActive ? 'approved' : 'pending');

  const pendingCount = testimonials.filter(t => getStatus(t) === 'pending').length;
  const approvedCount = testimonials.filter(t => getStatus(t) === 'approved').length;
  const rejectedCount = testimonials.filter(t => getStatus(t) === 'rejected').length;

  const filteredTestimonials = testimonials.filter(item => {
    const itemStatus = getStatus(item);
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.occasion || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSave = async (data) => {
    const avatar = data.avatar || data.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const dataWithAvatar = { ...data, avatar };
    
    if (editingTestimonial) {
      const res = await updateTestimonial(editingTestimonial._id || editingTestimonial.id, dataWithAvatar);
      if (res.success) {
        toast.success('Testimonial updated in MongoDB Atlas');
      } else {
        toast.error('Failed to update testimonial: ' + res.message);
      }
    } else {
      const res = await addTestimonial(dataWithAvatar);
      if (res.success) {
        toast.success('Testimonial created and saved to MongoDB Atlas');
      } else {
        toast.error('Failed to create testimonial: ' + res.message);
      }
    }
    setEditingTestimonial(null);
  };

  const handleApprove = async (testimonial) => {
    if (isOwnTestimonial(testimonial)) {
      toast.error('Self-approval forbidden. Another administrator or manager must review and approve your submission.');
      return;
    }
    const id = testimonial._id || testimonial.id;
    setActionLoadingId(id);
    const res = await approveTestimonial(id);
    setActionLoadingId(null);
    if (res.success) {
      toast.success(`Approved review from ${testimonial.name}. Now live on public site!`);
    } else {
      toast.error('Failed to approve review: ' + res.message);
    }
  };

  const handleReject = async (testimonial) => {
    const id = testimonial._id || testimonial.id;
    setActionLoadingId(id);
    const res = await rejectTestimonial(id);
    setActionLoadingId(null);
    if (res.success) {
      toast.success(`Review from ${testimonial.name} marked as rejected.`);
    } else {
      toast.error('Failed to reject review: ' + res.message);
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTestimonial({
      name: '',
      location: 'Udaipur, Rajasthan',
      occasion: 'Wedding Ensemble',
      rating: 5,
      text: '',
      status: 'approved',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const res = await deleteTestimonial(id);
    if (res.success) {
      toast.success('Testimonial deleted from MongoDB Atlas');
    } else {
      toast.error('Failed to delete testimonial: ' + res.message);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Testimonials & Reviews</h1>
          <p className="text-cream/50 font-body">Manage patron submissions, review pending feedback, and publish approved stories</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-night rounded-lg hover:bg-copper transition-colors font-body font-medium"
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      {/* Stats / Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gold/10 pb-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'all'
              ? 'bg-gold/20 text-gold border border-gold/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <span>All Reviews</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cream/10 text-cream/70">
            {testimonials.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <Clock size={14} className="text-amber-400" />
          <span>Pending Approval</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-night animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'approved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <CheckCircle size={14} className="text-emerald-400" />
          <span>Approved</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cream/10 text-cream/70">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'rejected'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <XCircle size={14} className="text-rose-400" />
          <span>Rejected</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cream/10 text-cream/70">
            {rejectedCount}
          </span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
        <input
          type="text"
          placeholder="Search reviews by patron name, text, occasion or location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <MessageSquare className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/70 font-body text-lg">No testimonials found</p>
          <p className="text-cream/40 font-body text-sm mt-1">
            {statusFilter === 'pending' 
              ? 'There are currently no reviews awaiting approval.' 
              : 'Try selecting a different filter or search term.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTestimonials.map((item, index) => {
            const currentStatus = getStatus(item);
            const isPending = currentStatus === 'pending';
            const isApproved = currentStatus === 'approved';
            const isRejected = currentStatus === 'rejected';
            const isLoading = actionLoadingId === (item._id || item.id);

            return (
              <motion.div
                key={item.id || item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-cream/5 border rounded-xl p-6 transition-all duration-300 relative flex flex-col justify-between ${
                  isPending 
                    ? 'border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-950/20' 
                    : isRejected
                    ? 'border-rose-500/20 opacity-80'
                    : 'border-gold/20 hover:border-gold/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center shrink-0 border border-gold/30">
                        <span className="text-gold font-display text-lg">{item.avatar || 'RP'}</span>
                      </div>
                      <div>
                        <h3 className="font-body font-medium text-cream flex items-center gap-2">
                          {item.name}
                        </h3>
                        <p className="text-cream/50 text-xs font-body">{item.location || 'Udaipur, Rajasthan'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock size={12} /> Pending Approval
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle size={12} /> Public / Live
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}

                      {/* Stars */}
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < (item.rating || 5) ? 'text-gold fill-gold' : 'text-cream/20'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-cream/80 font-body text-sm mb-4 leading-relaxed italic bg-night/30 p-3 rounded-lg border border-gold/10">
                    &ldquo;{item.text || item.content}&rdquo;
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                    <span className="text-cream/40 text-xs font-body">
                      {item.occasion || 'Wedding Ensemble'} • {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            disabled={isLoading || isOwnTestimonial(item)}
                            onClick={() => handleApprove(item)}
                            className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-body font-medium transition-all ${
                              isOwnTestimonial(item)
                                ? 'bg-zinc-800/50 text-zinc-500 border-zinc-700/40 cursor-not-allowed opacity-60'
                                : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-cream border border-emerald-500/40'
                            }`}
                            title={
                              isOwnTestimonial(item)
                                ? "Cannot approve your own submission (peer review required)"
                                : "Approve and make visible on public website"
                            }
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => handleReject(item)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-cream border border-rose-500/40 rounded-lg text-xs font-body font-medium transition-all"
                            title="Reject review"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleReject(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-cream/5 text-cream/50 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg text-xs font-body transition-colors"
                          title="Unpublish / Move to Rejected"
                        >
                          <RotateCcw size={13} />
                          Revoke
                        </button>
                      )}

                      {isRejected && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleApprove(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-cream rounded-lg text-xs font-body transition-colors"
                          title="Restore and Approve"
                        >
                          <Check size={13} />
                          Re-Approve
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-cream/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                        title="Edit testimonial"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        className="p-2 text-cream/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                        title="Delete testimonial"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testimonial={editingTestimonial}
        onSave={handleSave}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-crimson/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl text-cream mb-2">Delete Testimonial?</h3>
            <p className="text-cream/50 font-body mb-6">
              Are you sure you want to permanently delete this testimonial from <span className="text-cream font-medium">{deleteConfirm.name}</span>? This will remove it from MongoDB Atlas.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id || deleteConfirm.id)}
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

export default Testimonials;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Save, MessageSquare, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const TestimonialModal = ({ isOpen, onClose, testimonial, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    occasion: '',
    rating: 5,
    text: '',
    avatar: '',
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
                <label className="block text-cream/70 text-sm font-body mb-2">Occasion</label>
                <input
                  type="text"
                  value={formData.occasion}
                  onChange={e => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="e.g., Groom - Dec 2023"
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
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredTestimonials = testimonials.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (data) => {
    // Generate avatar from name if not provided
    const avatar = data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const dataWithAvatar = { ...data, avatar };
    
    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, dataWithAvatar);
    } else {
      addTestimonial(dataWithAvatar);
    }
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteTestimonial(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Testimonials</h1>
          <p className="text-cream/50 font-body">Manage customer reviews and testimonials</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-night rounded-lg hover:bg-copper transition-colors font-body font-medium"
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
        <input
          type="text"
          placeholder="Search testimonials..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <MessageSquare className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/50 font-body">No testimonials found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTestimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-cream/5 border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                    <span className="text-gold font-display text-lg">{item.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-body font-medium text-cream">{item.name}</h3>
                    <p className="text-cream/50 text-sm font-body">{item.location}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < item.rating ? 'text-gold fill-gold' : 'text-cream/20'}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-cream/70 font-body text-sm mb-4 line-clamp-3">{item.text}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                <span className="text-cream/40 text-xs font-body">{item.occasion}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-cream/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-2 text-cream/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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
              Are you sure you want to delete this testimonial from {deleteConfirm.name}?
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

export default Testimonials;

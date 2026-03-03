import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Save, ShoppingBag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { categories } from '../../data/collections';

const CollectionModal = ({ isOpen, onClose, collection, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'groom',
    price: '',
    priceType: 'Starting Price',
    description: '',
    image: '',
    available: ['rent', 'purchase'],
    ...collection
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const toggleAvailable = (type) => {
    setFormData(prev => ({
      ...prev,
      available: prev.available.includes(type)
        ? prev.available.filter(t => t !== type)
        : [...prev.available, type]
    }));
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
          className="bg-night border border-gold/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gold/20 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cream">
              {collection ? 'Edit Collection' : 'Add New Collection'}
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
                  placeholder="e.g., Royal Sherwani"
                />
              </div>
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Price *</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="e.g., ₹15,000"
                />
              </div>
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Price Type</label>
                <input
                  type="text"
                  value={formData.priceType}
                  onChange={e => setFormData({ ...formData, priceType: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="e.g., Starting Price"
                />
              </div>
            </div>

            <div>
              <label className="block text-cream/70 text-sm font-body mb-2">Image Path</label>
              <input
                type="text"
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                placeholder="/images/filename.jpg"
              />
              <p className="text-cream/30 text-xs mt-1">Enter the image path from the public folder</p>
            </div>

            <div>
              <label className="block text-cream/70 text-sm font-body mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors resize-none"
                placeholder="Describe the collection item..."
              />
            </div>

            <div>
              <label className="block text-cream/70 text-sm font-body mb-3">Available For</label>
              <div className="flex gap-4">
                {['rent', 'purchase'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleAvailable(type)}
                    className={`px-4 py-2 rounded-lg font-body text-sm capitalize transition-all ${
                      formData.available.includes(type)
                        ? 'bg-gold text-night'
                        : 'bg-cream/5 text-cream/50 border border-gold/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
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
                Save Collection
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Collections = () => {
  const { collections, addCollection, updateCollection, deleteCollection } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredCollections = collections.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = (data) => {
    if (editingCollection) {
      updateCollection(editingCollection.id, data);
    } else {
      addCollection(data);
    }
    setEditingCollection(null);
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteCollection(id);
    setDeleteConfirm(null);
  };

  const getCategoryColor = (category) => {
    const colors = {
      groom: 'bg-blue-500/20 text-blue-400',
      bride: 'bg-pink-500/20 text-pink-400',
      accessories: 'bg-gold/20 text-gold'
    };
    return colors[category] || 'bg-cream/10 text-cream';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Collections</h1>
          <p className="text-cream/50 font-body">Manage your product catalog</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-night rounded-lg hover:bg-copper transition-colors font-body font-medium"
        >
          <Plus size={18} />
          Add Collection
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.filter(c => c.id !== 'all').map(cat => {
          const count = collections.filter(c => c.category === cat.id).length;
          return (
            <div key={cat.id} className="bg-cream/5 border border-gold/10 rounded-xl p-4">
              <p className="text-cream/50 text-sm font-body">{cat.label}</p>
              <p className="text-2xl font-display text-cream">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <ShoppingBag className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/50 font-body">No collections found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-cream/5 border border-gold/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-cream/5 relative overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="text-gold/20" size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-body capitalize ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg text-cream mb-1 truncate">{item.name}</h3>
                <p className="text-gold font-body font-medium mb-2">{item.price}</p>
                <p className="text-cream/50 text-sm font-body line-clamp-2 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {item.available?.map(type => (
                      <span key={type} className="text-xs px-2 py-1 bg-cream/10 rounded text-cream/60 capitalize font-body">
                        {type}
                      </span>
                    ))}
                  </div>
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
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={editingCollection}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-crimson/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl text-cream mb-2">Delete Collection?</h3>
            <p className="text-cream/50 font-body mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
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

export default Collections;

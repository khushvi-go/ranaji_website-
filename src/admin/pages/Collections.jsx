import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, X, Save, ShoppingBag, 
  Crown, Sparkles, Calendar, Layers, Image as ImageIcon, AlertTriangle 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import toast from 'react-hot-toast';

const ALL_SIZES = ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)', 'Free Size', 'Custom Fit'];

const CollectionModal = ({ isOpen, onClose, collection, onSave, categories, getSubcategories }) => {
  const [formData, setFormData] = useState(() => {
    if (collection) {
      return {
        name: collection.name || '',
        category: collection.category || categories[0]?.id || 'groom',
        subcategory: collection.subcategory || '',
        price: collection.price || '',
        rentPrice: collection.rentPrice || '',
        priceType: collection.priceType || 'Starting Price',
        description: collection.description || '',
        image: collection.image || '/images/image.png',
        available: collection.available || ['rent', 'purchase'],
        sizes: collection.sizes || ['38 (M)', '40 (L)', '42 (XL)', 'Custom Fit'],
        fabric: collection.fabric || 'Royal Silk',
        color: collection.color || 'Royal Classic',
        stock: collection.stock ?? 5,
        featured: Boolean(collection.featured),
      };
    }
    return {
      name: '',
      category: categories[0]?.id || 'groom',
      subcategory: '',
      price: '',
      rentPrice: '',
      priceType: 'Starting Price',
      description: '',
      image: '/images/468620690_18338704426195142_1504528542693550564_n.jpg',
      available: ['rent', 'purchase'],
      sizes: ['38 (M)', '40 (L)', '42 (XL)', 'Custom Fit'],
      fabric: 'Raw Silk & Zari',
      color: 'Royal Maroon & Gold',
      stock: 5,
      featured: true,
    };
  });

  const availableSubcategories = useMemo(() => {
    return getSubcategories(formData.category);
  }, [formData.category, getSubcategories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    onSave(formData);
    onClose();
  };

  const toggleAvailable = (type) => {
    setFormData((prev) => ({
      ...prev,
      available: prev.available.includes(type)
        ? prev.available.filter((t) => t !== type)
        : [...prev.available, type]
    }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size]
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-night-light border border-gold/30 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-night">
            <h2 className="font-serif text-xl text-cream font-medium flex items-center gap-2">
              <ShoppingBag className="text-gold" size={20} />
              {collection ? 'Edit Royal Ensemble' : 'Add New Royal Ensemble'}
            </h2>
            <button onClick={onClose} className="text-cream/50 hover:text-gold transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Name */}
            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                placeholder="e.g., Royal Jodhpuri Bandhgala"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Subcategory / Style *
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                >
                  <option value="">Select a Subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  placeholder="18000"
                />
              </div>

              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Rental Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rentPrice}
                  onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Price Label / Type
                </label>
                <input
                  type="text"
                  value={formData.priceType}
                  onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  placeholder="Starting Price"
                />
              </div>
            </div>

            {/* Image Path & Preview */}
            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Image Path or URL *
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  placeholder="/images/image10.png"
                />
                {formData.image && (
                  <div className="w-12 h-14 rounded-lg overflow-hidden border border-gold/30 shrink-0 bg-night">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Fabric & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Fabric & Material
                </label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  placeholder="e.g., Banarasi Brocade with Gota"
                />
              </div>

              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Color / Styling
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                  placeholder="e.g., Imperial Red & Gold"
                />
              </div>
            </div>

            {/* Available For */}
            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Available For:
              </label>
              <div className="flex gap-4">
                {['rent', 'purchase'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleAvailable(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-body uppercase tracking-wider border transition-all ${
                      formData.available.includes(type)
                        ? 'bg-gold text-night font-bold border-gold shadow'
                        : 'bg-night text-cream/60 border-gold/20 hover:border-gold/40'
                    }`}
                  >
                    {type === 'rent' ? 'For Rent' : 'For Purchase'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Available Sizes:
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body border transition-all ${
                      formData.sizes?.includes(size)
                        ? 'bg-gold/25 border-gold text-gold font-bold'
                        : 'bg-night border-gold/15 text-cream/60 hover:text-cream'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none resize-none"
                placeholder="Royal craftsman description, embroidery details, styling recommendation..."
              />
            </div>

            {/* Stock & Featured Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  In Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-gold focus:ring-gold bg-night border-gold/30"
                />
                <label htmlFor="featuredToggle" className="text-cream text-sm font-body cursor-pointer">
                  Featured on Home Showcase
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gold/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gold/20 text-cream/70 hover:text-cream rounded-xl text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold hover:bg-copper text-night font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <Save size={14} />
                Save Item
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Collections = () => {
  const { products, categories, getSubcategories, addProduct, updateProduct, deleteProduct } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Subcategories for current category filter
  const filterSubcategories = useMemo(() => {
    return getSubcategories(selectedCategory);
  }, [selectedCategory, getSubcategories]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = item.name?.toLowerCase().includes(q);
        const mDesc = item.description?.toLowerCase().includes(q);
        const mSub = item.subcategory?.toLowerCase().includes(q);
        if (!mName && !mDesc && !mSub) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedSubcategory, search]);

  const handleOpenAdd = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingCollection(item);
    setIsModalOpen(true);
  };

  const handleSave = (itemData) => {
    if (editingCollection) {
      updateProduct(editingCollection._id || editingCollection.id, itemData);
      toast.success('Product updated successfully!', { icon: '👑' });
    } else {
      addProduct(itemData);
      toast.success('New product added to catalog!', { icon: '✨' });
    }
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    toast.success('Product removed from catalog');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-cream font-medium flex items-center gap-2.5">
            <ShoppingBag className="text-gold" size={28} />
            Collections & Products
          </h1>
          <p className="text-cream/50 text-sm font-body mt-1">
            Manage your royal catalog, rental prices, purchase rates, and styles
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-copper text-night font-body text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-night-light p-4 rounded-2xl border border-gold/20">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 bg-night border border-gold/20 rounded-xl text-cream text-xs focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('all');
            }}
            className="w-full px-4 py-2 bg-night border border-gold/20 rounded-xl text-cream text-xs focus:border-gold focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="w-full px-4 py-2 bg-night border border-gold/20 rounded-xl text-cream text-xs focus:border-gold focus:outline-none"
          >
            <option value="all">All Subcategories</option>
            {filterSubcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-night-light border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-night border-b border-gold/20 text-cream/60 text-xs font-body uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category & Style</th>
                <th className="py-4 px-6">Purchase Price</th>
                <th className="py-4 px-6">Rental Price</th>
                <th className="py-4 px-6">Available</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-xs font-body">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-cream/40">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gold/5 transition-colors">
                    {/* Product */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-lg overflow-hidden border border-gold/20 bg-night shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-sm text-cream font-medium truncate">
                            {p.name}
                          </div>
                          {p.featured && (
                            <span className="inline-block mt-0.5 px-2 py-0.2 bg-gold/20 text-gold text-[10px] rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Subcategory */}
                    <td className="py-4 px-6">
                      <span className="capitalize text-gold font-medium block">
                        {p.category}
                      </span>
                      {p.subcategory && (
                        <span className="text-cream/50 text-[11px] block">{p.subcategory}</span>
                      )}
                    </td>

                    {/* Purchase Price */}
                    <td className="py-4 px-6 font-serif text-cream font-bold">
                      ₹{Number(p.price)?.toLocaleString('en-IN')}
                    </td>

                    {/* Rental Price */}
                    <td className="py-4 px-6 font-serif text-gold font-medium">
                      {p.rentPrice ? `₹${Number(p.rentPrice).toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Available */}
                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        {p.available?.map((a) => (
                          <span
                            key={a}
                            className={`px-2 py-0.5 rounded text-[10px] capitalize ${
                              a === 'rent'
                                ? 'bg-blue-950/70 text-blue-300 border border-blue-500/30'
                                : 'bg-gold/20 text-gold border border-gold/30'
                            }`}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] ${
                          (p.stock ?? 5) > 0
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950/70 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {(p.stock ?? 5) > 0 ? `${p.stock ?? 5} in stock` : 'Out of stock'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p._id || p.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-night border border-red-500/40 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-serif text-lg text-cream">Delete this Product?</h3>
              <p className="text-xs text-cream/60">
                Are you sure you want to remove this royal ensemble from the showroom catalog?
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-gold/20 text-cream/70 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase shadow-lg"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={editingCollection}
        onSave={handleSave}
        categories={categories}
        getSubcategories={getSubcategories}
      />
    </div>
  );
};

export default Collections;

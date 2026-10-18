import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, X, Save, Tags, Crown, 
  Sparkles, Layers, Image as ImageIcon, Check, AlertTriangle 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import toast from 'react-hot-toast';

// Modal for Add / Edit Category
const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image: category?.image || '/images/image.png',
    subcategories: category?.subcategories || [],
    isActive: category?.isActive !== false,
  });

  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');

  if (!isOpen) return null;

  const handleAddSubcategoryTag = () => {
    const val = newSubcategoryInput.trim();
    if (!val) return;
    if (formData.subcategories.includes(val)) {
      toast.error('Subcategory already exists');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, val]
    }));
    setNewSubcategoryInput('');
  };

  const handleRemoveSubcategoryTag = (subName) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== subName)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-night-light border border-gold/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-night">
            <h2 className="font-serif text-xl text-cream font-medium flex items-center gap-2">
              <Tags className="text-gold" size={20} />
              {category ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button onClick={onClose} className="text-cream/50 hover:text-gold transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }));
                  }}
                  placeholder="e.g., Royal Turban & Safas"
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                  Identifier / Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., safas"
                  className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Image Path or URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/468620690_18338704426195142_1504528542693550564_n.jpg"
                  className="flex-1 px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                />
                {formData.image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gold/30 shrink-0 bg-night">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category collection and cultural significance..."
                className="w-full px-4 py-2.5 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none resize-none"
              />
            </div>

            {/* Subcategories Tag Builder */}
            <div className="space-y-2">
              <label className="block text-cream/70 text-xs font-body uppercase tracking-wider">
                Subcategories / Outfit Types
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubcategoryInput}
                  onChange={(e) => setNewSubcategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubcategoryTag();
                    }
                  }}
                  placeholder="Type subcategory name & press enter (e.g. Achkan)"
                  className="flex-1 px-4 py-2 bg-night border border-gold/20 rounded-xl text-cream text-sm focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubcategoryTag}
                  className="px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold hover:text-night text-xs font-bold uppercase transition-all"
                >
                  Add
                </button>
              </div>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-night/60 rounded-xl border border-gold/15 min-h-[50px]">
                {formData.subcategories.length === 0 ? (
                  <span className="text-xs text-cream/40 italic">
                    No subcategories added yet. Add items like "Sherwani", "Jodhpuri Suit", etc.
                  </span>
                ) : (
                  formData.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-lg text-gold text-xs"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategoryTag(sub)}
                        className="text-gold/60 hover:text-red-400 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="catActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-gold focus:ring-gold bg-night border-gold/30"
              />
              <label htmlFor="catActive" className="text-cream text-sm font-body cursor-pointer">
                Publish Category (Visible in Royal Store & Filters)
              </label>
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
                Save Category
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Categories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSave = (catData) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, catData);
      toast.success('Category updated successfully!', { icon: '👑' });
    } else {
      addCategory(catData);
      toast.success('New category added to showroom!', { icon: '✨' });
    }
  };

  const handleDelete = (id) => {
    deleteCategory(id);
    setDeleteConfirmId(null);
    toast.success('Category deleted');
  };

  const totalSubcategories = categories.reduce(
    (sum, c) => sum + (c.subcategories?.length || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-cream font-medium flex items-center gap-2.5">
            <Tags className="text-gold" size={28} />
            Categories & Subcategories
          </h1>
          <p className="text-cream/50 text-sm font-body mt-1">
            Manage your showroom categories, styles, and outfit subcategories
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-copper text-night font-body text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-night-light border border-gold/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-2xl font-serif text-cream font-bold">{categories.length}</div>
            <div className="text-xs text-cream/50 font-body">Main Categories</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-night-light border border-gold/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Tags size={22} />
          </div>
          <div>
            <div className="text-2xl font-serif text-cream font-bold">{totalSubcategories}</div>
            <div className="text-xs text-cream/50 font-body">Subcategories / Styles</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-night-light border border-gold/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Crown size={22} />
          </div>
          <div>
            <div className="text-2xl font-serif text-cream font-bold">{products.length}</div>
            <div className="text-xs text-cream/50 font-body">Linked Products</div>
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.id).length;
          return (
            <motion.div
              key={cat.id}
              layout
              className="bg-night-light border border-gold/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gold/50 transition-all shadow-xl group"
            >
              {/* Category Card Header with Image */}
              <div className="relative h-44 overflow-hidden bg-night">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-body uppercase tracking-wider backdrop-blur-md ${
                      cat.isActive
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-950/80 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-mono text-gold/80 block uppercase tracking-widest">
                    Slug: {cat.slug || cat.id}
                  </span>
                  <h3 className="font-serif text-xl text-cream font-medium truncate">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-cream/60 font-body leading-relaxed line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>

                {/* Subcategories list */}
                <div>
                  <div className="flex items-center justify-between text-xs text-cream/50 mb-2">
                    <span className="uppercase tracking-wider font-semibold">Subcategories</span>
                    <span>{cat.subcategories?.length || 0} styles</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      cat.subcategories.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 bg-night border border-gold/20 rounded-md text-[11px] text-cream/80"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-cream/30 italic">No subcategories</span>
                    )}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="pt-3 border-t border-gold/15 flex items-center justify-between">
                  <span className="text-xs text-gold font-body font-medium">
                    {productCount} {productCount === 1 ? 'Product' : 'Products'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cat.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
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
              <h3 className="font-serif text-lg text-cream">Delete this Category?</h3>
              <p className="text-xs text-cream/60">
                Are you sure you want to remove this category? Products assigned to it may need reassignment.
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

      {/* Edit/Add Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={handleSave}
      />
    </div>
  );
};

export default Categories;

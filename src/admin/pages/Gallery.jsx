import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Save, Image, Grid, LayoutList } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { galleryCategories } from '../../data/gallery';

const GalleryModal = ({ isOpen, onClose, image, onSave }) => {
  const [formData, setFormData] = useState({
    src: '',
    category: 'groom',
    title: '',
    aspectRatio: 'portrait',
    ...image
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
              {image ? 'Edit Image' : 'Add Image'}
            </h2>
            <button onClick={onClose} className="text-cream/50 hover:text-cream transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-cream/70 text-sm font-body mb-2">Image Path *</label>
              <input
                type="text"
                required
                value={formData.src}
                onChange={e => setFormData({ ...formData, src: e.target.value })}
                className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                placeholder="/images/filename.jpg"
              />
              <p className="text-cream/30 text-xs mt-1">Enter the image path from the public folder</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                  placeholder="Image title"
                />
              </div>
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
                >
                  {galleryCategories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-cream/70 text-sm font-body mb-3">Aspect Ratio</label>
              <div className="flex gap-4">
                {['portrait', 'landscape'].map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setFormData({ ...formData, aspectRatio: ratio })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-body text-sm capitalize transition-all ${
                      formData.aspectRatio === ratio
                        ? 'bg-gold text-night'
                        : 'bg-cream/5 text-cream/50 border border-gold/20'
                    }`}
                  >
                    <div className={`border-2 border-current rounded ${
                      ratio === 'portrait' ? 'w-3 h-4' : 'w-4 h-3'
                    }`} />
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {formData.src && (
              <div>
                <label className="block text-cream/70 text-sm font-body mb-2">Preview</label>
                <div className="aspect-video bg-cream/5 rounded-lg overflow-hidden border border-gold/10">
                  <img
                    src={formData.src}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

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
                Save Image
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Gallery = () => {
  const { gallery, addGalleryImage, updateGalleryImage, deleteGalleryImage } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredImages = gallery.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = (data) => {
    if (editingImage) {
      updateGalleryImage(editingImage.id, data);
    } else {
      addGalleryImage(data);
    }
    setEditingImage(null);
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingImage(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteGalleryImage(id);
    setDeleteConfirm(null);
  };

  const getCategoryColor = (category) => {
    const colors = {
      groom: 'bg-blue-500/20 text-blue-400',
      bride: 'bg-pink-500/20 text-pink-400',
      group: 'bg-purple-500/20 text-purple-400',
      accessories: 'bg-gold/20 text-gold'
    };
    return colors[category] || 'bg-cream/10 text-cream';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Gallery</h1>
          <p className="text-cream/50 font-body">Manage your gallery images</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-night rounded-lg hover:bg-copper transition-colors font-body font-medium"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors"
          >
            {galleryCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <div className="flex bg-cream/5 border border-gold/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-gold/20 text-gold' : 'text-cream/50 hover:text-cream'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-cream/50 hover:text-cream'}`}
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryCategories.filter(c => c.id !== 'all').map(cat => {
          const count = gallery.filter(g => g.category === cat.id).length;
          return (
            <div key={cat.id} className="bg-cream/5 border border-gold/10 rounded-xl p-4">
              <p className="text-cream/50 text-sm font-body">{cat.label}</p>
              <p className="text-2xl font-display text-cream">{count}</p>
            </div>
          );
        })}
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <Image className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/50 font-body">No images found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className={`group relative bg-cream/5 border border-gold/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300 ${
                item.aspectRatio === 'portrait' ? 'row-span-2' : ''
              }`}
            >
              <div className={`relative ${item.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'} bg-cream/5`}>
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { 
                    e.target.style.display = 'none'; 
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden absolute inset-0 items-center justify-center">
                  <Image className="text-gold/20" size={32} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-body text-sm text-cream truncate">{item.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-body capitalize ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 bg-cream/10 rounded text-cream hover:bg-gold hover:text-night transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        className="p-1.5 bg-cream/10 rounded text-cream hover:bg-crimson transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredImages.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 bg-cream/5 border border-gold/10 rounded-xl p-4 hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-24 h-16 bg-cream/5 rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-medium text-cream truncate">{item.title}</h3>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-body capitalize ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
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
            </motion.div>
          ))}
        </div>
      )}

      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        image={editingImage}
        onSave={handleSave}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-crimson/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl text-cream mb-2">Delete Image?</h3>
            <p className="text-cream/50 font-body mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"?
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

export default Gallery;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Crown, Sparkles } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import { useAdmin } from '../../context/AdminContext';

const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'groom', label: 'Groom' },
  { id: 'bride', label: 'Bride' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'group', label: 'Baraat & Family' },
];

const GallerySection = () => {
  const { gallery, loading } = useAdmin();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredImages = activeCategory === 'all'
    ? gallery
    : gallery.filter(img => (img.category || '').toLowerCase() === activeCategory.toLowerCase());

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  // Bento grid layout configuration
  const getBentoClass = (index) => {
    const patterns = [
      'col-span-2 row-span-2', // Large
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-2', // Tall
      'col-span-2 row-span-1', // Wide
    ];
    return patterns[index % 4];
  };

  const getAspectClass = (index) => {
    const patterns = [
      'aspect-square',      // Large square
      'aspect-[3/4]',       // Portrait
      'aspect-[3/4]',       // Portrait
      'aspect-[2/1]',       // Landscape
    ];
    return patterns[index % 4];
  };

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-night overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(222,160,68,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Our Portfolio"
          title="The Royal Lookbook"
        />

        {/* Filter Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {galleryCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 font-body text-sm tracking-wider uppercase transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gold text-night'
                  : 'border border-gold/30 text-cream/70 hover:text-gold hover:border-gold'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* Loading and Empty States */}
        {loading && gallery.length === 0 ? (
          <div className="mt-16 text-center text-gold/60 font-body py-12">
            Loading royal lookbook gallery from MongoDB Atlas...
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="mt-16 text-center text-cream/50 font-body py-12">
            No images in this category yet. Check back soon for new royal photo showcases.
          </div>
        ) : (
          /* Bento Grid */
          <motion.div 
            layout
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.slice(0, 12).map((image, index) => (
                <motion.div
                  key={image.id || image._id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl ${getBentoClass(index)}`}
                  onClick={() => openLightbox(index)}
                >
                  <div className={`relative w-full h-full ${getAspectClass(index)}`}>
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    
                    {/* Corner Decorations */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-gold/0 group-hover:border-gold/60 transition-all duration-500" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-gold/0 group-hover:border-gold/60 transition-all duration-500" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-gold/0 group-hover:border-gold/60 transition-all duration-500" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-gold/0 group-hover:border-gold/60 transition-all duration-500" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-night/80 backdrop-blur-sm border border-gold/30 text-gold text-xs font-serif tracking-wider uppercase rounded-full">
                          {image.category}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center text-gold">
                          <Sparkles size={14} />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif text-lg text-cream mb-1">{image.title}</h4>
                        <p className="font-body text-xs text-gold/80">Click to expand</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && filteredImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-cream/70 hover:text-gold transition-colors z-50"
            >
              <X size={32} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-cream/70 hover:text-gold transition-colors p-2 z-50"
            >
              <ChevronLeft size={40} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-cream/70 hover:text-gold transition-colors p-2 z-50"
            >
              <ChevronRight size={40} />
            </button>

            <motion.div
              key={currentImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-gold/30"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[currentImageIndex]?.src}
                alt={filteredImages[currentImageIndex]?.title}
                className="w-full h-full object-contain max-h-[80vh]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-night/80 backdrop-blur-sm p-4 border-t border-gold/20 flex justify-between items-center">
                <div>
                  <h4 className="font-serif text-lg text-cream">
                    {filteredImages[currentImageIndex]?.title}
                  </h4>
                  <p className="font-body text-xs text-gold/80 uppercase tracking-wider">
                    {filteredImages[currentImageIndex]?.category}
                  </p>
                </div>
                <span className="font-body text-xs text-cream/50">
                  {currentImageIndex + 1} / {filteredImages.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;

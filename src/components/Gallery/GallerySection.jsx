import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Crown, Sparkles } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import { galleryImages, galleryCategories } from '../../data/gallery';

const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredImages = activeCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory);

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

        {/* Bento Grid */}
        <motion.div 
          layout
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.slice(0, 12).map((image, index) => (
              <motion.div
                key={image.id}
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
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      className="transform transition-all duration-500"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-gold" />
                        <span className="text-gold text-xs uppercase tracking-wider font-body">
                          {image.category}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg md:text-xl text-cream leading-tight">
                        {image.title}
                      </h3>
                    </motion.div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-copper/10" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>


      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-night/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-cream hover:text-gold transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-cream hover:text-gold transition-colors z-10"
            >
              <ChevronLeft size={48} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-cream hover:text-gold transition-colors z-10"
            >
              <ChevronRight size={48} />
            </button>

            {/* Image */}
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl max-h-[80vh] px-20"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[currentImageIndex]?.src}
                alt={filteredImages[currentImageIndex]?.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <p className="text-center font-serif text-xl text-cream mt-4">
                {filteredImages[currentImageIndex]?.title}
              </p>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-cream/60">
              {currentImageIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Crown, 
  Sparkles, 
  Camera, 
  Calendar, 
  Eye,
  MessageCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import SectionHeading from '../components/UI/SectionHeading';
import { useAdmin } from '../context/AdminContext';
import { useSettings } from '../context/SettingsContext';

const galleryCategories = [
  { id: 'all', label: 'All Lookbooks' },
  { id: 'groom', label: 'Royal Grooms' },
  { id: 'bride', label: 'Bridal Poshaks' },
  { id: 'accessories', label: 'Turbans & Accessories' },
  { id: 'group', label: 'Baraat & Entourage' },
];

const GalleryPage = () => {
  const { gallery, loading } = useAdmin();
  const { settings } = useSettings();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Filter gallery images
  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return gallery;
    return gallery.filter((img) => {
      const cat = (img.category || '').toLowerCase();
      return cat === activeCategory.toLowerCase();
    });
  }, [gallery, activeCategory]);

  const activeImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  const handleNext = (e) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && filteredImages.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && filteredImages.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

  const cleanWaNumber = (settings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  return (
    <div className="bg-night text-cream min-h-screen selection:bg-gold selection:text-night">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-24">
        {/* Editorial Header */}
        <section className="relative py-12 md:py-20 border-b border-gold/15 bg-gradient-to-b from-night-light/40 via-night to-night">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-body text-cream/50 mb-6">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gold">Gallery</span>
            </div>

            <div className="max-w-3xl">
              <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Camera size={15} />
                <span>Udaipur Royal Portfolio</span>
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream font-light leading-tight mb-6">
                The Royal <span className="text-gold font-normal">Lookbook</span>
              </h1>
              <p className="font-body text-cream/70 text-base md:text-lg leading-relaxed">
                Explore regal weddings, royal portraits, and bespoke showroom creations photographed 
                across the palaces, courtyards, and wedding venues of Rajasthan.
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 bg-night">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
              {galleryCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-xl font-serif text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-gold text-night font-bold shadow-md'
                      : 'bg-cream/5 border border-gold/20 text-cream/70 hover:text-gold hover:border-gold/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Loading Indicator */}
            {loading && gallery.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-body text-sm text-gold/70">Loading royal lookbooks from showroom database...</p>
              </div>
            ) : (
              /* Image Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredImages.map((img, index) => (
                  <motion.div
                    key={img.id || img._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative rounded-2xl overflow-hidden border border-gold/25 bg-night-light/30 aspect-[3/4] cursor-pointer shadow-lg hover:border-gold transition-all duration-300"
                  >
                    <img
                      src={img.image}
                      alt={img.title || 'Royal Wedding Lookbook'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Gradient & Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      <span className="self-start px-2.5 py-1 rounded-md bg-night/80 border border-gold/30 text-gold text-[10px] font-serif uppercase tracking-widest">
                        {img.category || 'Mewar Wedding'}
                      </span>

                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <h4 className="font-serif text-lg text-cream font-medium line-clamp-1">{img.title}</h4>
                        <p className="font-body text-cream/70 text-xs line-clamp-2 mt-1">
                          {img.description || 'Authentic royal styling by Ranaji Udaipur.'}
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gold font-serif uppercase tracking-wider font-bold">
                          <Eye size={14} />
                          <span>View Look</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Showroom Fitting Invitation Banner */}
        <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 md:p-12 border border-gold/30 bg-gradient-to-r from-night-light via-cream/5 to-night-light flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="font-serif text-xs text-gold uppercase tracking-widest">Bespoke Wedding Styling</span>
              <h3 className="font-serif text-2xl sm:text-3xl text-cream font-medium">Inspired by a Look in Our Lookbook?</h3>
              <p className="font-body text-cream/60 text-xs sm:text-sm max-w-xl">
                Bring any photograph or design to our master designers. We will recreate, customize, or rent the complete ensemble for your wedding day.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold hover:bg-copper transition-all shadow-md text-center"
              >
                Book Showroom Appointment
              </Link>
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Hello%20Ranaji,%20I%20am%20interested%20in%20an%20outfit%20from%20your%20Royal%20Lookbook.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-cream/10 hover:bg-cream/15 text-cream border border-gold/30 font-serif text-xs uppercase tracking-widest font-semibold transition-all text-center flex items-center justify-center gap-2"
              >
                <Phone size={15} className="text-gold" />
                <span>WhatsApp Look Inquiry</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-night/80 border border-gold/40 text-gold flex items-center justify-center hover:bg-gold hover:text-night transition-colors"
              aria-label="Close Lightbox"
            >
              <X size={22} />
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 z-20 w-11 h-11 rounded-full bg-night/80 border border-gold/40 text-gold flex items-center justify-center hover:bg-gold hover:text-night transition-colors hidden sm:flex"
              aria-label="Previous Image"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 z-20 w-11 h-11 rounded-full bg-night/80 border border-gold/40 text-gold flex items-center justify-center hover:bg-gold hover:text-night transition-colors hidden sm:flex"
              aria-label="Next Image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Lightbox Content Card */}
            <div
              className="relative max-w-4xl w-full max-h-[90vh] bg-night border border-gold/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image side */}
              <div className="md:w-3/5 bg-night-light flex items-center justify-center overflow-hidden max-h-[50vh] md:max-h-[85vh]">
                <img
                  src={activeImage.image}
                  alt={activeImage.title}
                  className="w-full h-full object-contain max-h-[85vh]"
                />
              </div>

              {/* Info side */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gold/20 overflow-y-auto">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-serif uppercase tracking-widest mb-3">
                    {activeImage.category || 'Mewar Wedding'}
                  </span>
                  <h3 className="font-serif text-2xl text-cream font-medium mb-3">{activeImage.title}</h3>
                  <p className="font-body text-cream/70 text-sm leading-relaxed mb-6">
                    {activeImage.description || 'Handcrafted royal wedding attire from Ranaji showroom, Udaipur.'}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-gold/15 text-xs text-cream/60 font-body">
                    <p><span className="text-gold">Location:</span> Udaipur Palace & Courtyards</p>
                    <p><span className="text-gold">Craft:</span> Master Zardozi & Rajputi Saafa</p>
                    <p><span className="text-gold">Availability:</span> Custom Stitching & Showroom Rental</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gold/15 space-y-3">
                  <a
                    href={`https://wa.me/${cleanWaNumber}?text=Hello%20Ranaji,%20I%20am%20inquiring%20about%20the%20look:%20${encodeURIComponent(activeImage.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-copper transition-colors shadow"
                  >
                    <MessageCircle size={16} />
                    <span>Inquire About This Look</span>
                  </a>

                  <Link
                    to="/contact"
                    onClick={() => setLightboxIndex(null)}
                    className="w-full py-3 rounded-xl bg-cream/10 hover:bg-cream/15 text-cream border border-gold/30 font-serif text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <Calendar size={15} className="text-gold" />
                    <span>Book Trial Appointment</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default GalleryPage;

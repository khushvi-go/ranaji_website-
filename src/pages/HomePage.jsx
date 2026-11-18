import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Crown, 
  Sparkles, 
  Shirt, 
  Ruler, 
  Users, 
  Camera, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import HeroSection from '../components/Hero/HeroSection';
import MarqueeStrip from '../components/UI/MarqueeStrip';
import SectionHeading from '../components/UI/SectionHeading';
import CollectionCard from '../components/Collections/CollectionCard';
import TestimonialsSection from '../components/Testimonials/TestimonialsSection';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { useSettings } from '../context/SettingsContext';
import { defaultProducts } from '../data/initialShopData';

const HomePage = () => {
  const { products: rawProducts } = useShop();
  const { gallery } = useAdmin();
  const { settings } = useSettings();
  const [activePreviewGalleryImg, setActivePreviewGalleryImg] = useState(null);

  const products = (Array.isArray(rawProducts) && rawProducts.length > 0)
    ? rawProducts
    : defaultProducts;

  // Curate top 4 featured products for homepage preview
  const featuredProducts = products.slice(0, 4);

  // Selected Collections preview categories
  const collectionSpotlights = [
    {
      title: 'The Maharaja Groom',
      subtitle: 'Royal Sherwanis & Achkans',
      description: 'Hand-embroidered pure raw silk and velvet sherwanis adorned with antique Zardozi and royal Mewari motifs.',
      image: '/images/hero-sherwani.jpg',
      tag: 'Groom Couture',
      path: '/collections?category=groom'
    },
    {
      title: 'Maharani Bridal Poshaks',
      subtitle: 'Heirloom Rajputi Bridalwear',
      description: 'Authentic 4-piece Rajputi poshaks woven with pure georgette, handcrafted Gota Patti, and intricate kundan work.',
      image: '/images/poshak-red.jpg',
      tag: 'Bridal Heritage',
      path: '/collections?category=bride'
    },
    {
      title: 'Royal Darbar Accessories',
      subtitle: 'Turbans, Saafas & Regalia',
      description: 'Hand-tied Mewari saafas, Pachrangi pagris, handcrafted Rajputi talwars, pearl malas, and antique kalgis.',
      image: '/images/accessory-saafa.jpg',
      tag: 'Regal Regalia',
      path: '/collections?category=accessories'
    }
  ];

  // Premier showroom services preview
  const servicesPreview = [
    {
      icon: Shirt,
      title: 'Royal Outfit Rentals',
      description: 'Rent pristine royal sherwanis, bridal poshaks, and wedding jewelry for 3 to 7 days with complimentary trial fittings.',
      action: 'Learn About Rentals'
    },
    {
      icon: Ruler,
      title: 'Bespoke Master Tailoring',
      description: 'In-house master tailors craft each ensemble to your exact measurements, ensuring a regal and commanding silhouette.',
      action: 'Explore Tailoring'
    },
    {
      icon: Users,
      title: 'Baraat & Family Styling',
      description: 'Coordinated saafa tying, matching waistcoats, and royal attire for the entire groom party and close family.',
      action: 'Baraat Packages'
    }
  ];

  // 6 preview images from gallery
  const previewGallery = gallery.slice(0, 6);

  return (
    <div className="bg-night text-cream min-h-screen selection:bg-gold selection:text-night">
      <Navbar />

      <main className="overflow-hidden">
        {/* 1. Hero Banner */}
        <HeroSection />

        {/* 2. Royal Trust Marquee Strip */}
        <MarqueeStrip />

        {/* 3. Brand Introduction & Heritage Preview */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-night via-night-light/30 to-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-serif uppercase tracking-widest">
                  <Crown size={14} />
                  <span>The Legacy of Mewar</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cream font-light leading-tight">
                  Dressing Grooms & Brides Like the <span className="text-gold italic font-normal">Kings of Rajasthan</span>
                </h2>

                <p className="font-body text-cream/70 text-base md:text-lg leading-relaxed">
                  Nestled in the historic city of Udaipur, Ranaji is Udaipur’s preeminent royal wedding showroom. 
                  Every thread woven in our atelier carries the chivalry, valor, and enduring romance of the Rajput heritage.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2 border-t border-gold/15">
                  <div>
                    <p className="font-serif text-3xl text-gold font-light">8+</p>
                    <p className="font-body text-xs text-cream/60 uppercase tracking-wider mt-1">Years of Craft</p>
                  </div>
                  <div>
                    <p className="font-serif text-3xl text-gold font-light">500+</p>
                    <p className="font-body text-xs text-cream/60 uppercase tracking-wider mt-1">Royal Weddings</p>
                  </div>
                  <div>
                    <p className="font-serif text-3xl text-gold font-light">4.9★</p>
                    <p className="font-body text-xs text-cream/60 uppercase tracking-wider mt-1">Patron Rating</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/legacy"
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/40 text-xs font-serif uppercase tracking-widest font-bold transition-all group"
                  >
                    <span>Discover Our Royal Heritage</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative golden backdrop frame */}
                  <div className="absolute -inset-3 rounded-2xl border border-gold/25 translate-x-3 translate-y-3 pointer-events-none" />
                  
                  <div className="relative rounded-2xl overflow-hidden border border-gold/40 shadow-2xl aspect-[4/3] bg-night-light">
                    <img 
                      src="/images/gallery-1.jpg" 
                      alt="Ranaji Royal Showroom Udaipur" 
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="font-serif text-xs text-gold uppercase tracking-widest">Surajpole, Udaipur</span>
                      <p className="font-serif text-xl text-cream font-medium">An Exclusive Royal Wedding Showroom</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Featured Products (Royal Shop Preview) */}
        <section className="py-20 md:py-28 bg-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <SectionHeading
                  subtitle="Curated from Our Udaipur Showroom"
                  title="The Royal Shop"
                  centered={false}
                  className="text-left"
                />
                <p className="font-body text-cream/70 text-sm md:text-base max-w-xl mt-3">
                  A preview of our most sought-after royal wedding attire. Available for online reservation, bespoke purchase, and rental.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gold text-night font-serif text-xs tracking-widest uppercase font-bold hover:bg-copper transition-all shadow-lg shrink-0 group self-start md:self-end"
              >
                <span>Browse Full Catalogue</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <CollectionCard key={product.id || product._id} item={product} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-gold hover:text-cream font-serif text-sm tracking-widest uppercase transition-colors"
              >
                <span>View all {products.length}+ royal products in Shop</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Selected Collections Showcase */}
        <section className="py-20 md:py-28 bg-night-light/20 border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="Handcrafted Heritage"
              title="The Royal Wardrobe Collections"
            />
            
            <p className="font-body text-cream/70 text-center max-w-2xl mx-auto text-sm md:text-base mb-14">
              Explore our distinctive collections styled for every ceremony—from the regal Baraat procession to the royal Sangeet and Pheras.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collectionSpotlights.map((col, idx) => (
                <div 
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden border border-gold/30 bg-night/80 flex flex-col justify-between hover:border-gold transition-all duration-500 shadow-xl"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-night">
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-night/90 border border-gold/40 text-gold text-[10px] font-serif uppercase tracking-widest">
                      {col.tag}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-body text-xs text-gold tracking-widest uppercase mb-1">{col.subtitle}</p>
                      <h3 className="font-serif text-2xl text-cream font-medium mb-3">{col.title}</h3>
                      <p className="font-body text-cream/60 text-xs leading-relaxed mb-6">
                        {col.description}
                      </p>
                    </div>

                    <Link
                      to="/collections"
                      className="inline-flex items-center justify-between w-full pt-4 border-t border-gold/15 text-gold group-hover:text-cream text-xs font-serif uppercase tracking-widest font-semibold transition-colors"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/collections"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/40 text-xs font-serif uppercase tracking-widest font-bold transition-all"
              >
                <span>View Dedicated Collections Page</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Showroom Services Preview */}
        <section className="py-20 md:py-28 bg-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="Tailoring, Rentals & Custom Outfits"
              title="Showroom Services"
            />
            
            <p className="font-body text-cream/70 text-center max-w-2xl mx-auto text-sm md:text-base mb-14">
              More than a boutique—we provide complete royal styling, precision master tailoring, and flexible rental options in Udaipur.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {servicesPreview.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={index}
                    className="p-8 rounded-2xl bg-gradient-to-b from-cream/5 to-transparent border border-gold/20 hover:border-gold/60 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                        <IconComponent size={26} />
                      </div>
                      <h3 className="font-serif text-xl text-cream font-medium mb-3">{service.title}</h3>
                      <p className="font-body text-cream/60 text-xs md:text-sm leading-relaxed mb-6">
                        {service.description}
                      </p>
                    </div>

                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 text-gold group-hover:text-cream text-xs font-serif uppercase tracking-widest font-bold transition-colors"
                    >
                      <span>{service.action}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/services"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-gold via-copper to-gold text-night text-xs font-serif uppercase tracking-widest font-bold shadow-xl hover:brightness-110 transition-all"
              >
                <span>View All Services & Bookings</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Gallery / Lookbook Preview */}
        <section className="py-20 md:py-28 bg-night-light/20 border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <SectionHeading
                  subtitle="Regal Wedding Lookbook"
                  title="The Royal Gallery"
                  centered={false}
                  className="text-left"
                />
                <p className="font-body text-cream/70 text-sm md:text-base max-w-xl mt-3">
                  Glimpses of real weddings and regal portraits dressed in authentic Ranaji sherwanis and bridal couture.
                </p>
              </div>

              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/40 font-serif text-xs tracking-widest uppercase font-bold transition-all shrink-0 group self-start md:self-end"
              >
                <span>Explore Full Gallery</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Gallery Preview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {previewGallery.map((img, idx) => (
                <div
                  key={img.id || img._id || idx}
                  onClick={() => setActivePreviewGalleryImg(img)}
                  className="group relative rounded-xl overflow-hidden aspect-[3/4] border border-gold/25 cursor-pointer bg-night"
                >
                  <img
                    src={img.image}
                    alt={img.title || 'Royal Wedding Lookbook'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-night/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                    <Eye size={20} className="text-gold mb-1" />
                    <p className="font-serif text-xs text-cream line-clamp-1">{img.title}</p>
                    <span className="text-[10px] text-gold/80 uppercase tracking-wider">{img.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Testimonials Section */}
        <TestimonialsSection />

        {/* 9. Contact & Showroom Invitation */}
        <section className="py-20 md:py-28 bg-gradient-to-t from-night via-night-light/30 to-night">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden border border-gold/40 bg-night-light/80 p-8 sm:p-12 lg:p-16 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                  <MapPin size={16} />
                  <span>Surajpole Showroom · Udaipur, Rajasthan</span>
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cream font-light leading-tight mb-6">
                  Begin Your Royal Journey at <span className="text-gold font-normal">Ranaji</span>
                </h2>

                <p className="font-body text-cream/70 text-sm sm:text-base leading-relaxed mb-8">
                  Visit our Udaipur showroom for a private fitting, bespoke bridal consultation, or wedding ensemble rental. 
                  Experience our hand-embroidered collection in person with our master tailors.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold hover:bg-copper transition-all shadow-xl"
                  >
                    <Calendar size={16} />
                    <span>Book Private Consultation</span>
                  </Link>

                  <a
                    href={`https://wa.me/${(settings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-cream/10 hover:bg-cream/15 text-cream border border-gold/30 font-serif text-xs uppercase tracking-widest font-semibold transition-all"
                  >
                    <Phone size={16} className="text-gold" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox for preview gallery */}
      <AnimatePresence>
        {activePreviewGalleryImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePreviewGalleryImg(null)}
          >
            <div 
              className="relative max-w-2xl w-full bg-night border border-gold/40 rounded-2xl overflow-hidden shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePreviewGalleryImg(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-night/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-night transition-colors"
              >
                <X size={20} />
              </button>

              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-night">
                <img 
                  src={activePreviewGalleryImg.image} 
                  alt={activePreviewGalleryImg.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg text-cream">{activePreviewGalleryImg.title}</h4>
                  <p className="font-body text-xs text-gold/80 uppercase tracking-wider">{activePreviewGalleryImg.category}</p>
                </div>
                <Link
                  to="/gallery"
                  onClick={() => setActivePreviewGalleryImg(null)}
                  className="text-xs font-serif text-gold hover:underline"
                >
                  View in Gallery →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default HomePage;

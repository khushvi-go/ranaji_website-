import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Ruler, 
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../UI/SectionHeading';
import CollectionCard from '../Collections/CollectionCard';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import { defaultProducts } from '../../data/initialShopData';

const categoryFilters = [
  { id: 'all', label: 'All Featured', icon: Crown },
  { id: 'groom', label: 'Royal Grooms', icon: Crown },
  { id: 'bride', label: 'Bridal Poshaks', icon: Sparkles },
  { id: 'accessories', label: 'Royal Accessories', icon: ShieldCheck },
];

const RoyalShopSection = () => {
  const { products: rawProducts, loading } = useShop();
  const { openCart, cartCount } = useCart();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Use MongoDB products if available, otherwise fall back to rich defaultProducts
  const products = useMemo(() => {
    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      return rawProducts;
    }
    return defaultProducts;
  }, [rawProducts]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedFilter !== 'all') {
      list = list.filter((item) => {
        const cat = (item.category || item.categorySlug || '').toLowerCase();
        return cat === selectedFilter.toLowerCase();
      });
    }
    // Take the top featured or first 8 items for the showcase
    return list.slice(0, 8);
  }, [products, selectedFilter]);

  const scrollToContact = (e) => {
    e.preventDefault();
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      if (window.__lenis) {
        window.__lenis.scrollTo(contactEl, { offset: -80, duration: 1.2 });
      } else {
        const top = contactEl.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  return (
    <section 
      id="shop" 
      className="relative py-24 md:py-32 bg-night overflow-hidden border-t border-gold/10"
    >
      {/* Anchor alias for compatibility */}
      <div id="royal-shop" className="absolute -top-24 pointer-events-none" />

      {/* Decorative Royal Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold/5 blur-[120px] rounded-full" 
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #DEA044 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <SectionHeading
          subtitle="Direct from Udaipur Showroom"
          title="The Royal Shop"
        />

        {/* Section Intro Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-body text-cream/70 text-center max-w-2xl mx-auto -mt-6 mb-10 text-sm md:text-base leading-relaxed"
        >
          Discover handcrafted sherwanis, royal bridal poshaks, safas, and ceremonial attire. 
          Available for bespoke purchase or multi-day royal wedding rental.
        </motion.p>

        {/* Brand Promise Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-12 max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-night-light/70 border border-gold/15 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
              <Crown size={18} />
            </div>
            <div>
              <h4 className="font-serif text-cream text-xs md:text-sm font-semibold">Authentic Mewari Zari</h4>
              <p className="font-body text-cream/50 text-[11px]">Hand-embroidered pure silks</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-night-light/70 border border-gold/15 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="font-serif text-cream text-xs md:text-sm font-semibold">Buy or Rent Elegantly</h4>
              <p className="font-body text-cream/50 text-[11px]">Multi-day rental & doorstep delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-night-light/70 border border-gold/15 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
              <Ruler size={18} />
            </div>
            <div>
              <h4 className="font-serif text-cream text-xs md:text-sm font-semibold">Custom Fit Guarantee</h4>
              <p className="font-body text-cream/50 text-[11px]">Tailored by Udaipur master craftsmen</p>
            </div>
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          {categoryFilters.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedFilter === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`relative px-4 sm:px-6 py-2.5 rounded-xl font-body text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-gold text-night font-bold shadow-lg shadow-gold/20'
                    : 'bg-night-light/80 border border-gold/20 text-cream/70 hover:border-gold/50 hover:text-gold'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={14} className={isActive ? 'text-night' : 'text-gold'} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Featured Products Showcase Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-6 bg-night-light/40 rounded-2xl border border-gold/20 max-w-md mx-auto space-y-4">
            <Crown size={28} className="mx-auto text-gold/60" />
            <p className="text-cream font-serif text-lg">No ensembles in this collection</p>
            <button
              onClick={() => setSelectedFilter('all')}
              className="px-4 py-2 bg-gold text-night text-xs font-bold uppercase tracking-wider rounded-xl"
            >
              Show All Ensembles
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((item) => (
                <div key={item.id || item._id} className="h-[480px]">
                  <CollectionCard item={item} />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Call-to-Action Bar for the Complete Shopping Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-night-light via-night-light/90 to-night-light border border-gold/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-gold">
              <Sparkles size={16} />
              <span className="font-body text-xs uppercase tracking-widest font-bold">
                Royal Showroom Experience
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-cream">
              Seeking the Complete Udaipur Catalog or Bespoke Sizing?
            </h3>
            <p className="font-body text-cream/60 text-xs sm:text-sm max-w-xl">
              Browse our full catalog with advanced filters, or book an exclusive in-person trial at our Surajpole showroom.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Direct Link to Dedicated Royal Shop Catalog */}
            <Link
              to="/shop"
              className="px-6 py-3.5 bg-gradient-to-r from-gold via-copper to-gold text-night font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl border border-gold/40 flex items-center gap-2 group"
            >
              <Crown size={15} />
              <span>Explore Full Catalog</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Open Bag Button */}
            <button
              onClick={openCart}
              className="px-5 py-3.5 rounded-xl bg-night border border-gold/30 text-gold hover:bg-gold/10 font-body text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow"
            >
              <ShoppingBag size={15} />
              <span>Royal Bag {cartCount > 0 ? `(${cartCount})` : ''}</span>
            </button>

            {/* Book Fitting Session CTA */}
            <Link
              to="/contact"
              className="px-5 py-3.5 rounded-xl border border-cream/20 text-cream/80 hover:text-gold hover:border-gold font-body text-xs uppercase tracking-wider transition-all hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Book Fitting</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RoyalShopSection;

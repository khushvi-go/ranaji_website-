import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Calendar, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../UI/SectionHeading';
import CollectionCard from './CollectionCard';
import CategoryTabs from './CategoryTabs';
import { useShop } from '../../context/ShopContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CollectionsSection = () => {
  const { products, categories, getSubcategories } = useShop();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [availabilityMode, setAvailabilityMode] = useState('all'); // 'all', 'rent', 'purchase'
  const swiperRef = useRef(null);

  // Format categories for CategoryTabs
  const formattedCategories = useMemo(() => {
    return [
      { id: 'all', label: 'All Collections' },
      ...categories.map((c) => ({ id: c.slug || c.id, label: c.name }))
    ];
  }, [categories]);

  // Subcategories for current active category
  const subcategories = useMemo(() => {
    return getSubcategories(activeCategory);
  }, [activeCategory, getSubcategories]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setActiveSubcategory('all');
  };

  const filteredCollections = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        const matchesCategory =
          item.category === activeCategory ||
          item.categorySlug === activeCategory ||
          String(item.category) === String(activeCategory);
        if (!matchesCategory) {
          return false;
        }
      }

      // Subcategory filter
      if (activeSubcategory !== 'all' && item.subcategory !== activeSubcategory) {
        return false;
      }

      // Rent / Buy mode filter
      if (availabilityMode === 'rent' && !item.available?.includes('rent')) {
        return false;
      }
      if (availabilityMode === 'purchase' && !item.available?.includes('purchase')) {
        return false;
      }

      return true;
    });
  }, [products, activeCategory, activeSubcategory, availabilityMode]);

  return (
    <section id="collections" className="relative py-24 md:py-32 bg-night">
      {/* Decorative Arch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 opacity-10 pointer-events-none">
        <svg viewBox="0 0 800 100" fill="none" className="w-full h-full">
          <path
            d="M0 100 L0 50 Q200 0 400 0 Q600 0 800 50 L800 100"
            stroke="#DEA044"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M50 100 L50 60 Q225 20 400 20 Q575 20 750 60 L750 100"
            stroke="#BF8250"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Handcrafted Heritage"
          title="The Royal Wardrobe"
        />

        {/* Category Tabs */}
        <div className="mt-10">
          <CategoryTabs
            categories={formattedCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategorySelect}
          />
        </div>

        {/* Subcategory & Availability Quick Filters Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gold/15">
          {/* Subcategory Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-cream/50 uppercase font-body tracking-wider mr-1">
              Style:
            </span>
            <button
              onClick={() => setActiveSubcategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-body transition-all ${
                activeSubcategory === 'all'
                  ? 'bg-gold text-night font-bold shadow'
                  : 'bg-night-light border border-gold/20 text-cream/70 hover:border-gold/40'
              }`}
            >
              All Styles
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`px-3 py-1 rounded-full text-xs font-body transition-all ${
                  activeSubcategory === sub
                    ? 'bg-gold text-night font-bold shadow'
                    : 'bg-night-light border border-gold/20 text-cream/70 hover:border-gold/40'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Availability Switch (All / Rent / Buy) */}
          <div className="flex items-center gap-1 bg-night-light p-1 rounded-xl border border-gold/20">
            {[
              { id: 'all', label: 'All' },
              { id: 'rent', label: 'For Rent', icon: Calendar },
              { id: 'purchase', label: 'Buy to Own', icon: Sparkles }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setAvailabilityMode(mode.id)}
                className={`px-3 py-1 rounded-lg text-xs font-body transition-all flex items-center gap-1.5 ${
                  availabilityMode === mode.id
                    ? 'bg-gold text-night font-bold shadow'
                    : 'text-cream/60 hover:text-cream'
                }`}
              >
                {mode.icon && <mode.icon size={12} />}
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="relative mt-8">
          {/* Custom Navigation */}
          <div className="absolute -top-16 right-0 flex gap-2 z-10">
            <button
              onClick={() => swiperRef.current?.swiper.slidePrev()}
              className="p-2.5 rounded-lg border border-gold/30 text-gold hover:bg-gold hover:text-night transition-all duration-300"
              title="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => swiperRef.current?.swiper.slideNext()}
              className="p-2.5 rounded-lg border border-gold/30 text-gold hover:bg-gold hover:text-night transition-all duration-300"
              title="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {filteredCollections.length === 0 ? (
            <div className="text-center py-16 bg-night-light/50 rounded-2xl border border-gold/20">
              <p className="text-cream/60 font-serif">No royal items match this filter combination.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveSubcategory('all');
                  setAvailabilityMode('all');
                }}
                className="mt-3 text-gold text-xs underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="!pb-14"
            >
              <AnimatePresence mode="popLayout">
                {filteredCollections.map((item) => (
                  <SwiperSlide key={item.id} className="h-auto">
                    <div className="h-[460px]">
                      <CollectionCard item={item} />
                    </div>
                  </SwiperSlide>
                ))}
              </AnimatePresence>
            </Swiper>
          )}
        </div>

        {/* View All CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-gold via-copper to-gold text-night font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl border border-gold/40"
          >
            <Crown size={16} />
            Explore Full Royal Wardrobe Catalog
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CollectionsSection;

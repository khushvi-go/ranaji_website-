import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import CollectionCard from './CollectionCard';
import CategoryTabs from './CategoryTabs';
import { collections, categories } from '../../data/collections';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CollectionsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const swiperRef = useRef(null);

  const filteredCollections = activeCategory === 'all'
    ? collections
    : collections.filter(item => item.category === activeCategory || 
        (activeCategory === 'rent' && item.available.includes('rent')));

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
          subtitle="Curated Excellence"
          title="The Royal Wardrobe"
        />

        {/* Category Tabs */}
        <div className="mt-12">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Swiper Carousel */}
        <div className="relative mt-8">
          {/* Custom Navigation */}
          <div className="absolute -top-20 right-0 flex gap-2 z-10">
            <button
              onClick={() => swiperRef.current?.swiper.slidePrev()}
              className="p-3 border border-gold/30 text-gold hover:bg-gold hover:text-night transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => swiperRef.current?.swiper.slideNext()}
              className="p-3 border border-gold/30 text-gold hover:bg-gold hover:text-night transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>

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
                <SwiperSlide key={item.id}>
                  <CollectionCard item={item} />
                </SwiperSlide>
              ))}
            </AnimatePresence>
          </Swiper>
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 font-body text-gold hover:text-cream transition-colors tracking-wider uppercase text-sm group">
            View All Collections
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CollectionsSection;

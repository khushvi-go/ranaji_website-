import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, X, Search, SlidersHorizontal, Crown, 
  Sparkles, Calendar, ChevronDown, Check, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import CollectionCard from '../components/Collections/CollectionCard';
import { useShop } from '../context/ShopContext';

const priceRanges = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-5k', label: 'Under ₹5,000', min: 0, max: 5000 },
  { id: '5k-15k', label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
  { id: '15k-25k', label: '₹15,000 – ₹25,000', min: 15000, max: 25000 },
  { id: 'above-25k', label: 'Above ₹25,000', min: 25000, max: Infinity },
];

const sortOptions = [
  { id: 'featured', label: 'Royal Featured' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A to Z' },
  { id: 'rating', label: 'Customer Rating' },
];

const ShopPage = () => {
  const { products, categories, getSubcategories } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'rent', 'purchase'
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // When category changes, reset subcategory to 'all'
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
  };

  // Subcategories available for active category
  const activeSubcategories = useMemo(() => {
    return getSubcategories(selectedCategory);
  }, [selectedCategory, getSubcategories]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory) {
        return false;
      }

      // Availability (Rent vs Purchase)
      if (availabilityFilter === 'rent' && !item.available?.includes('rent')) {
        return false;
      }
      if (availabilityFilter === 'purchase' && !item.available?.includes('purchase')) {
        return false;
      }

      // Price range
      const range = priceRanges.find((r) => r.id === selectedPriceRange);
      if (range) {
        const p = Number(item.price) || 0;
        if (p < range.min || p > range.max) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchSub = item.subcategory?.toLowerCase().includes(query);
        const matchFabric = item.fabric?.toLowerCase().includes(query);
        const matchColor = item.color?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchSub && !matchFabric && !matchColor) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      // default: featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedSubcategory, availabilityFilter, selectedPriceRange, searchQuery, sortBy]);

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory !== 'all' ? 1 : 0) +
    (availabilityFilter !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setAvailabilityFilter('all');
    setSelectedPriceRange('all');
    setSearchQuery('');
  };

  return (
    <div className="bg-night min-h-screen text-cream flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Header */}
        <div className="relative py-12 md:py-16 bg-gradient-to-b from-night-light via-night to-night border-b border-gold/15 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs font-body uppercase tracking-widest text-gold/80 mb-3">
              <Link to="/" className="hover:text-gold transition-colors flex items-center gap-1">
                <ArrowLeft size={12} />
                Home
              </Link>
              <span>/</span>
              <span className="text-cream">Royal Wardrobe Collection</span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="text-gold" size={24} />
              <h1 className="font-serif text-3xl md:text-5xl text-cream font-medium tracking-wide">
                The Royal Collection
              </h1>
              <Crown className="text-gold" size={24} />
            </div>

            <p className="font-body text-cream/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Explore authentic Mewari sherwanis, bridal poshaks, safas, and ceremonial ensembles available for rent and purchase in Udaipur.
            </p>

            {/* Quick Search Bar */}
            <div className="max-w-xl mx-auto mt-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sherwanis, poshaks, bandhgalas, talwars, safas..."
                className="w-full pl-12 pr-10 py-3.5 bg-night/80 border border-gold/30 rounded-2xl text-cream text-sm focus:border-gold focus:outline-none shadow-xl backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Top Bar: Results count, Active Filters & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gold/15">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-xl text-gold font-body text-xs uppercase tracking-wider font-semibold"
              >
                <SlidersHorizontal size={14} />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <span className="font-body text-sm text-cream/70">
                Showing <strong className="text-gold">{filteredProducts.length}</strong> of{' '}
                {products.length} Royal Ensembles
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs text-cream/50 uppercase tracking-wider font-body hidden sm:inline">
                Sort By:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-night-light border border-gold/25 text-cream py-2 pl-4 pr-10 rounded-xl text-xs font-body focus:border-gold focus:outline-none cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-night text-cream">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-xs text-cream/50 font-body">Active Filters:</span>
              
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs">
                  Category: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => handleCategoryChange('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedSubcategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs">
                  Subcategory: {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}

              {availabilityFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs">
                  {availabilityFilter === 'rent' ? 'For Rent' : 'For Purchase'}
                  <button onClick={() => setAvailabilityFilter('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedPriceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs">
                  Price: {priceRanges.find((r) => r.id === selectedPriceRange)?.label}
                  <button onClick={() => setSelectedPriceRange('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs text-gold underline hover:text-cream ml-2 font-body"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Main Layout: Sidebar Filters + Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-night-light/60 p-6 rounded-2xl border border-gold/20 h-fit sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-gold/15">
                <h3 className="font-serif text-lg text-cream font-medium flex items-center gap-2">
                  <Filter size={18} className="text-gold" />
                  Filter Outfits
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-gold/80 hover:text-gold underline font-body"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Main Categories */}
              <div className="space-y-3">
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider font-semibold">
                  Collection Categories
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-body transition-all flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-gold text-night font-bold shadow'
                        : 'text-cream/70 hover:bg-gold/10 hover:text-gold'
                    }`}
                  >
                    <span>All Collections</span>
                    <span className="text-[10px] opacity-75">{products.length}</span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-body transition-all flex items-center justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-gold text-night font-bold shadow'
                            : 'text-cream/70 hover:bg-gold/10 hover:text-gold'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Subcategories */}
              {activeSubcategories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gold/10">
                  <label className="block text-cream/70 text-xs font-body uppercase tracking-wider font-semibold">
                    Outfit Style / Subcategory
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-body transition-all ${
                        selectedSubcategory === 'all'
                          ? 'bg-gold/25 border border-gold text-gold font-semibold'
                          : 'bg-night border border-gold/15 text-cream/60 hover:text-cream'
                      }`}
                    >
                      All Styles
                    </button>
                    {activeSubcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-body transition-all ${
                          selectedSubcategory === sub
                            ? 'bg-gold/25 border border-gold text-gold font-semibold'
                            : 'bg-night border border-gold/15 text-cream/60 hover:text-cream'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Availability: Rent vs Purchase */}
              <div className="space-y-3 pt-4 border-t border-gold/10">
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider font-semibold">
                  Rental & Purchase Mode
                </label>
                <div className="grid grid-cols-3 gap-1 bg-night p-1 rounded-xl border border-gold/20">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'rent', label: 'Rent' },
                    { id: 'purchase', label: 'Buy' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setAvailabilityFilter(mode.id)}
                      className={`py-1.5 text-xs font-body rounded-lg transition-all text-center ${
                        availabilityFilter === mode.id
                          ? 'bg-gold text-night font-bold shadow'
                          : 'text-cream/60 hover:text-cream'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Price Ranges */}
              <div className="space-y-3 pt-4 border-t border-gold/10">
                <label className="block text-cream/70 text-xs font-body uppercase tracking-wider font-semibold">
                  Price Range
                </label>
                <div className="space-y-1">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-body transition-all flex items-center justify-between ${
                        selectedPriceRange === range.id
                          ? 'text-gold font-semibold bg-gold/10'
                          : 'text-cream/60 hover:text-cream'
                      }`}
                    >
                      <span>{range.label}</span>
                      {selectedPriceRange === range.id && <Check size={14} className="text-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-night-light/40 rounded-2xl border border-gold/20 p-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <Crown size={28} />
                  </div>
                  <h3 className="font-serif text-2xl text-cream font-medium">No Royal Ensembles Found</h3>
                  <p className="text-cream/60 text-xs font-body max-w-md mx-auto leading-relaxed">
                    We could not find items matching your active filter criteria. Try clearing filters or exploring another category.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-gold text-night font-body text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-copper transition-all shadow-md"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((item) => (
                    <div key={item.id} className="h-[460px]">
                      <CollectionCard item={item} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-night/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full max-w-xs bg-night-light border-l border-gold/30 shadow-2xl p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gold/20">
                <h3 className="font-serif text-lg text-cream font-medium flex items-center gap-2">
                  <Filter size={18} className="text-gold" />
                  Filter Ensembles
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-cream/60 hover:text-gold"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-body tracking-wider text-cream/70 font-bold block">
                  Category
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-body ${
                      selectedCategory === 'all' ? 'bg-gold text-night font-bold' : 'text-cream/70'
                    }`}
                  >
                    All Collections
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-body ${
                        selectedCategory === c.id ? 'bg-gold text-night font-bold' : 'text-cream/70'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {activeSubcategories.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gold/15">
                  <label className="text-xs uppercase font-body tracking-wider text-cream/70 font-bold block">
                    Subcategories
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-3 py-1 rounded-lg text-xs ${
                        selectedSubcategory === 'all' ? 'bg-gold text-night font-bold' : 'bg-night text-cream/70'
                      }`}
                    >
                      All
                    </button>
                    {activeSubcategories.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSubcategory(s)}
                        className={`px-3 py-1 rounded-lg text-xs ${
                          selectedSubcategory === s ? 'bg-gold text-night font-bold' : 'bg-night text-cream/70'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode */}
              <div className="space-y-2 pt-4 border-t border-gold/15">
                <label className="text-xs uppercase font-body tracking-wider text-cream/70 font-bold block">
                  Option
                </label>
                <div className="grid grid-cols-3 gap-1 bg-night p-1 rounded-xl">
                  {['all', 'rent', 'purchase'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setAvailabilityFilter(m)}
                      className={`py-1.5 text-xs font-body rounded-lg capitalize ${
                        availabilityFilter === m ? 'bg-gold text-night font-bold' : 'text-cream/60'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-gold text-night font-body text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg mt-6"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ShopPage;

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Sparkles, 
  Search, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import CollectionCard from '../components/Collections/CollectionCard';
import SectionHeading from '../components/UI/SectionHeading';
import { useShop } from '../context/ShopContext';

const CollectionsPage = () => {
  const { categories, products, loading, error, getSubcategories, fetchShopData } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  const productsSectionRef = useRef(null);

  // Active filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [availabilityMode, setAvailabilityMode] = useState('all'); // 'all', 'rent', 'purchase'
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize category with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setSelectedCategory(catParam.toLowerCase());
      setSelectedSubcategory('all');
    } else {
      setSelectedCategory('all');
      setSelectedSubcategory('all');
    }
  }, [location.search]);

  // Handle selecting a collection
  const handleSelectCollection = (slug) => {
    const targetSlug = slug.toLowerCase();
    setSelectedCategory(targetSlug);
    setSelectedSubcategory('all');
    
    // Update URL without full page reload
    if (targetSlug === 'all') {
      navigate('/collections', { replace: true });
    } else {
      navigate(`/collections?category=${targetSlug}`, { replace: true });
    }

    // Smooth scroll to products view
    if (productsSectionRef.current) {
      const top = productsSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  // Subcategories for current active category
  const activeSubcategories = useMemo(() => {
    return getSubcategories(selectedCategory);
  }, [selectedCategory, getSubcategories]);

  // Filter products by selected category, subcategory, availability, and search
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const itemCat = String(item.categorySlug || item.category || '').toLowerCase();
        const activeCat = selectedCategory.toLowerCase();
        if (itemCat !== activeCat) {
          // Check matching category ObjectId or Name
          const matchedCategoryObj = categories.find(
            (c) => (c.slug || '').toLowerCase() === activeCat || (c.id || c._id) === activeCat
          );
          const matchesId = matchedCategoryObj && (item.category === matchedCategoryObj.id || item.category === matchedCategoryObj._id);
          const matchesName = matchedCategoryObj && item.categoryName && matchedCategoryObj.name.toLowerCase() === item.categoryName.toLowerCase();
          if (!matchesId && !matchesName) return false;
        }
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory) {
        return false;
      }

      // Rent / Buy mode filter
      if (availabilityMode === 'rent' && !item.available?.includes('rent')) {
        return false;
      }
      if (availabilityMode === 'purchase' && !item.available?.includes('purchase')) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesSub = (item.subcategory || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesSub) return false;
      }

      return true;
    });
  }, [products, categories, selectedCategory, selectedSubcategory, availabilityMode, searchQuery]);

  // Active Collection Details (from MongoDB)
  const activeCollectionDetails = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(
      (c) => (c.slug || '').toLowerCase() === selectedCategory.toLowerCase() || (c.id || c._id) === selectedCategory
    );
  }, [categories, selectedCategory]);

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
              <span className="text-gold">Collections</span>
              {activeCollectionDetails && (
                <>
                  <span>/</span>
                  <span className="text-cream">{activeCollectionDetails.name}</span>
                </>
              )}
            </div>

            <div className="max-w-3xl">
              <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Crown size={15} />
                <span>Udaipur Royal Atelier · MongoDB Curated</span>
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream font-light leading-tight mb-6">
                The Royal <span className="text-gold font-normal">Wardrobe</span>
              </h1>
              <p className="font-body text-cream/70 text-base md:text-lg leading-relaxed">
                Explore our signature collections loaded directly from the Ranaji Udaipur showroom. 
                Select a collection to view its handcrafted royal garments available for bespoke purchase and rental.
              </p>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-gold/80 text-sm tracking-widest uppercase">
              Loading royal collections from MongoDB...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-16 max-w-xl mx-auto px-4 text-center">
            <div className="p-8 rounded-2xl bg-night-light border border-crimson/40 text-cream space-y-4 shadow-xl">
              <AlertCircle size={36} className="text-crimson mx-auto" />
              <h3 className="font-serif text-xl text-cream">Unable to Load Collections</h3>
              <p className="text-xs font-body text-cream/70 leading-relaxed">{error}</p>
              <button
                onClick={fetchShopData}
                className="px-6 py-2.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Collections Overview (Cards from MongoDB) */}
        {!loading && !error && (
          <section className="py-16 bg-night border-b border-gold/15">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <p className="font-body text-xs text-gold uppercase tracking-widest mb-1">Curated Showroom Editions</p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-cream">Explore by Collection</h2>
                </div>
                <div className="text-xs font-serif text-cream/60">
                  <span>{categories.length} Showroom Collections Available</span>
                </div>
              </div>

              {/* Responsive Grid of Collection Cards from MongoDB */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((col) => {
                  const colSlug = (col.slug || col.id).toLowerCase();
                  const isSelected = selectedCategory === colSlug;
                  const count = products.filter(
                    (p) =>
                      String(p.categorySlug || p.category || '').toLowerCase() === colSlug ||
                      p.category === col.id ||
                      p.category === col._id
                  ).length;

                  return (
                    <motion.div
                      key={col.id || col._id}
                      onClick={() => handleSelectCollection(colSlug)}
                      whileHover={{ y: -6 }}
                      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xl ${
                        isSelected 
                          ? 'border-gold bg-gold/5 ring-1 ring-gold/40' 
                          : 'border-gold/25 bg-night-light/30 hover:border-gold/60'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-night">
                        <img
                          src={col.image || '/images/hero-sherwani.jpg'}
                          alt={col.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                        
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-night/85 border border-gold/40 text-gold text-[10px] font-serif uppercase tracking-widest">
                            {count} Outfits
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 rounded-full bg-gold text-night text-[10px] font-serif uppercase tracking-widest font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Active</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif text-2xl text-cream font-medium mb-2 group-hover:text-gold transition-colors">
                            {col.name}
                          </h3>
                          <p className="font-body text-cream/70 text-xs leading-relaxed line-clamp-2 mb-4">
                            {col.description || 'Exclusive handcrafted royal attire designed for regal celebrations.'}
                          </p>

                          {/* Subcategories tags */}
                          {Array.isArray(col.subcategories) && col.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-6">
                              {col.subcategories.slice(0, 3).map((sub) => (
                                <span
                                  key={sub}
                                  className="px-2 py-0.5 rounded text-[10px] font-body bg-cream/5 border border-gold/15 text-cream/60"
                                >
                                  {sub}
                                </span>
                              ))}
                              {col.subcategories.length > 3 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-body text-gold/70">
                                  +{col.subcategories.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-gold/15 flex items-center justify-between text-xs font-serif uppercase tracking-widest font-bold text-gold group-hover:text-cream transition-colors">
                          <span>{isSelected ? 'Viewing Outfits' : 'Explore Outfits'}</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Collection Products & Filters View */}
        {!loading && !error && (
          <section ref={productsSectionRef} className="py-16 bg-night">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Active Collection Headline */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-gold/15">
                <div>
                  <span className="text-xs font-serif text-gold uppercase tracking-widest">
                    {selectedCategory === 'all' ? 'All Showroom Ensembles' : 'Collection Showcase'}
                  </span>
                  <h2 className="font-serif text-3xl text-cream mt-1">
                    {activeCollectionDetails ? activeCollectionDetails.name : 'All Royal Creations'}
                  </h2>
                  {activeCollectionDetails?.description && (
                    <p className="font-body text-cream/60 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
                      {activeCollectionDetails.description}
                    </p>
                  )}
                </div>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleSelectCollection('all')}
                    className="self-start md:self-end px-4 py-2 rounded-xl bg-cream/5 border border-gold/30 hover:border-gold text-gold text-xs font-serif uppercase tracking-wider transition-all"
                  >
                    ← View All Collections
                  </button>
                )}
              </div>

              {/* Controls Bar: Category Filter Chips, Subcategories, Search & Availability */}
              <div className="space-y-4 mb-10">
                {/* Collection Switcher Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    onClick={() => handleSelectCollection('all')}
                    className={`px-4 py-2 rounded-xl font-serif text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gold text-night font-bold shadow-md'
                        : 'bg-cream/5 border border-gold/20 text-cream/70 hover:text-gold'
                    }`}
                  >
                    All Collections ({products.length})
                  </button>
                  {categories.map((c) => {
                    const cSlug = (c.slug || c.id).toLowerCase();
                    const isColActive = selectedCategory === cSlug;
                    return (
                      <button
                        key={c.id || c._id}
                        onClick={() => handleSelectCollection(cSlug)}
                        className={`px-4 py-2 rounded-xl font-serif text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                          isColActive
                            ? 'bg-gold text-night font-bold shadow-md'
                            : 'bg-cream/5 border border-gold/20 text-cream/70 hover:text-gold'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>

                {/* Subcategory & Availability Filter Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-night-light/50 border border-gold/15">
                  {/* Subcategories (if any) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-serif text-gold/80 mr-1">Garment Type:</span>
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-body transition-colors ${
                        selectedSubcategory === 'all'
                          ? 'bg-gold/20 text-gold border border-gold/40 font-medium'
                          : 'text-cream/60 hover:text-cream'
                      }`}
                    >
                      All
                    </button>
                    {activeSubcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-3 py-1 rounded-lg text-xs font-body transition-colors ${
                          selectedSubcategory === sub
                            ? 'bg-gold/20 text-gold border border-gold/40 font-medium'
                            : 'text-cream/60 hover:text-cream'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>

                  {/* Search and Rent/Buy Toggle */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in collection..."
                        className="pl-8 pr-3 py-1.5 rounded-lg bg-night border border-gold/20 text-cream placeholder-cream/40 text-xs font-body focus:outline-none focus:border-gold transition-colors w-44 sm:w-56"
                      />
                    </div>

                    {/* Rent / Buy Mode */}
                    <div className="flex items-center gap-1 bg-night p-1 rounded-lg border border-gold/20">
                      <button
                        onClick={() => setAvailabilityMode('all')}
                        className={`px-3 py-1 rounded-md text-xs font-body transition-colors ${
                          availabilityMode === 'all' ? 'bg-gold text-night font-medium' : 'text-cream/60 hover:text-cream'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setAvailabilityMode('purchase')}
                        className={`px-3 py-1 rounded-md text-xs font-body transition-colors ${
                          availabilityMode === 'purchase' ? 'bg-gold text-night font-medium' : 'text-cream/60 hover:text-cream'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setAvailabilityMode('rent')}
                        className={`px-3 py-1 rounded-md text-xs font-body transition-colors ${
                          availabilityMode === 'rent' ? 'bg-gold text-night font-medium' : 'text-cream/60 hover:text-cream'
                        }`}
                      >
                        Rent
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count & Link to Shop */}
              <div className="flex items-center justify-between mb-6 text-xs font-body text-cream/50">
                <span>Showing {filteredProducts.length} royal creations</span>
                <Link to="/shop" className="text-gold hover:underline flex items-center gap-1">
                  <span>Explore in Royal Shop with Price Filters</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <CollectionCard key={product.id || product._id} item={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-6 rounded-2xl bg-night-light/30 border border-gold/20 max-w-xl mx-auto space-y-4">
                  <Crown size={32} className="text-gold/60 mx-auto" />
                  <h3 className="font-serif text-xl text-cream">No garments found</h3>
                  <p className="text-xs font-body text-cream/60 leading-relaxed">
                    No creations match your active filters in this collection. Reset your search or browse our full catalogue.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSubcategory('all');
                        setAvailabilityMode('all');
                        setSearchQuery('');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gold text-night text-xs font-serif uppercase tracking-widest font-bold"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Custom Tailoring & Fitting CTA */}
        <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 md:p-12 border border-gold/30 bg-gradient-to-r from-night-light via-cream/5 to-night-light flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="font-serif text-xs text-gold uppercase tracking-widest">Bespoke Royal Fitting</span>
              <h3 className="font-serif text-2xl sm:text-3xl text-cream font-medium">Want a Private Fitting in Udaipur?</h3>
              <p className="font-body text-cream/60 text-xs sm:text-sm max-w-xl">
                Reserve our showroom VIP trial suite. Master tailors will adjust your chosen ensemble for your wedding ceremonies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/services"
                className="px-6 py-3.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold hover:bg-copper transition-all shadow-md text-center"
              >
                Explore Services
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl bg-cream/10 hover:bg-cream/15 text-cream border border-gold/30 font-serif text-xs uppercase tracking-widest font-semibold transition-all text-center"
              >
                Book Showroom Visit
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CollectionsPage;

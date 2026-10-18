import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Heart, Eye, ShoppingBag, Sparkles, Calendar } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CollectionCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { openQuickView, addToCart, toggleWishlist, isWishlisted } = useCart();

  const wishlisted = isWishlisted(item.id);

  const purchasePrice = typeof item.price === 'number' 
    ? item.price 
    : parseInt(String(item.price).replace(/[^0-9]/g, '')) || 0;

  const rentPrice = item.rentPrice || Math.round(purchasePrice * 0.3);

  const handleQuickView = (e) => {
    e.stopPropagation();
    openQuickView(item);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(item);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openQuickView(item)}
    >
      {/* Card Container */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-b from-night to-night-light border border-gold/15 transition-all duration-500 rounded-xl flex flex-col h-full"
        whileHover={{ 
          y: -8,
          boxShadow: '0 25px 50px -12px rgba(222, 160, 68, 0.25)',
          borderColor: 'rgba(222, 160, 68, 0.4)'
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(222,160,68,0.2) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['200% 200%', '-200% -200%'],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-20 pointer-events-none" />

        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-night">
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent opacity-80" />
          
          {/* Badges on Top Left */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-night/85 backdrop-blur-md px-2.5 py-1 border border-gold/30 rounded-full shadow-lg">
              <Crown size={11} className="text-gold" />
              <span className="text-gold font-body text-[10px] tracking-[0.15em] uppercase font-bold">
                {item.category}
              </span>
            </div>

            {item.subcategory && (
              <div className="bg-night/75 backdrop-blur-md px-2 py-0.5 border border-gold/20 rounded-full">
                <span className="text-cream/90 font-body text-[10px] tracking-wider uppercase">
                  {item.subcategory}
                </span>
              </div>
            )}
          </div>

          {/* Wishlist Button on Top Right */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-30 p-2 rounded-full backdrop-blur-md transition-all ${
              wishlisted
                ? 'bg-gold text-night scale-110 shadow-lg'
                : 'bg-night/70 text-cream/70 hover:text-gold hover:bg-night border border-gold/20'
            }`}
            title={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Availability Pill */}
          <div className="absolute bottom-3 left-3 z-20">
            {item.available?.includes('rent') ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-body rounded-full backdrop-blur-sm">
                <Calendar size={10} />
                Rent & Buy
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold/20 border border-gold/40 text-gold text-[10px] font-body rounded-full backdrop-blur-sm">
                <Sparkles size={10} />
                Purchase Only
              </span>
            )}
          </div>

          {/* Quick View Button Hover Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-3 bottom-12 z-20 hidden sm:flex gap-2"
          >
            <button
              type="button"
              onClick={handleQuickView}
              className="flex-1 py-2 px-3 bg-night/95 backdrop-blur-md border border-gold/40 text-gold hover:bg-gold hover:text-night text-xs font-body uppercase tracking-wider font-semibold rounded-lg shadow-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Eye size={14} />
              Quick View
            </button>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between relative bg-night/80">
          <div>
            <h3 className="font-serif text-lg text-cream group-hover:text-gold transition-colors duration-300 line-clamp-1">
              {item.name}
            </h3>
            
            <p className="font-body text-cream/50 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Pricing Box & Add to Cart button */}
          <div className="mt-4 pt-3 border-t border-gold/15 flex items-end justify-between gap-2">
            <div>
              <div className="text-[10px] text-cream/50 font-body uppercase tracking-wider">
                {item.priceType || 'Starting Price'}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-gold text-lg font-bold">
                  ₹{purchasePrice.toLocaleString('en-IN')}
                </span>
                {item.available?.includes('rent') && rentPrice > 0 && (
                  <span className="text-[11px] text-cream/60 font-body">
                    / Rent ₹{rentPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="p-2.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-night transition-all shrink-0 shadow-sm"
              title="Add to Royal Bag"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CollectionCard;

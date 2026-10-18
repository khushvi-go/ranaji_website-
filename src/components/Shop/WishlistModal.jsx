import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Eye, Trash2, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import { Link } from 'react-router-dom';

const WishlistModal = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist, addToCart, openQuickView } = useCart();
  const { products } = useShop();

  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveToBag = (product) => {
    addToCart(product);
  };

  const handleQuickView = (product) => {
    onClose();
    openQuickView(product);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-night/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-night-light border border-gold/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-night">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Heart size={20} fill="#DEA044" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-cream font-medium flex items-center gap-2">
                  Royal Wishlist
                  <Crown size={16} className="text-gold" />
                </h3>
                <p className="text-xs text-cream/50 font-body">
                  {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'garment' : 'garments'} saved
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-cream/50 hover:text-gold transition-colors p-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold/40">
                  <Heart size={28} />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-cream">Your Wishlist is Empty</h4>
                  <p className="text-cream/50 text-xs font-body max-w-xs mx-auto mt-1">
                    Save your favorite sherwanis, poshaks, and accessories while browsing the collection.
                  </p>
                </div>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold text-night font-body text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-copper transition-all"
                >
                  Explore Collection
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-night border border-gold/20 flex flex-col justify-between group hover:border-gold/40 transition-all shadow-md"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-gold/20 bg-night-light shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-gold uppercase tracking-wider font-body block truncate">
                          {item.category} • {item.subcategory || ''}
                        </span>
                        <h4 className="font-serif text-sm text-cream font-medium line-clamp-1 mt-0.5">
                          {item.name}
                        </h4>
                        
                        <div className="mt-2 font-serif text-gold text-sm font-bold">
                          ₹{Number(item.price)?.toLocaleString('en-IN')}
                        </div>
                        {item.rentPrice && (
                          <div className="text-[10px] text-cream/50 font-body">
                            Rent: ₹{Number(item.rentPrice)?.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleQuickView(item)}
                        className="px-3 py-1.5 border border-gold/20 text-cream/70 hover:text-gold rounded-lg text-xs font-body flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveToBag(item)}
                          className="px-3 py-1.5 bg-gold hover:bg-copper text-night font-body text-xs font-bold uppercase rounded-lg flex items-center gap-1 transition-all shadow-sm"
                        >
                          <ShoppingBag size={12} />
                          Add to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(item.id)}
                          className="p-1.5 text-cream/40 hover:text-red-400 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlistedProducts.length > 0 && (
            <div className="p-4 bg-night border-t border-gold/20 flex justify-between items-center text-xs text-cream/60 font-body">
              <span>{wishlistedProducts.length} items in favorites</span>
              <button
                onClick={onClose}
                className="text-gold hover:underline"
              >
                Close Wishlist
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WishlistModal;

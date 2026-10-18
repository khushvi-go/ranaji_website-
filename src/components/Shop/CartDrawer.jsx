import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, Trash2, Crown, Sparkles, 
  ArrowRight, ShieldCheck, Calendar, Plus, Minus 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { 
    cart, 
    cartCount, 
    subtotal, 
    securityDeposit, 
    total, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    openCheckout 
  } = useCart();
  
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    closeCart();
    navigate('/shop');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-night/80 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-night-light border-l border-gold/30 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-night">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-cream font-medium flex items-center gap-2">
                      Royal Bag
                      <Crown size={16} className="text-gold" />
                    </h2>
                    <p className="text-xs text-cream/50 font-body">
                      {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="p-2 rounded-lg text-cream/50 hover:text-gold hover:bg-gold/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold/40">
                      <ShoppingBag size={36} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-cream">Your Royal Bag is Empty</h3>
                      <p className="text-cream/50 text-xs font-body max-w-xs mx-auto mt-1">
                        Explore our handcrafted royal sherwanis, poshak ensembles, and wedding accessories.
                      </p>
                    </div>
                    <button
                      onClick={handleContinueShopping}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold text-night font-body text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-copper transition-all"
                    >
                      Explore Royal Wardrobe
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.cartItemId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-xl bg-night border border-gold/20 flex gap-4 relative group"
                    >
                      {/* Image */}
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-gold/20 shrink-0 bg-night-light">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-sm text-cream font-medium truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-cream/40 hover:text-red-400 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Order type & size */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-body">
                            <span
                              className={`px-2 py-0.5 rounded-full ${
                                item.orderType === 'rent'
                                  ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                                  : 'bg-gold/20 text-gold border border-gold/30'
                              }`}
                            >
                              {item.orderType === 'rent' ? `Rental (${item.rentalDays}d)` : 'Purchase'}
                            </span>
                            {item.selectedSize && (
                              <span className="text-cream/60 bg-cream/5 px-2 py-0.5 rounded border border-cream/10">
                                {item.selectedSize}
                              </span>
                            )}
                          </div>
                          
                          {item.rentalStartDate && (
                            <p className="text-[10px] text-cream/50 mt-1 flex items-center gap-1">
                              <Calendar size={11} className="text-gold" />
                              Event: {item.rentalStartDate}
                            </p>
                          )}
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gold/10">
                          <div className="font-serif text-gold font-bold text-base">
                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </div>

                          <div className="flex items-center border border-gold/20 rounded-lg bg-night-light">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="px-2 py-1 text-cream/70 hover:text-gold"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-bold text-cream">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="px-2 py-1 text-cream/70 hover:text-gold"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer Summary */}
              {cart.length > 0 && (
                <div className="p-6 bg-night border-t border-gold/20 space-y-4">
                  <div className="space-y-2 text-xs font-body">
                    <div className="flex justify-between text-cream/70">
                      <span>Garments Subtotal</span>
                      <span className="text-cream font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {securityDeposit > 0 && (
                      <div className="flex justify-between text-blue-300">
                        <span className="flex items-center gap-1">
                          Rental Security Deposit
                          <span className="text-[10px] text-cream/40">(Refundable)</span>
                        </span>
                        <span>₹{securityDeposit.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-emerald-400">
                      <span>Udaipur Fitting & Delivery</span>
                      <span>FREE</span>
                    </div>

                    <div className="pt-2 border-t border-gold/20 flex justify-between items-baseline">
                      <span className="font-serif text-cream text-sm">Estimated Total</span>
                      <span className="font-serif text-2xl text-gold font-bold">
                        ₹{total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={openCheckout}
                      className="w-full py-3.5 px-4 bg-gold hover:bg-copper text-night font-body text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} />
                      Proceed to Royal Checkout
                    </button>

                    <button
                      onClick={handleContinueShopping}
                      className="w-full py-2.5 px-4 border border-gold/30 text-cream/70 hover:text-gold rounded-xl font-body text-xs tracking-wider uppercase transition-colors"
                    >
                      Continue Browsing
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-cream/40 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} className="text-gold" />
                    Bespoke Trial & Doorstep Delivery in Udaipur
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

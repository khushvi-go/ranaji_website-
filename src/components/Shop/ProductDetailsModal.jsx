import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Crown, Sparkles, Heart, ShoppingBag, 
  Calendar, Check, ShieldCheck, Truck, Ruler, MessageCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import SizeGuideModal from './SizeGuideModal';

const ProductDetailsModal = () => {
  const { 
    quickViewProduct: product, 
    closeQuickView, 
    addToCart, 
    openCheckout, 
    toggleWishlist, 
    isWishlisted 
  } = useCart();

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  if (!product) return null;

  const [orderType, setOrderType] = useState(
    product.available?.includes('purchase') ? 'purchase' : 'rent'
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Standard Fit');
  const [rentalDays, setRentalDays] = useState(3);
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const currentPrice = orderType === 'rent' 
    ? (product.rentPrice || Math.round(product.price * 0.3)) 
    : product.price;

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, {
      orderType,
      selectedSize,
      rentalDays,
      rentalStartDate,
      quantity
    });
    closeQuickView();
  };

  const handleDirectBuy = () => {
    addToCart(product, {
      orderType,
      selectedSize,
      rentalDays,
      rentalStartDate,
      quantity
    });
    closeQuickView();
    openCheckout();
  };

  const handleWhatsAppEnquiry = () => {
    const message = encodeURIComponent(
      `*Pranam Ranaji Showroom Udaipur!*\n\nI am interested in:\n*${product.name}*\n- Category: ${product.category?.toUpperCase()} (${product.subcategory || ''})\n- Option: ${orderType === 'rent' ? `Rent (${rentalDays} Days)` : 'Purchase'}\n- Size: ${selectedSize}\n- Price: ₹${currentPrice?.toLocaleString('en-IN')}\n${rentalStartDate ? `- Event Date: ${rentalStartDate}\n` : ''}\nPlease let me know if this is available for trial/booking.`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickView}
          className="fixed inset-0 bg-night/90 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl bg-night-light border border-gold/30 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-night/80 border border-gold/30 text-cream/70 hover:text-gold flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>

          {/* Left Column: Image Gallery */}
          <div className="w-full md:w-1/2 bg-night p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gold/20">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gold/20 bg-night-light/50">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all ${
                  wishlisted 
                    ? 'bg-gold text-night' 
                    : 'bg-night/70 text-cream border border-gold/30 hover:text-gold'
                }`}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Badges */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-night/80 border border-gold/40 text-gold text-xs font-body tracking-wider uppercase backdrop-blur-sm rounded-full">
                  {product.category}
                </span>
                {product.subcategory && (
                  <span className="px-3 py-1 bg-night/80 border border-gold/20 text-cream/80 text-xs font-body tracking-wider uppercase backdrop-blur-sm rounded-full">
                    {product.subcategory}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-gold' : 'border-gold/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Highlights */}
            <div className="mt-4 pt-4 border-t border-gold/10 grid grid-cols-2 gap-3 text-cream/70 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold shrink-0" />
                <span>100% Royal Heritage</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gold shrink-0" />
                <span>Udaipur Showroom Fitting</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Form */}
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-1">
                <Crown size={14} />
                <span>Ranaji Exclusive</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-cream font-medium">
                {product.name}
              </h2>
              <p className="text-cream/60 font-body text-sm mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rent vs Purchase Switcher */}
            {product.available?.length > 1 && (
              <div className="bg-night/60 p-1.5 rounded-xl border border-gold/20 flex gap-1">
                {product.available.includes('purchase') && (
                  <button
                    type="button"
                    onClick={() => setOrderType('purchase')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-body font-medium transition-all flex items-center justify-center gap-2 ${
                      orderType === 'purchase'
                        ? 'bg-gold text-night font-semibold shadow-md'
                        : 'text-cream/70 hover:text-cream'
                    }`}
                  >
                    <Sparkles size={16} />
                    Buy to Own (₹{product.price?.toLocaleString('en-IN')})
                  </button>
                )}
                {product.available.includes('rent') && (
                  <button
                    type="button"
                    onClick={() => setOrderType('rent')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-body font-medium transition-all flex items-center justify-center gap-2 ${
                      orderType === 'rent'
                        ? 'bg-gold text-night font-semibold shadow-md'
                        : 'text-cream/70 hover:text-cream'
                    }`}
                  >
                    <Calendar size={16} />
                    Rent for Event (₹{product.rentPrice?.toLocaleString('en-IN') || Math.round(product.price * 0.3)})
                  </button>
                )}
              </div>
            )}

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-between">
              <div>
                <span className="text-cream/60 text-xs font-body block uppercase tracking-wider">
                  {orderType === 'rent' ? `Rental Fee (${rentalDays} Days)` : 'Purchase Price'}
                </span>
                <span className="font-serif text-3xl text-gold font-bold">
                  ₹{currentPrice?.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="px-3 py-1 bg-gold/20 border border-gold/40 text-gold text-xs rounded-full">
                {orderType === 'rent' ? 'Event Rental' : 'Brand New Item'}
              </span>
            </div>

            {/* Rental specific options */}
            {orderType === 'rent' && (
              <div className="space-y-3 p-4 bg-night/40 border border-gold/20 rounded-xl">
                <label className="block text-cream/80 text-xs font-body uppercase tracking-wider">
                  Rental Duration:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRentalDays(days)}
                      className={`py-2 px-3 rounded-lg text-xs font-body border transition-all ${
                        rentalDays === days
                          ? 'border-gold bg-gold/20 text-gold font-semibold'
                          : 'border-gold/20 text-cream/70 hover:border-gold/40'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <label className="block text-cream/70 text-xs font-body mb-1">
                    Event / Function Date (Optional):
                  </label>
                  <input
                    type="date"
                    value={rentalStartDate}
                    onChange={(e) => setRentalStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-night border border-gold/20 rounded-lg text-cream text-xs focus:border-gold focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-cream/50 italic">
                  * Note: Fully dry-cleaned & sanitised. A refundable security deposit of ₹1,500 applies at checkout.
                </p>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cream/80 text-xs font-body uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler size={14} className="text-gold" />
                    Select Size:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-gold text-xs hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    Size Guide & Fitting Chart →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 rounded-lg text-xs font-body border transition-all ${
                        selectedSize === size
                          ? 'border-gold bg-gold text-night font-bold shadow-md'
                          : 'border-gold/20 text-cream/70 hover:border-gold/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fabric & Color details */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-cream/70 border-t border-gold/10">
              {product.fabric && (
                <div>
                  <span className="text-cream/40 block">Fabric:</span>
                  <span className="text-cream">{product.fabric}</span>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-cream/40 block">Color & Styling:</span>
                  <span className="text-cream">{product.color}</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-cream/80 text-xs font-body uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-gold/30 rounded-lg bg-night">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-cream hover:text-gold transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm text-gold font-body font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-cream hover:text-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 bg-night border border-gold text-gold hover:bg-gold hover:text-night font-body text-sm font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag size={18} />
                  Add to Royal Bag
                </button>

                <button
                  onClick={handleDirectBuy}
                  className="flex-1 py-3 px-4 bg-gold hover:bg-copper text-night font-body text-sm font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles size={18} />
                  {orderType === 'rent' ? 'Rent Now' : 'Buy Now'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppEnquiry}
                className="w-full py-2.5 px-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 rounded-xl font-body text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Order / Enquire via WhatsApp Showroom
              </button>
            </div>
          </div>
        </motion.div>

        {/* Royal Sizing Guide Modal */}
        <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const CART_STORAGE_KEY = 'ranaji_cart_v2';
const WISHLIST_STORAGE_KEY = 'ranaji_wishlist_v2';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlist]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openQuickView = (product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  // Add to cart
  const addToCart = (product, options = {}) => {
    const orderType = options.orderType || (product.available?.includes('purchase') ? 'purchase' : 'rent');
    const selectedSize = options.selectedSize || (product.sizes?.[0] || 'Standard');
    const rentalDays = options.rentalDays || 3;
    const rentalStartDate = options.rentalStartDate || '';
    const quantity = Number(options.quantity) || 1;

    const unitPrice = orderType === 'rent'
      ? (product.rentPrice || Math.round(product.price * 0.3))
      : (product.price || 0);

    const cartItemId = `${product.id}-${orderType}-${selectedSize}-${rentalDays}-${rentalStartDate || 'immediate'}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prevCart,
        {
          cartItemId,
          product: {
            id: product.id,
            name: product.name,
            image: product.image,
            category: product.category,
            subcategory: product.subcategory,
            price: product.price,
            rentPrice: product.rentPrice
          },
          orderType,
          selectedSize,
          rentalDays,
          rentalStartDate,
          quantity,
          unitPrice
        }
      ];
    });

    toast.success(
      orderType === 'rent'
        ? `Added rental of ${product.name} to your Royal Bag!`
        : `Added ${product.name} to your Royal Bag!`,
      {
        icon: '👑',
        style: {
          background: '#1C1208',
          color: '#DEA044',
          border: '1px solid #DEA044',
        }
      }
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast('Item removed from Royal Bag', {
      icon: '🗑️',
      style: {
        background: '#1C1208',
        color: '#F5EFE0',
        border: '1px solid rgba(222, 160, 68, 0.3)',
      }
    });
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        toast('Removed from favorites', { icon: '🤍' });
        return prev.filter((id) => id !== productId);
      } else {
        toast.success('Added to Royal Wishlist!', {
          icon: '❤️',
          style: {
            background: '#1C1208',
            color: '#DEA044',
            border: '1px solid #DEA044',
          }
        });
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  // Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  // Security deposit for rentals: refundable ₹1,500 per rental piece
  const rentalItemsCount = cart
    .filter((item) => item.orderType === 'rent')
    .reduce((sum, item) => sum + item.quantity, 0);
  
  const securityDeposit = rentalItemsCount * 1500;
  const total = subtotal + securityDeposit;

  const value = {
    cart,
    cartCount,
    subtotal,
    securityDeposit,
    total,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    wishlist,
    toggleWishlist,
    isWishlisted,
    quickViewProduct,
    openQuickView,
    closeQuickView,
    isCheckoutOpen,
    openCheckout,
    closeCheckout
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

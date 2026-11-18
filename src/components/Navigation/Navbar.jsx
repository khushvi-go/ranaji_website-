import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Crown, User, ShoppingBag, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import Logo from '../UI/Logo';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import WishlistModal from '../Shop/WishlistModal';
import getInitials from '../../utils/getInitials';

const navLinks = [
  { name: 'Home', path: '/', id: 'home' },
  { name: 'Royal Shop', path: '/shop', id: 'shop' },
  { name: 'Collections', path: '/collections', id: 'collections' },
  { name: 'Services', path: '/services', id: 'services' },
  { name: 'Legacy', path: '/legacy', id: 'legacy' },
  { name: 'Gallery', path: '/gallery', id: 'gallery' },
  { name: 'Contact', path: '/contact', id: 'contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { isAuthenticated, user } = useUser();
  const { cartCount, openCart, wishlist } = useCart();
  const { settings } = useSettings();
  const location = useLocation();

  const initials = getInitials(user?.name);

  // Scroll listener for sticky navbar background styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-night/95 backdrop-blur-md shadow-2xl py-3 border-b border-gold/15' 
            : 'bg-gradient-to-b from-night/95 via-night/80 to-transparent py-4 md:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Ranaji Home"
            >
              <Logo size="small" hoverAnimated={true} />
              <motion.span 
                className="font-serif text-lg md:text-xl text-cream tracking-widest font-semibold group-hover:text-gold transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                RANAJI
              </motion.span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative font-body text-xs tracking-[0.15em] uppercase transition-colors duration-300 py-1 ${
                      active
                        ? 'text-gold font-bold'
                        : 'text-cream/80 hover:text-gold'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold shadow-[0_0_8px_rgba(222,160,68,0.8)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Icons: Wishlist, Shopping Bag, Contact Phone, User Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist Button */}
              <motion.button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 transition-all shadow-md flex items-center justify-center min-w-[42px] min-h-[42px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Royal Wishlist"
                aria-label="View Wishlist"
              >
                <Heart size={18} fill={wishlist?.length > 0 ? '#DEA044' : 'none'} />
                {wishlist?.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-night text-[10px] font-bold flex items-center justify-center shadow-lg border border-night"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </motion.button>

              {/* Shopping Bag Button (Live on Desktop & Mobile) */}
              <motion.button
                onClick={openCart}
                className="relative p-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 transition-all shadow-md flex items-center gap-2 min-w-[42px] min-h-[42px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Royal Shopping Bag"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag size={18} />
                <span className="text-xs font-serif font-bold hidden sm:inline">Bag</span>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-night text-[10px] font-bold flex items-center justify-center shadow-lg border border-night"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Showroom Phone (Desktop) */}
              <div className="hidden xl:flex items-center">
                <motion.a
                  href={`tel:${(settings?.phone || '+91 98765 43210').replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 text-xs text-gold/80 hover:text-cream transition-colors font-body tracking-wider px-2 py-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <Phone size={14} className="text-gold" />
                  <span>{settings?.phone || '+91 98765 43210'}</span>
                </motion.a>
              </div>

              {/* User Account / Login (Desktop) */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <Link to="/profile">
                    <motion.div
                      className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/40 text-gold rounded-xl hover:bg-gold/20 transition-colors cursor-pointer min-h-[38px]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="My Royal Profile"
                    >
                      <div className="w-6 h-6 rounded-full bg-night border border-gold tracking-wide text-gold flex items-center justify-center text-[10px] font-bold">
                        {initials || '?'}
                      </div>
                      <span className="font-body text-xs font-medium max-w-[90px] truncate">
                        {user?.name?.split(' ')[0] || 'Profile'}
                      </span>
                    </motion.div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cream/5 border border-gold/20 text-cream/90 rounded-xl hover:border-gold hover:text-gold text-xs font-body transition-colors min-h-[38px]">
                        <User size={13} />
                        <span>Login</span>
                      </div>
                    </Link>

                    <Link to="/register">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-night font-bold rounded-xl hover:bg-copper text-xs font-body tracking-wider uppercase transition-colors shadow min-h-[38px]">
                        <Crown size={13} />
                        <span>Join</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gold p-2 hover:bg-gold/10 rounded-xl transition-colors min-w-[42px] min-h-[42px] flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu 
            links={navLinks} 
            currentPath={location.pathname}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Royal Wishlist Modal */}
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Navbar;

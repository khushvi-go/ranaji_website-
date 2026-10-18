import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Crown, User, ShoppingBag, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import Logo from '../UI/Logo';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import WishlistModal from '../Shop/WishlistModal';
import getInitials from '../../utils/getInitials';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { isAuthenticated, user } = useUser();
  const { cartCount, openCart, wishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const initials = getInitials(user?.name);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Royal Shop', href: '/shop', isRoute: true },
    { name: 'Collections', href: '#collections', isHash: true },
    { name: 'Services', href: '#services', isHash: true },
    { name: 'Legacy', href: '#about', isHash: true },
    { name: 'Gallery', href: '#gallery', isHash: true },
    { name: 'Contact', href: '#contact', isHash: true },
  ];

  const handleLinkClick = (link) => {
    setIsMobileMenuOpen(false);
    if (link.isRoute) {
      navigate(link.href);
      return;
    }

    if (link.isHash) {
      if (location.pathname !== '/') {
        navigate(`/${link.href}`);
      } else {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-night/95 backdrop-blur-md shadow-2xl py-3 border-b border-gold/15' 
            : 'bg-gradient-to-b from-night/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              <Logo size="small" hoverAnimated={true} />
              <motion.span 
                className="font-serif text-lg md:text-xl text-cream tracking-widest font-semibold group-hover:text-gold transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                RANAJI
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link)}
                  className={`relative font-body text-xs tracking-[0.15em] uppercase transition-colors duration-300 py-1 ${
                    (link.isRoute && location.pathname === link.href)
                      ? 'text-gold font-bold'
                      : 'text-cream/80 hover:text-gold'
                  }`}
                >
                  {link.name}
                  {(link.isRoute && location.pathname === link.href) && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right Action Icons: Shopping Bag, Call, Auth */}
            <div className="flex items-center gap-3">
              {/* Wishlist Button */}
              <motion.button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 transition-all shadow-md flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Royal Wishlist"
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
                className="relative p-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 transition-all shadow-md flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Royal Bag"
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

              {/* Call Us Button (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <motion.a
                  href="tel:+919876543210"
                  className="flex items-center gap-1.5 text-xs text-gold/80 hover:text-cream transition-colors font-body tracking-wider"
                  whileHover={{ scale: 1.02 }}
                >
                  <Phone size={14} />
                  <span>+91 98765 43210</span>
                </motion.a>

                {/* User Account / Login */}
                {isAuthenticated ? (
                  <Link to="/profile">
                    <motion.div
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-gold/10 border border-gold/40 text-gold rounded-xl hover:bg-gold/20 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="My Profile"
                    >
                      <div className="w-7 h-7 rounded-full bg-night border border-gold tracking-wide text-gold flex items-center justify-center text-[10px] font-bold">
                        {initials || '?'}
                      </div>
                      <span className="font-body text-xs font-medium">
                        {user?.name?.split(' ')[0] || 'Profile'}
                      </span>
                    </motion.div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cream/5 border border-gold/20 text-cream/90 rounded-xl hover:border-gold hover:text-gold text-xs font-body transition-colors">
                        <User size={13} />
                        <span>Login</span>
                      </div>
                    </Link>

                    <Link to="/register">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-night font-bold rounded-xl hover:bg-copper text-xs font-body tracking-wider uppercase transition-colors shadow">
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
                className="lg:hidden text-gold p-2 hover:bg-gold/10 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu 
            links={navLinks} 
            onClose={() => setIsMobileMenuOpen(false)}
            onNavigate={(href) => {
              const matched = navLinks.find((l) => l.href === href);
              if (matched) handleLinkClick(matched);
            }}
          />
        )}
      </AnimatePresence>

      {/* Royal Wishlist Modal */}
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Navbar;

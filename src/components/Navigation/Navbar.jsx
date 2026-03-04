import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Crown, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import Logo from '../UI/Logo';
import { useUser } from '../../context/UserContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Collections', href: '#collections' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-night/95 backdrop-blur-md shadow-lg py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="#hero"
              onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}
              className="flex items-center gap-3"
            >
              <Logo size="small" hoverAnimated={true} />
              <motion.span 
                className={`font-display text-lg text-cream hidden sm:block transition-opacity duration-300 tracking-wider ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                RANAJI
              </motion.span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="relative font-body text-sm text-cream/80 hover:text-gold transition-colors duration-300 tracking-wider uppercase"
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-0 h-px bg-gold"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-gold hover:text-cream transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Phone size={18} />
                <span className="font-body text-sm">Call Us</span>
              </motion.a>
              <motion.button
                onClick={() => scrollToSection('#contact')}
                className="px-6 py-2 border border-gold text-gold font-body text-sm tracking-wider uppercase hover:bg-gold hover:text-night transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book Now
              </motion.button>
              
              {/* User Account */}
              {isAuthenticated ? (
                <Link to="/profile">
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-lg hover:bg-gold/30 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="My Profile"
                  >
                    <User size={16} />
                    <span className="font-body text-sm">{user?.name?.split(' ')[0] || 'Profile'}</span>
                  </motion.div>
                </Link>
              ) : (
                <Link to="/login">
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 bg-cream/10 border border-cream/30 text-cream rounded-lg hover:bg-cream/20 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Login"
                  >
                    <User size={16} />
                    <span className="font-body text-sm">Login</span>
                  </motion.div>
                </Link>
              )}
              
              <motion.a
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 text-gold rounded-lg hover:bg-gold/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Admin Panel"
              >
                <Crown size={16} />
                <span className="font-body text-sm">Admin</span>
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gold p-2"
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu 
            links={navLinks} 
            onClose={() => setIsMobileMenuOpen(false)}
            onNavigate={scrollToSection}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

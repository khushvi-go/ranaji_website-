import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Crown, ArrowRight, ShoppingBag, User, LogIn, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../UI/Logo';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';

const MobileMenu = ({ links, currentPath, onClose }) => {
  const { settings } = useSettings();
  const { isAuthenticated, user } = useUser();

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.25,
        when: 'afterChildren'
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        when: 'beforeChildren',
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -16 },
    open: { opacity: 1, x: 0 }
  };

  const isLinkActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <motion.div
      variants={menuVariants}
      initial="closed"
      animate="open"
      exit="closed"
      className="fixed inset-0 z-40 bg-night/98 backdrop-blur-xl pt-20 overflow-y-auto"
    >
      <div className="max-w-md mx-auto px-6 py-6 pb-28">
        
        {/* User Account Bar on Mobile */}
        <motion.div variants={itemVariants} className="mb-6 p-4 rounded-2xl bg-cream/5 border border-gold/20 flex items-center justify-between">
          {isAuthenticated ? (
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold text-gold flex items-center justify-center font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-cream text-sm font-semibold truncate">{user?.name || 'Valued Patron'}</p>
                <p className="font-body text-gold/70 text-xs">View Royal Profile & Orders</p>
              </div>
              <ArrowRight size={16} className="text-gold shrink-0" />
            </Link>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 py-2 px-3 text-center bg-cream/10 hover:bg-cream/15 text-cream rounded-xl text-xs font-body font-medium flex items-center justify-center gap-1.5 border border-gold/20"
              >
                <LogIn size={13} className="text-gold" />
                <span>Patron Login</span>
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 py-2 px-3 text-center bg-gold text-night rounded-xl text-xs font-body font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Crown size={13} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Navigation Page Links */}
        <nav className="space-y-1">
          {links.map((link, index) => {
            const active = isLinkActive(link.path);
            return (
              <motion.div key={link.name} variants={itemVariants}>
                <Link
                  to={link.path}
                  onClick={onClose}
                  className={`w-full flex items-center justify-between py-3.5 px-3 rounded-xl border transition-all duration-300 group ${
                    active 
                      ? 'bg-gold/15 border-gold/40 text-gold' 
                      : 'border-transparent text-cream/80 hover:bg-cream/5 hover:text-gold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {active ? (
                      <Crown size={18} className="text-gold shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gold/30 group-hover:bg-gold transition-colors" />
                    )}
                    <span className={`font-serif text-xl tracking-wide ${
                      active ? 'font-bold text-gold' : 'text-cream/90'
                    }`}>
                      {link.name}
                    </span>
                  </div>
                  <span className={`text-xs font-body tracking-widest ${
                    active ? 'text-gold font-bold' : 'text-copper/50'
                  }`}>
                    0{index + 1}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Dedicated Quick Action: Book Appointment CTA */}
        <motion.div variants={itemVariants} className="mt-6">
          <Link
            to="/contact"
            onClick={onClose}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-r from-gold via-copper to-gold text-night text-xs font-serif uppercase tracking-widest font-bold shadow-lg hover:brightness-110 transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>Book Royal Appointment</span>
            </div>
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Contact Info Preview */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-gold/15 space-y-3"
        >
          <div className="flex items-center gap-3 text-cream/70">
            <Phone size={16} className="text-gold shrink-0" />
            <a 
              href={`tel:${(settings?.phone || '+91 98765 43210').replace(/\s+/g, '')}`}
              className="font-body text-xs hover:text-gold transition-colors tracking-wider"
            >
              {settings?.phone || '+91 98765 43210'}
            </a>
          </div>
          <div className="flex items-center gap-3 text-cream/70">
            <MapPin size={16} className="text-gold shrink-0" />
            <span className="font-body text-xs line-clamp-1">{settings?.address || 'Surajpole, Udaipur, Rajasthan'}</span>
          </div>
          <div className="flex items-center gap-3 text-cream/70">
            <Clock size={16} className="text-gold shrink-0" />
            <span className="font-body text-xs">{settings?.openingHours || 'Mon-Sun: 10AM - 9PM'}</span>
          </div>
        </motion.div>

        {/* Branding Footer */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 flex flex-col items-center justify-center gap-2"
        >
          <Logo size="small" />
          <p className="font-devanagari text-gold/50 text-xs tracking-widest">
            अतिथि देवो भव · The Guest is God
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;

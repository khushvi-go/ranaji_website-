import { motion } from 'framer-motion';
import { Phone, MapPin, Clock } from 'lucide-react';
import Logo from '../UI/Logo';

const MobileMenu = ({ links, onClose, onNavigate }) => {
  const menuVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
        when: 'afterChildren'
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const handleNavigate = (href) => {
    onNavigate(href);
    onClose();
  };

  return (
    <motion.div
      variants={menuVariants}
      initial="closed"
      animate="open"
      exit="closed"
      className="fixed inset-0 z-40 bg-night pt-24"
    >
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link, index) => (
            <motion.a
              key={link.name}
              variants={itemVariants}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavigate(link.href); }}
              className="block py-4 border-b border-gold/10 group"
            >
              <span className="font-serif text-3xl text-cream/80 group-hover:text-gold transition-colors duration-300">
                {link.name}
              </span>
              <span className="ml-4 text-copper text-sm font-body">
                0{index + 1}
              </span>
            </motion.a>
          ))}
        </nav>

        {/* Contact Info */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 space-y-4"
        >
          <div className="flex items-center gap-3 text-cream/60">
            <Phone size={18} className="text-gold" />
            <span className="font-body text-sm">+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-3 text-cream/60">
            <MapPin size={18} className="text-gold" />
            <span className="font-body text-sm">Surajpole, Udaipur</span>
          </div>
          <div className="flex items-center gap-3 text-cream/60">
            <Clock size={18} className="text-gold" />
            <span className="font-body text-sm">Mon-Sun: 10AM - 9PM</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          variants={itemVariants}
          onClick={() => handleNavigate('#contact')}
          className="w-full mt-8 py-4 bg-gold-gradient text-night font-body font-medium tracking-wider uppercase"
          whileTap={{ scale: 0.98 }}
        >
          Book Your Appointment
        </motion.button>

        {/* Logo */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 flex justify-center"
        >
          <Logo size="medium" />
        </motion.div>

        {/* Decorative Element */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="font-body text-cream/30 text-xs tracking-wider">
            The Guest is God
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;

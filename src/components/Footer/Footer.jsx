import { motion } from 'framer-motion';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import Logo from '../UI/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Collections', href: '#collections' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-night border-t border-gold/10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Logo size="medium" />
                <p className="font-display text-cream text-lg tracking-wider">RANAJI</p>
              </div>
              <p className="font-body text-cream/60 text-sm mt-4 leading-relaxed">
                An Exclusive Royal Wedding Showroom. Dress like the Kings of Mewar.
              </p>
              
              {/* Social Icons */}
              <div className="flex gap-4 mt-6">
                <motion.a
                  href="https://www.instagram.com/ranaji_udaipur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-night transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={18} />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/share/18PhEG4c3J/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-night transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={18} />
                </motion.a>
                <motion.a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-night transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Chat with us on WhatsApp"
                >
                  <Phone size={18} />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-serif text-lg text-cream mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                      className="font-body text-cream/60 hover:text-gold transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-serif text-lg text-cream mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold shrink-0 mt-1" />
                  <span className="font-body text-cream/60 text-sm">
                    24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, 
                    Sec-5, Surajpole, Udaipur – 313001
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-gold shrink-0" />
                  <a 
                    href="tel:+919876543210"
                    className="font-body text-cream/60 hover:text-gold transition-colors text-sm"
                  >
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-gold shrink-0" />
                  <a 
                    href="mailto:info@ranajiudaipur.com"
                    className="font-body text-cream/60 hover:text-gold transition-colors text-sm"
                  >
                    info@ranajiudaipur.com
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Philosophy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center md:text-left"
            >
              <p className="font-devanagari text-gold/40 text-3xl">अतिथि देवो भव</p>
              <p className="font-body text-cream/40 text-sm mt-2 tracking-wider">
                The Guest is God
              </p>
              <p className="font-body text-cream/30 text-xs mt-4 leading-relaxed">
                At Ranaji, we believe in the ancient Indian philosophy of treating 
                every guest with the utmost respect and care. Your royal experience 
                is our highest priority.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="font-body text-cream/40 text-sm text-center md:text-left">
              © {currentYear} Ranaji – An Exclusive Royal Wedding Showroom, Udaipur. 
              All rights reserved.
            </p>

            {/* Decorative Divider */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-px bg-gold/20" />
              <div className="w-1.5 h-1.5 rotate-45 bg-gold/40" />
              <div className="w-8 h-px bg-gold/20" />
            </div>

            {/* Made With Love */}
            <p className="font-body text-cream/40 text-sm">
              Made with <span className="text-crimson">♥</span> in Mewar
            </p>
          </div>
        </div>
      </div>

      {/* Mobile WhatsApp Button */}
      <motion.a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Phone size={24} className="text-white" />
      </motion.a>
    </footer>
  );
};

export default Footer;

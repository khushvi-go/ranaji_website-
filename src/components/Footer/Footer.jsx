import { motion } from 'framer-motion';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../UI/Logo';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  const cleanWaNumber = (settings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const displayPhone = settings?.phone || '+91 98765 43210';
  const telHref = `tel:${displayPhone.replace(/\s+/g, '')}`;
  const displayEmail = settings?.customerServiceEmail || settings?.email || 'info@ranajiudaipur.com';
  const displayAddress = settings?.address || '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001';
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/ranaji_udaipur';
  const facebookUrl = settings?.facebookUrl || 'https://www.facebook.com/share/18PhEG4c3J/';

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Royal Shop', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'Services', path: '/services' },
    { name: 'Legacy', path: '/legacy' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="bg-night border-t border-gold/15">
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
              <Link to="/" className="flex items-center gap-3 mb-4 group inline-flex">
                <Logo size="medium" />
                <p className="font-display text-cream text-lg tracking-wider group-hover:text-gold transition-colors">
                  {settings?.showroomName ? settings.showroomName.toUpperCase() : 'RANAJI'}
                </p>
              </Link>
              <p className="font-body text-cream/60 text-sm mt-3 leading-relaxed">
                {settings?.tagline || 'An Exclusive Royal Wedding Showroom. Dress like the Kings and Queens of Mewar.'}
              </p>
              
              {/* Social Icons */}
              <div className="flex gap-4 mt-6">
                <motion.a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-night transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={18} />
                </motion.a>
                <motion.a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-night transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={18} />
                </motion.a>
                <motion.a
                  href={`https://wa.me/${cleanWaNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-night transition-all"
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
              <h4 className="font-serif text-lg text-cream mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>Showroom Pages</span>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="font-body text-cream/70 hover:text-gold transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-gold/40 group-hover:bg-gold rounded-full transition-colors" />
                      <span>{link.name}</span>
                    </Link>
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
              <h4 className="font-serif text-lg text-cream mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>Udaipur Showroom</span>
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                  <span className="font-body text-cream/60 text-sm leading-relaxed">
                    {displayAddress}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-gold shrink-0" />
                  <a 
                    href={telHref}
                    className="font-body text-cream/60 hover:text-gold transition-colors text-sm"
                  >
                    {displayPhone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-gold shrink-0" />
                  <a 
                    href={`mailto:${displayEmail}`}
                    className="font-body text-cream/60 hover:text-gold transition-colors text-sm break-all"
                  >
                    {displayEmail}
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
              className="text-left"
            >
              <p className="font-devanagari text-gold/60 text-3xl">अतिथि देवो भव</p>
              <p className="font-serif text-cream/80 text-sm mt-2 tracking-widest uppercase">
                The Guest is God
              </p>
              <p className="font-body text-cream/50 text-xs mt-4 leading-relaxed">
                At Ranaji, we believe in the timeless Mewari royal tradition of dressing 
                every bride and groom with regal honor. Your royal wedding coronation 
                is our highest devotion.
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
            <p className="font-body text-cream/40 text-xs text-center md:text-left">
              © {currentYear} {settings?.showroomName || 'Ranaji'} – An Exclusive Royal Wedding Showroom, Udaipur. 
              All rights reserved.
            </p>

            {/* Decorative Divider */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-px bg-gold/20" />
              <div className="w-1.5 h-1.5 rotate-45 bg-gold/40" />
              <div className="w-8 h-px bg-gold/20" />
            </div>

            {/* Made With Love */}
            <p className="font-body text-cream/40 text-xs">
              Handcrafted with <span className="text-crimson">♥</span> in Udaipur, Mewar
            </p>
          </div>
        </div>
      </div>

      {/* Mobile WhatsApp Floating Button */}
      <motion.a
        href={`https://wa.me/${cleanWaNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 lg:hidden w-13 h-13 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl p-3 border-2 border-white/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Direct WhatsApp Consultation"
      >
        <Phone size={22} fill="white" />
      </motion.a>
    </footer>
  );
};

export default Footer;

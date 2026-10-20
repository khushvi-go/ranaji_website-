import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shirt, Ruler, Users, ArrowRight, Crown, Sparkles } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import { useAdmin } from '../../context/AdminContext';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  rental: Shirt,
  fitting: Ruler,
  ensemble: Users,
  Crown: Crown
};

const defaultColors = ['#9D473A', '#DEA044', '#416A81'];

// Individual Flip Card Component
const ServiceFlipCard = ({ service, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const IconComponent = iconMap[service.icon] || Shirt;
  const accentColor = service.accentColor || defaultColors[index % defaultColors.length];
  const features = Array.isArray(service.features) ? service.features : [];

  return (
    <motion.div
      className="service-card group relative h-[420px] w-full [perspective:2000px]"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d] transition-all duration-700"
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* FRONT OF CARD */}
        <div
          className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(0deg)] overflow-hidden"
        >
          <div 
            className="relative h-full p-8 border border-gold/20 bg-gradient-to-b from-night to-night-light transition-all duration-500"
            style={{ 
              boxShadow: `inset 0 0 0 1px ${accentColor}15, 0 10px 40px -10px ${accentColor}20`
            }}
          >
            {/* Animated border gradient on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, transparent 40%, ${accentColor}30 50%, transparent 60%)`,
                backgroundSize: '200% 200%',
              }}
              animate={isFlipped ? {
                backgroundPosition: ['200% 200%', '-200% -200%'],
              } : { backgroundPosition: '0% 0%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Corner Accents */}
            <div 
              className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 transition-all duration-300 group-hover:w-12 group-hover:h-12"
              style={{ borderColor: accentColor }}
            />
            <div 
              className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 transition-all duration-300 group-hover:w-12 group-hover:h-12"
              style={{ borderColor: accentColor }}
            />
            <div 
              className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 transition-all duration-300 group-hover:w-12 group-hover:h-12"
              style={{ borderColor: accentColor }}
            />
            <div 
              className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 transition-all duration-300 group-hover:w-12 group-hover:h-12"
              style={{ borderColor: accentColor }}
            />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Top Section - Icon & Badge */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <motion.div 
                    className="relative w-16 h-16 flex items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${accentColor}15` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <IconComponent size={32} style={{ color: accentColor }} />
                    {/* Pulsing ring around icon */}
                    <div 
                      className="absolute inset-0 rounded-xl animate-ping opacity-20 pointer-events-none"
                      style={{ backgroundColor: accentColor }}
                    />
                  </motion.div>

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full">
                    <Sparkles size={12} className="text-gold" />
                    <span className="text-gold text-xs font-serif tracking-wider uppercase">Royal</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl text-cream mb-4 tracking-wide group-hover:text-gold transition-colors duration-300">
                  {service.title}
                </h3>

                <p className="font-body text-cream/70 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Bottom Section - Flip Prompt */}
              <div className="pt-6 border-t border-gold/10 flex items-center justify-between">
                <span className="font-serif text-xs text-gold/60 tracking-widest uppercase">
                  Explore Details
                </span>
                <motion.div 
                  className="flex items-center gap-2 text-gold text-xs font-body tracking-wider"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span>Hover to flip</span>
                  <ArrowRight size={14} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
        >
          <div 
            className="relative h-full p-8 border bg-night-light flex flex-col justify-between"
            style={{ 
              borderColor: `${accentColor}60`,
              boxShadow: `0 20px 50px -10px ${accentColor}30`
            }}
          >
            {/* Background Texture */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            />

            {/* Corner Borders */}
            <div 
              className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2"
              style={{ borderColor: accentColor }}
            />
            <div 
              className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2"
              style={{ borderColor: accentColor }}
            />
            <div 
              className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2"
              style={{ borderColor: accentColor }}
            />
            <div 
              className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2"
              style={{ borderColor: accentColor }}
            />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Crown size={20} style={{ color: accentColor }} />
              <h3 className="font-serif text-xl text-cream">Features</h3>
            </div>

            {/* Features List with stagger animation */}
            <ul className="space-y-4">
              {features.map((feature, idx) => (
                <motion.li 
                  key={idx} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isFlipped ? 1 : 0, 
                    x: isFlipped ? 0 : -20 
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: isFlipped ? idx * 0.1 + 0.2 : 0,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <motion.div
                    className="w-6 h-6 flex items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <ArrowRight size={12} style={{ color: accentColor }} />
                  </motion.div>
                  <span className="font-body text-cream/80 text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.div 
              className="pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isFlipped ? 1 : 0, 
                y: isFlipped ? 0 : 20 
              }}
              transition={{ duration: 0.4, delay: isFlipped ? 0.6 : 0 }}
            >
              <motion.a
                href="#contact"
                className="group/btn relative flex items-center justify-between w-full px-5 py-3 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}20, transparent)`,
                  border: `1px solid ${accentColor}40`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 font-body text-sm text-cream tracking-wider">
                  Book Appointment
                </span>
                <ArrowRight 
                  size={16} 
                  className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" 
                  style={{ color: accentColor }}
                />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ExperienceSection = () => {
  const sectionRef = useRef(null);
  const { services, loading } = useAdmin();

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-night overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#DEA044" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="What We Offer"
          title="The Ranaji Experience"
        />

        {/* Service Cards with Flip Effect */}
        {loading && services.length === 0 ? (
          <div className="mt-16 text-center text-gold/60 font-body py-12">
            Loading royal services from MongoDB Atlas...
          </div>
        ) : services.length === 0 ? (
          <div className="mt-16 text-center text-cream/50 font-body py-12">
            Showroom services will be announced shortly.
          </div>
        ) : (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceFlipCard 
                key={service.id || service._id || index} 
                service={service} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;

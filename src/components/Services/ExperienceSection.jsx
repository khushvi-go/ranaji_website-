import { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shirt, Ruler, Users, ArrowRight, Crown, Sparkles } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import { services } from '../../data/services';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  rental: Shirt,
  fitting: Ruler,
  ensemble: Users
};

// Individual Flip Card Component
const ServiceFlipCard = ({ service, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const IconComponent = iconMap[service.icon];

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
              boxShadow: `inset 0 0 0 1px ${service.accentColor}15, 0 10px 40px -10px ${service.accentColor}20`
            }}
          >
            {/* Animated border gradient on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, transparent 40%, ${service.accentColor}30 50%, transparent 60%)`,
                backgroundSize: '200% 200%',
              }}
              animate={isFlipped ? {
                backgroundPosition: ['200% 200%', '-200% -200%'],
              } : { backgroundPosition: '0% 0%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Corner Decorations */}
            <div 
              className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 transition-all duration-500 opacity-0 group-hover:opacity-100"
              style={{ borderColor: service.accentColor }}
            />
            <div 
              className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 transition-all duration-500 opacity-0 group-hover:opacity-100"
              style={{ borderColor: service.accentColor }}
            />
            <div 
              className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 transition-all duration-500 opacity-0 group-hover:opacity-100"
              style={{ borderColor: service.accentColor }}
            />
            <div 
              className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 transition-all duration-500 opacity-0 group-hover:opacity-100"
              style={{ borderColor: service.accentColor }}
            />

            {/* Accent Line */}
            <div 
              className="absolute top-0 left-0 w-full h-1 transition-all duration-500"
              style={{ backgroundColor: service.accentColor }}
            />

            {/* Animated Background Circles */}
            <div className="absolute inset-0 flex items-start justify-center pt-16 overflow-hidden pointer-events-none">
              <div className="relative flex h-[120px] w-[240px] items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    className="absolute rounded-full"
                    key={i}
                    style={{
                      width: `${40 + i * 15}px`,
                      height: `${40 + i * 15}px`,
                      border: `1px solid ${service.accentColor}`,
                      opacity: 0.1 + i * 0.05,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.1 + i * 0.05, 0.2 + i * 0.05, 0.1 + i * 0.05],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <motion.div 
              className="relative w-16 h-16 flex items-center justify-center mb-6 mx-auto"
              style={{ 
                backgroundColor: `${service.accentColor}15`,
                border: `1px solid ${service.accentColor}40`
              }}
              animate={isFlipped ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <IconComponent 
                size={28} 
                style={{ color: service.accentColor }}
              />
            </motion.div>

            {/* Content */}
            <div className="relative text-center">
              <h3 className="font-serif text-2xl text-cream mb-4 group-hover:text-gold transition-colors duration-300">
                {service.title}
              </h3>
              <p className="font-body text-cream/60 leading-relaxed text-sm">
                {service.description}
              </p>
            </div>

            {/* Flip Hint */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 text-cream/40">
              <Sparkles size={14} style={{ color: service.accentColor }} />
              <span className="text-xs font-body tracking-wider uppercase">Hover to explore</span>
              <Sparkles size={14} style={{ color: service.accentColor }} />
            </div>

            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
              initial={{ x: '-200%' }}
              animate={isFlipped ? { x: '200%' } : { x: '-200%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
        >
          <div 
            className="relative h-full p-8 border bg-gradient-to-b from-night-light to-night"
            style={{ 
              borderColor: `${service.accentColor}40`,
              boxShadow: `inset 0 0 0 1px ${service.accentColor}20, 0 10px 40px -10px ${service.accentColor}30`
            }}
          >
            {/* Corner Decorations */}
            <div 
              className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2"
              style={{ borderColor: service.accentColor }}
            />
            <div 
              className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2"
              style={{ borderColor: service.accentColor }}
            />
            <div 
              className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2"
              style={{ borderColor: service.accentColor }}
            />
            <div 
              className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2"
              style={{ borderColor: service.accentColor }}
            />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Crown size={20} style={{ color: service.accentColor }} />
              <h3 className="font-serif text-xl text-cream">Features</h3>
            </div>

            {/* Features List with stagger animation */}
            <ul className="space-y-4">
              {service.features.map((feature, idx) => (
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
                    className="w-6 h-6 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${service.accentColor}20` }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <ArrowRight size={12} style={{ color: service.accentColor }} />
                  </motion.div>
                  <span className="font-body text-cream/80 text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.div 
              className="absolute bottom-8 left-8 right-8"
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
                  background: `linear-gradient(135deg, ${service.accentColor}20, transparent)`,
                  border: `1px solid ${service.accentColor}40`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 font-body text-sm text-cream tracking-wider">
                  Book Now
                </span>
                <ArrowRight 
                  size={16} 
                  className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" 
                  style={{ color: service.accentColor }}
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
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceFlipCard 
              key={service.id} 
              service={service} 
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Crown, Palette } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';

const UdaipurSection = () => {
  const sectionRef = useRef(null);
  const palaceRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const miniCards = [
    {
      icon: MapPin,
      text: "Located in Surajpole, Udaipur's vibrant wedding district"
    },
    {
      icon: Crown,
      text: "Inspired by Mewar's royal Rajput heritage"
    },
    {
      icon: Palette,
      text: "Every design rooted in traditional Mewadi craftsmanship"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-night overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-night via-night/95 to-night" />
        
        {/* Palace Silhouette */}
        <svg 
          ref={palaceRef}
          className="absolute bottom-0 right-0 w-full h-96 opacity-5"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMaxYMax slice"
        >
          <motion.path
            d="M0 300 L0 200 L50 200 L50 150 L100 150 L100 100 L150 100 L150 80 L200 80 L200 120 L250 120 L250 60 L300 60 L300 100 L350 100 L350 40 L400 40 L400 80 L450 80 L450 120 L500 120 L500 70 L550 70 L550 110 L600 110 L600 150 L650 150 L650 200 L700 200 L700 250 L800 250 L800 300 Z"
            fill="#DEA044"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.05 } : {}}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left - Vertical Text */}
          <div className="lg:col-span-2 hidden lg:flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <span 
                className="font-devanagari text-[120px] text-gold/10 font-bold tracking-wider"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                उदयपुर
              </span>
            </motion.div>
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-6">
            <SectionHeading
              subtitle="Our Roots"
              title="Udaipur in Our Soul"
              centered={false}
              className="text-left"
            />

            <motion.blockquote
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8"
            >
              <p className="font-serif text-2xl md:text-3xl text-cream/90 italic leading-relaxed">
                &ldquo;In the land where kings once rode on elephants through 
                golden gates — we dress the kings of today.&rdquo;
              </p>
            </motion.blockquote>

            {/* Mini Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 space-y-4"
            >
              {miniCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-gold/5 border-l-2 border-gold/30"
                >
                  <card.icon className="text-gold shrink-0 mt-1" size={20} />
                  <p className="font-body text-cream/70">{card.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right - Decorative Element */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Decorative Frame */}
              <div className="relative aspect-[4/5] border border-gold/20 p-4">
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-gold" />
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-gold" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-gold" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-gold" />
                
                <img
                  src="/images/City-Palace-Udaipur.jpg"
                  alt="Udaipur City Palace"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Text */}
                <div className="absolute bottom-4 left-4 right-4 bg-night/90 p-4">
                  <p className="font-devanagari text-gold text-lg">मेवाड़ की शान</p>
                  <p className="font-body text-cream/60 text-xs mt-1">Pride of Mewar</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UdaipurSection;

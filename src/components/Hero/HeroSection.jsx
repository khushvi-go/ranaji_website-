import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ChevronDown, ArrowRight } from 'lucide-react';
import GoldButton from '../UI/GoldButton';
import GoldParticles from './GoldParticles';
import JaliBackground from './JaliBackground';
import { useMouseParallax } from '../../hooks/useMouseParallax';

const HeroSection = () => {
  const headlineRef = useRef(null);
  const { ref: parallaxRef, position } = useMouseParallax(15);

  useEffect(() => {
    // GSAP SplitText-like animation for headline
    const headline = headlineRef.current;
    if (!headline) return;

    const lines = headline.querySelectorAll('.headline-line');
    
    gsap.fromTo(lines, 
      { y: 100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.5
      }
    );
  }, []);

  const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      ref={parallaxRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-night"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <JaliBackground />
      <GoldParticles />
      
      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Logo Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="font-devanagari text-gold text-lg tracking-wider">
                राजसी वस्त्रों का अनूठा संसार
              </span>
            </motion.div>

            {/* Main Headline */}
            <div ref={headlineRef} className="overflow-hidden mb-8">
              <div className="headline-line overflow-hidden">
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream/80 font-light">
                  Dress Like
                </h1>
              </div>
              <div className="headline-line overflow-hidden">
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-gold font-semibold">
                  The Kings
                </h1>
              </div>
              <div className="headline-line overflow-hidden">
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-copper italic">
                  of Mewar
                </h1>
              </div>
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="font-body text-cream/70 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Experience the grandeur of Rajasthan&apos;s royal wedding fashion. 
              Sherwanis, Turbans & Bridal Couture crafted for your most royal day.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <GoldButton onClick={() => scrollToSection('#collections')}>
                <span className="flex items-center gap-2">
                  Explore Collection
                  <ArrowRight size={18} />
                </span>
              </GoldButton>
              <GoldButton variant="secondary" onClick={() => scrollToSection('#contact')}>
                Book a Fitting
              </GoldButton>
            </motion.div>
          </div>

          {/* Right Content - Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative hidden lg:block"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`
            }}
          >
            <div className="relative animate-float">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border border-gold/30 rounded-sm" />
              <div className="absolute -inset-8 border border-copper/20 rounded-sm" />
              
              {/* Main Image Card */}
              <div className="relative bg-gradient-to-br from-crimson/20 to-night p-1 rounded-sm">
                <div className="relative overflow-hidden rounded-sm aspect-[3/4]">
                  <img
                    src="/images/468620690_18338704426195142_1504528542693550564_n.jpg"
                    alt="Royal Sherwani"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                  
                  {/* Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-body text-gold text-sm tracking-wider uppercase mb-2">
                      Featured Collection
                    </p>
                    <h3 className="font-serif text-2xl text-cream">
                      The Maharaja Sherwani
                    </h3>
                    <p className="font-body text-cream/60 text-sm mt-2">
                      Premium embroidered in deep maroon
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="absolute -top-4 -right-4 bg-gold-gradient text-night px-4 py-2 rounded-sm"
              >
                <span className="font-display text-sm font-bold">EST. 2016</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-devanagari text-gold/60 text-sm">स्क्रॉल करें</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="text-gold/60" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

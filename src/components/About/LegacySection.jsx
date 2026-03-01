import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../UI/SectionHeading';
import OrnamentalDivider from '../UI/OrnamentalDivider';

gsap.registerPlugin(ScrollTrigger);

const LegacySection = () => {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: '-100px' });

  const stats = [
    { number: 500, suffix: '+', label: 'Happy Customers' },
    { number: 200, suffix: '+', label: 'Sherwani Designs' },
    { number: 4.5, suffix: '★', label: 'Average Rating' },
    { number: 8, suffix: '+', label: 'Years of Craftsmanship' },
  ];

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.legacy-card');
    if (!cards) return;

    const triggers = [];
    cards.forEach((card, index) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      tl.fromTo(card,
        { 
          opacity: 0, 
          y: 50,
          rotation: -5 + index * 2
        },
        { 
          opacity: 1, 
          y: 0,
          rotation: -3 + index * 3,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power3.out'
        }
      );
      
      if (tl.scrollTrigger) {
        triggers.push(tl.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-night overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-center">
          
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3">
            <SectionHeading
              subtitle="Est. 2016 · Udaipur, Rajasthan"
              title="A Heritage of Royal Dressing"
              className="text-left"
              centered={false}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 space-y-6"
            >
              <p className="font-body text-cream/80 text-lg leading-relaxed">
                Nestled in the heart of Udaipur—the City of Lakes and palaces—Ranaji was born 
                from a singular vision: to dress every groom and bride with the magnificence 
                of Mewari royalty. We are more than a showroom; we are the keepers of a tradition 
                where every thread tells a story of valor, romance, and splendor.
              </p>
              <p className="font-body text-cream/60 leading-relaxed">
                Located in Surajpole, our showroom houses an exclusive collection of sherwanis, 
                poshaks, turbans, and complete wedding ensembles available for purchase and rent.
                We believe that your wedding day is your coronation—and we are honored to dress you for it.
              </p>
            </motion.div>

            <OrnamentalDivider className="my-10" />

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className="font-serif text-4xl md:text-5xl text-gold font-light">
                    {isInView ? (
                      <CountUp end={stat.number} suffix={stat.suffix} />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </div>
                  <p className="font-body text-cream/60 text-sm mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual Cards - 2 columns */}
          <div ref={cardsRef} className="lg:col-span-2 relative h-[500px] md:h-[600px]">
            {/* Card 1 - Sherwani */}
            <div className="legacy-card absolute top-0 left-0 w-48 md:w-56 z-10">
              <div className="relative border-2 border-copper p-2 bg-night shadow-xl">
                <img
                  src="/images/468620690_18338704426195142_1504528542693550564_n.jpg"
                  alt="Sherwani Collection"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-copper text-night px-4 py-1 text-xs font-body uppercase tracking-wider">
                  Sherwanis
                </div>
              </div>
            </div>

            {/* Card 2 - Turban */}
            <div className="legacy-card absolute top-20 right-0 md:right-4 w-44 md:w-52 z-20">
              <div className="relative border-2 border-gold p-2 bg-night shadow-xl">
                <img
                  src="/images/587771552_18385644520195142_1280633816568335167_n.jpg"
                  alt="Turban Collection"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gold text-night px-4 py-1 text-xs font-body uppercase tracking-wider">
                  Turbans
                </div>
              </div>
            </div>

            {/* Card 3 - Bridal */}
            <div className="legacy-card absolute bottom-0 left-8 md:left-12 w-52 md:w-60 z-30">
              <div className="relative border-2 border-crimson p-2 bg-night shadow-xl">
                <img
                  src="/images/57914fa103583fa779bdba247cf59540.jpg"
                  alt="Bridal Collection"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-crimson text-cream px-4 py-1 text-xs font-body uppercase tracking-wider">
                  Bridal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// CountUp component for animated numbers
const CountUp = ({ end, suffix }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <span ref={countRef}>
      {Number.isInteger(end) ? Math.floor(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
};

import { useState } from 'react';

export default LegacySection;

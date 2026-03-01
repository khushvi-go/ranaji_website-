import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

const CollectionCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container with 3D tilt effect */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-b from-night to-night-light border border-gold/10 transition-all duration-500"
        whileHover={{ 
          y: -8,
          boxShadow: '0 25px 50px -12px rgba(222, 160, 68, 0.25)'
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(222,160,68,0.3) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['200% 200%', '-200% -200%'],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-10" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/0 group-hover:border-gold/60 transition-all duration-500 z-10" />

        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          
          {/* Multi-layer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent opacity-70" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-copper/10"
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Shimmer Effect on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            initial={{ x: '-200%' }}
            animate={isHovered ? { x: '200%' } : { x: '-200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          {/* Floating Category Badge */}
          <motion.div
            className="absolute top-4 left-4 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-1.5 bg-night/80 backdrop-blur-sm px-3 py-1.5 border border-gold/30">
              <Crown size={12} className="text-gold" />
              <span className="text-gold font-body text-xs tracking-[0.15em] uppercase">
                {item.category}
              </span>
            </div>
          </motion.div>

          {/* Price Tag - Floating */}
          <motion.div
            className="absolute bottom-4 right-4 z-10"
            animate={isHovered ? { y: -5 } : { y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-night/90 backdrop-blur-sm px-4 py-2 border border-gold/40">
              <span className="font-serif text-xl text-gold">{item.price}</span>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 relative">
          {/* Decorative line */}
          <motion.div 
            className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
            animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0.5, opacity: 0.5 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Name with hover effect */}
          <motion.h3 
            className="font-serif text-xl text-cream mt-2 transition-colors duration-300"
            animate={isHovered ? { x: 5 } : { x: 0 }}
          >
            <span className="group-hover:text-gold transition-colors duration-300">
              {item.name}
            </span>
          </motion.h3>
          
          {/* Description with fade */}
          <motion.p 
            className="font-body text-cream/50 text-sm mt-3 line-clamp-2 leading-relaxed"
            animate={isHovered ? { opacity: 0.8 } : { opacity: 0.5 }}
          >
            {item.description}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CollectionCard;

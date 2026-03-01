import { motion } from 'framer-motion';

const Logo = ({ className = '', size = 'medium', animated = false, hoverAnimated = false }) => {
  const sizes = {
    small: { width: 50, height: 60 },
    medium: { width: 80, height: 96 },
    large: { width: 120, height: 144 },
    xlarge: { width: 200, height: 240 }
  };

  const { width, height } = sizes[size] || sizes.medium;

  // Hover animation variants
  const hoverVariants = {
    initial: { 
      scale: 1, 
      rotate: 0,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    },
    hover: { 
      scale: 1.1, 
      rotate: [0, -5, 5, -5, 0],
      filter: 'drop-shadow(0 6px 12px rgba(222,160,68,0.4))',
      transition: {
        scale: { duration: 0.3 },
        rotate: { duration: 0.6, ease: "easeInOut" },
        filter: { duration: 0.3 }
      }
    },
    tap: { 
      scale: 0.95,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    }
  };

  return (
    <motion.div
      className={className}
      initial={animated ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.img
        src="/images/ranaji logo.ico"
        alt="Ranaji Logo"
        width={width}
        height={height}
        className="object-contain"
        style={{ 
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          maxWidth: '100%',
          height: 'auto'
        }}
        variants={hoverAnimated ? hoverVariants : undefined}
        initial={hoverAnimated ? "initial" : undefined}
        whileHover={hoverAnimated ? "hover" : undefined}
        whileTap={hoverAnimated ? "tap" : undefined}
      />
    </motion.div>
  );
};

export default Logo;

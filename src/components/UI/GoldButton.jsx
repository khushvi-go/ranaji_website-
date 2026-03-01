import { motion } from 'framer-motion';

const GoldButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyles = "relative overflow-hidden px-8 py-3 font-body font-medium tracking-wider uppercase text-sm transition-all duration-300 rounded-sm";
  
  const variants = {
    primary: "border-2 border-gold text-gold hover:text-night hover:bg-gold",
    secondary: "border-2 border-crimson text-crimson hover:text-cream hover:bg-crimson",
    filled: "bg-gold-gradient text-night hover:shadow-gold-lg",
    outline: "border border-gold/50 text-cream hover:border-gold hover:text-gold"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <motion.span
          className="absolute inset-0 bg-gold"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
};

export default GoldButton;

import { motion } from 'framer-motion';

const SectionHeading = ({ 
  title, 
  subtitle,
  centered = true,
  className = ''
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      {subtitle && (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-block text-copper font-body text-sm tracking-[0.3em] uppercase mb-4"
        >
          {subtitle}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream font-light"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-6 ${centered ? 'mx-auto w-32' : 'w-32'}`}
      />
    </div>
  );
};

export default SectionHeading;

import { motion } from 'framer-motion';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`relative px-6 py-2 font-body text-sm tracking-wider uppercase transition-all duration-300 ${
            activeCategory === category.id
              ? 'text-night'
              : 'text-cream/70 hover:text-gold'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active Background */}
          {activeCategory === category.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gold-gradient rounded-sm"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          
          {/* Inactive Border */}
          {activeCategory !== category.id && (
            <div className="absolute inset-0 border border-gold/30 rounded-sm" />
          )}
          
          <span className="relative z-10">{category.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryTabs;

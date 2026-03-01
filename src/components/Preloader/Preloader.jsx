import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MandalaAnimation from './MandalaAnimation';

const Preloader = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if preloader was already shown
    const hasVisited = sessionStorage.getItem('ranaji-visited');
    if (hasVisited) {
      onLoadingComplete();
      return;
    }

    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Show content after brief delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => {
      clearInterval(interval);
      clearTimeout(contentTimer);
    };
  }, [onLoadingComplete]);

  const handleMandalaComplete = () => {
    setIsComplete(true);
    sessionStorage.setItem('ranaji-visited', 'true');
    setTimeout(onLoadingComplete, 800);
  };

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[1000] bg-night flex flex-col items-center justify-center"
        >
          {/* Mandala Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            {progress >= 30 && (
              <MandalaAnimation onComplete={handleMandalaComplete} />
            )}
          </motion.div>

          {/* Logo Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <h1 className="font-devanagari text-5xl md:text-6xl text-gold font-medium tracking-wider">
              रणजी
            </h1>
            <p className="font-body text-cream/70 text-sm tracking-[0.3em] uppercase mt-4">
              An Exclusive Royal Wedding Showroom
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64"
          >
            <div className="h-px bg-gold/20 overflow-hidden">
              <motion.div
                className="h-full bg-gold-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-center text-gold/60 text-xs mt-3 font-body tracking-wider">
              {progress}%
            </p>
          </motion.div>

          {/* Curtain wipe effect */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isComplete ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute inset-0 bg-gold-gradient z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;

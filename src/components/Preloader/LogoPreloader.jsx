import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LogoPreloader = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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
        return prev + 1.5;
      });
    }, 40);

    // Complete loading after animation
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      sessionStorage.setItem('ranaji-visited', 'true');
      setTimeout(onLoadingComplete, 1000);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[1000] bg-night flex flex-col items-center justify-center"
        >
          {/* Background Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(222,160,68,0.3) 0%, transparent 70%)'
            }}
          />

          {/* Logo Container - Using exact logo image */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative z-10"
          >
            <motion.img
              src="/images/ranaji logo.ico"
              alt="Ranaji Logo"
              className="w-48 h-56 md:w-56 md:h-64 object-contain"
              style={{ 
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="font-body text-cream/60 text-sm tracking-[0.3em] uppercase mt-8"
          >
            An Exclusive Royal Wedding Showroom
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64"
          >
            <div className="h-0.5 bg-gold/20 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gold-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <motion.p 
              className="text-center text-gold/60 text-xs mt-3 font-body tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {Math.floor(progress)}%
            </motion.p>
          </motion.div>

          {/* Curtain Reveal Effect */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isComplete ? 1 : 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute inset-0 bg-gold-gradient z-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoPreloader;

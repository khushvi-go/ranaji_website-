import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MandalaAnimation = ({ onComplete }) => {
  const svgRef = useRef(null);
  const pathsRef = useRef([]);

  useEffect(() => {
    const paths = pathsRef.current;
    
    // Set initial state
    gsap.set(paths, { 
      strokeDasharray: 1000,
      strokeDashoffset: 1000 
    });

    // Animate mandala drawing
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 500);
      }
    });

    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
      stagger: 0.1
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <svg
      ref={svgRef}
      width="300"
      height="300"
      viewBox="0 0 300 300"
      className="animate-spin-slow"
    >
      {/* Outer ring */}
      <circle
        ref={el => pathsRef.current[0] = el}
        cx="150"
        cy="150"
        r="140"
        fill="none"
        stroke="#DEA044"
        strokeWidth="1"
        opacity="0.3"
      />
      
      {/* Second ring */}
      <circle
        ref={el => pathsRef.current[1] = el}
        cx="150"
        cy="150"
        r="120"
        fill="none"
        stroke="#BF8250"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Geometric pattern - outer petals */}
      {[...Array(12)].map((_, i) => (
        <path
          key={`petal-${i}`}
          ref={el => pathsRef.current[2 + i] = el}
          d={`M 150 30 Q ${150 + 40 * Math.cos((i * 30 - 90) * Math.PI / 180)} ${30 + 40 * Math.sin((i * 30 - 90) * Math.PI / 180)} ${150 + 60 * Math.cos((i * 30 - 60) * Math.PI / 180)} ${150 + 60 * Math.sin((i * 30 - 60) * Math.PI / 180)} Q ${150 + 40 * Math.cos((i * 30 - 30) * Math.PI / 180)} ${270 + 40 * Math.sin((i * 30 - 30) * Math.PI / 180)} 150 270`}
          fill="none"
          stroke="#DEA044"
          strokeWidth="1"
          opacity="0.6"
          transform={`rotate(${i * 30} 150 150)`}
        />
      ))}
      
      {/* Inner geometric pattern */}
      {[...Array(8)].map((_, i) => (
        <path
          key={`inner-${i}`}
          ref={el => pathsRef.current[14 + i] = el}
          d="M 150 80 L 170 120 L 150 160 L 130 120 Z"
          fill="none"
          stroke="#BF8250"
          strokeWidth="1.5"
          opacity="0.8"
          transform={`rotate(${i * 45} 150 150)`}
        />
      ))}
      
      {/* Center circle */}
      <circle
        ref={el => pathsRef.current[22] = el}
        cx="150"
        cy="150"
        r="30"
        fill="none"
        stroke="#DEA044"
        strokeWidth="2"
      />
      
      {/* Center dot */}
      <circle
        ref={el => pathsRef.current[23] = el}
        cx="150"
        cy="150"
        r="8"
        fill="#DEA044"
      />
    </svg>
  );
};

export default MandalaAnimation;

const JaliBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Jali Pattern SVG */}
      <svg
        className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 opacity-10 animate-spin-slow"
        viewBox="0 0 200 200"
        fill="none"
      >
        <defs>
          <pattern id="jali" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M20 0 L40 20 L20 40 L0 20 Z"
              stroke="#DEA044"
              strokeWidth="0.5"
              fill="none"
            />
            <circle cx="20" cy="20" r="8" stroke="#DEA044" strokeWidth="0.5" fill="none" />
            <path d="M20 0 L20 12 M20 28 L20 40 M0 20 L12 20 M28 20 L40 20" stroke="#DEA044" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#jali)" />
      </svg>

      {/* Second Jali - Bottom Left */}
      <svg
        className="absolute bottom-40 left-10 w-48 h-48 md:w-72 md:h-72 opacity-5 animate-spin-slow"
        style={{ animationDirection: 'reverse', animationDuration: '30s' }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <defs>
          <pattern id="jali2" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M15 0 L30 15 L15 30 L0 15 Z"
              stroke="#BF8250"
              strokeWidth="0.5"
              fill="none"
            />
            <circle cx="15" cy="15" r="5" stroke="#BF8250" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#jali2)" />
      </svg>

      {/* Geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-gold/10 rotate-45 animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-copper/10 rotate-12 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-16 h-16 border border-gold/5 rotate-45 animate-float" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default JaliBackground;

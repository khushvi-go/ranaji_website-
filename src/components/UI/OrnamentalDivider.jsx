const OrnamentalDivider = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-gold"
      >
        <path 
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" 
          fill="currentColor"
          opacity="0.8"
        />
        <circle cx="12" cy="12" r="3" fill="#1C1208" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
    </div>
  );
};

export default OrnamentalDivider;

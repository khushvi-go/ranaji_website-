import { useRef } from 'react';

const MarqueeStrip = () => {
  const containerRef = useRef(null);
  
  const items = [
    'Sherwanis', 'Poshak', 'Jodhpuri Suits', 'Band Gala', 
    'Achkan', 'Rajputi Talwar', 'Saafa & Paag', 'Rajputi Nishan',
    'Rajasthani Handicrafts', 'Anarkali', 'Barati Dress', 'Dulha Look'
  ];

  const renderMarqueeContent = () => (
    <>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-8 mx-8">
          <span className="text-gold font-display text-lg tracking-wider whitespace-nowrap">
            {item}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-copper">
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" />
          </svg>
        </span>
      ))}
    </>
  );

  return (
    <div 
      ref={containerRef}
      className="bg-night py-4 overflow-hidden border-y border-gold/20"
    >
      {/* First row - scrolling left */}
      <div className="flex animate-marquee hover:[animation-play-state:paused]">
        <div className="flex shrink-0">
          {renderMarqueeContent()}
        </div>
        <div className="flex shrink-0">
          {renderMarqueeContent()}
        </div>
      </div>
      
      {/* Second row - scrolling right */}
      <div className="flex animate-marquee-reverse hover:[animation-play-state:paused] mt-2 opacity-60">
        <div className="flex shrink-0">
          {renderMarqueeContent()}
        </div>
        <div className="flex shrink-0">
          {renderMarqueeContent()}
        </div>
      </div>
    </div>
  );
};

export default MarqueeStrip;

import React from 'react';

export default function CarouselDots({ count, activeIndex, onSelect }) {
  if (!count || count < 2) return null;
  return (
    <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`w-3 h-3 rounded-full transition-all ${
            index === activeIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

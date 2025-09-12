import React from 'react';

const baseBtn =
  'absolute top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all';

export default function CarouselArrow({ side = 'left', onClick, ariaLabel }) {
  const isLeft = side === 'left';
  return (
    <button
      onClick={onClick}
      className={`${baseBtn} ${isLeft ? 'left-4' : 'right-4'}`}
      aria-label={ariaLabel || (isLeft ? 'Previous slide' : 'Next slide')}
    >
      {isLeft ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
